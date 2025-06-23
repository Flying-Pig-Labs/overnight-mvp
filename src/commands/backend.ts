import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import yaml from 'yaml';
import path from 'path';
import { listAvailableMVPs, resolveMVPName } from '../lib/mvp-resolver.js';

interface BackendOptions {
  output?: string;
  model: string;
  shortname?: string;
}

export async function backendCommand(options: BackendOptions) {
  console.log(chalk.bold.cyan('\n⚙️  Backend Architecture Generation\n'));
  
  try {
    // Get list of available MVPs
    const availableMVPs = await listAvailableMVPs();
    const nonExampleMVPs = availableMVPs.filter(mvp => mvp !== 'example-mvp');
    
    // Skip the check if using --shortname (allows testing with example-mvp)
    if (!options.shortname && nonExampleMVPs.length === 0) {
      console.log(chalk.yellow('No MVPs found. Please run "make mvp" first to create an MVP.'));
      return;
    }

    // Select MVP
    let selectedMVP: string;
    if (options.shortname) {
      // When using shortname, check against all MVPs (including example-mvp)
      if (!availableMVPs.includes(options.shortname)) {
        console.error(chalk.red(`MVP '${options.shortname}' not found.`));
        console.log(chalk.gray('Available MVPs:'));
        availableMVPs.forEach(mvp => console.log(chalk.gray(`  - ${mvp}`)));
        return;
      }
      selectedMVP = options.shortname;
    } else {
      const { mvpChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'mvpChoice',
          message: 'Which MVP do you want to create a backend for?',
          choices: nonExampleMVPs
        }
      ]);
      selectedMVP = mvpChoice;
    }

    const mvpPaths = await resolveMVPName(selectedMVP);
    console.log(chalk.gray(`\nGenerating backend for: ${chalk.bold(selectedMVP)}`));
    
    // Check if backend spec already exists
    if (existsSync(mvpPaths.backspecPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow('Backend specification already exists. Overwrite?'),
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.gray('Backend generation cancelled.'));
        return;
      }
    }

    console.log(chalk.gray('Generating serverless backend specification for AWS Lambda + DynamoDB + API Gateway'));

    const spinner = ora('Processing MVP specification...').start();

    try {
      // Ensure prompts directory exists
      await mkdir(mvpPaths.promptsDir, { recursive: true });
      
      // Load the mvpspec
      const specContent = await readFile(mvpPaths.mvpspecPath, 'utf-8');
      const mvpSpec = yaml.parse(specContent);

      // Load backend prompt template
      const promptPath = path.join(process.cwd(), 'prompts', '5-backend-implementation-prompt.md');
      const promptTemplate = await readFile(promptPath, 'utf-8');

      // Generate backend specification
      const backSpec = generateBackendSpec(mvpSpec);
      
      // Generate Amazon Q Developer prompt
      const prompt = generateBackendPrompt(mvpSpec, backSpec, promptTemplate);

      // Save the prompt to prompts directory first
      await writeFile(mvpPaths.backendMakePromptPath, prompt);

      // Save outputs
      const outputPath = options.output || mvpPaths.backendPromptPath;
      const backSpecPath = mvpPaths.backspecPath;
      
      await writeFile(outputPath, prompt);
      await writeFile(backSpecPath, yaml.stringify(backSpec));
      
      spinner.succeed(chalk.green('✅ Backend specification complete!'));
      
      console.log(chalk.bold.cyan('\n📋 Generated Files:'));
      console.log(chalk.gray(`- Backend Specification: ${backSpecPath}`));
      console.log(chalk.gray(`- Amazon Q Prompt: ${outputPath}`));
      console.log(chalk.bold.cyan('\n🚀 Next Steps:'));
      console.log(chalk.gray('1. Open Amazon Q Developer in your IDE'));
      console.log(chalk.gray('2. Copy the prompt from ' + outputPath));
      console.log(chalk.gray('3. Let Q generate your serverless backend'));
      console.log(chalk.gray('4. Deploy with "sam deploy" or "cdk deploy"\n'));

    } catch (error) {
      spinner.fail(chalk.red('Failed to generate backend specification'));
      throw error;
    }

  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

function generateBackendSpec(mvpSpec: any): any {
  const tables = generateDynamoTables(mvpSpec.data_model);
  const lambdas = generateLambdaFunctions(mvpSpec.features);
  
  return {
    name: `${mvpSpec.name} Backend`,
    architecture: 'Serverless (Lambda + DynamoDB + API Gateway)',
    runtime: 'Node.js 20.x',
    database: {
      type: 'DynamoDB',
      tables: tables
    },
    lambdas: lambdas,
    api_gateway: {
      type: 'REST',
      cors: true,
      authorization: 'API Key',
      throttling: {
        rate_limit: 1000,
        burst_limit: 2000
      }
    },
    infrastructure: {
      iac: 'AWS SAM',
      monitoring: 'CloudWatch',
      tracing: 'X-Ray'
    }
  };
}

function generateDynamoTables(dataModel: any): any[] {
  if (!dataModel) return [];
  
  const tables: any[] = [];
  
  Object.entries(dataModel).forEach(([modelName, fields]: [string, any]) => {
    const table: any = {
      name: `${capitalizeFirst(modelName)}s`,
      partition_key: 'userId',
      sort_key: `${modelName}Id`,
      attributes: fields.filter((f: string) => !f.includes('id')),
      indexes: []
    };

    // Add indexes based on common patterns
    if (fields.some((f: string) => f.includes('category'))) {
      table.indexes.push({
        name: 'CategoryIndex',
        partition_key: 'categoryId',
        sort_key: 'createdAt'
      });
    }

    if (fields.some((f: string) => f.includes('status'))) {
      table.indexes.push({
        name: 'StatusIndex',
        partition_key: 'status',
        sort_key: 'updatedAt'
      });
    }

    tables.push(table);
  });

  return tables;
}

function generateLambdaFunctions(features: any[]): any[] {
  const lambdas: any[] = [];
  
  features.forEach(feature => {
    if (!feature.endpoints) return;
    
    const resourceName = feature.name.replace(/\s+/g, '');
    
    feature.endpoints.forEach((endpoint: any) => {
      const functionName = generateFunctionName(endpoint.method, endpoint.path, resourceName);
      
      lambdas.push({
        name: functionName,
        handler: `handlers/${resourceName.toLowerCase()}.${functionName.charAt(0).toLowerCase() + functionName.slice(1)}`,
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        environment: {
          TABLE_NAME: `${resourceName}s`
        }
      });
    });
  });

  return lambdas;
}

function generateFunctionName(method: string, path: string, resource: string): string {
  const baseNames: { [key: string]: string } = {
    'GET': path.includes('{') ? `Get${resource}` : `List${resource}s`,
    'POST': `Create${resource}`,
    'PUT': `Update${resource}`,
    'DELETE': `Delete${resource}`,
    'PATCH': `Patch${resource}`
  };
  
  return baseNames[method] || `${method}${resource}`;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateBackendPrompt(mvpSpec: any, backSpec: any, promptTemplate: string): string {
  // Replace variables in the prompt template
  const prompt = promptTemplate
    .replace(/{{mvpName}}/g, mvpSpec.name)
    .replace(/{{mvpDescription}}/g, mvpSpec.description)
    .replace(/{{runtime}}/g, backSpec.runtime)
    .replace(/{{databaseType}}/g, backSpec.database.type)
    .replace(/{{apiType}}/g, backSpec.api_gateway.type)
    .replace(/{{iac}}/g, backSpec.infrastructure.iac)
    .replace(/{{monitoring}}/g, backSpec.infrastructure.monitoring)
    .replace(/{{tracing}}/g, backSpec.infrastructure.tracing)
    .replace(/{{tables}}/g, backSpec.database.tables.map((table: any) => `#### ${table.name} Table
- **Partition Key**: ${table.partition_key} (String)
- **Sort Key**: ${table.sort_key} (String)
- **Attributes**: ${table.attributes.map((attr: string) => {
  const [name, type] = attr.split(':').map(s => s.trim());
  return `\n  - ${name} (${type || 'String'})`;
}).join('')}
${table.indexes.length > 0 ? `- **Global Secondary Indexes**:${table.indexes.map((idx: any) => `
  - ${idx.name}: PK=${idx.partition_key}, SK=${idx.sort_key}`).join('')}` : ''}`).join('\n\n'))
    .replace(/{{lambdas}}/g, backSpec.lambdas.map((lambda: any) => `#### ${lambda.name}
- **Handler**: ${lambda.handler}
- **HTTP Method**: ${lambda.method}
- **Path**: ${lambda.path}
- **Description**: ${lambda.description}
- **Environment Variables**:
  - TABLE_NAME: ${lambda.environment.TABLE_NAME}`).join('\n\n'))
    .replace(/{{cors}}/g, backSpec.api_gateway.cors ? 'Enabled for all origins' : 'Disabled')
    .replace(/{{authorization}}/g, backSpec.api_gateway.authorization)
    .replace(/{{rateLimit}}/g, backSpec.api_gateway.throttling.rate_limit)
    .replace(/{{burstLimit}}/g, backSpec.api_gateway.throttling.burst_limit)
    .replace(/{{features}}/g, mvpSpec.features.map((feature: any) => `### ${feature.name}
${feature.description}

**Required Endpoints:**
${feature.endpoints ? feature.endpoints.map((e: any) => `- ${e.method} ${e.path} - ${e.description}`).join('\n') : 'No endpoints defined'}`).join('\n\n'));

  return prompt;
}