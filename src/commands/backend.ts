import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile } from 'fs/promises';
import yaml from 'yaml';
import path from 'path';

interface BackendOptions {
  output?: string;
  model: string;
}

export async function backendCommand(specPath: string, options: BackendOptions) {
  console.log(chalk.bold.cyan('\n⚙️  Backend Architecture Generation\n'));
  console.log(chalk.gray('Generating serverless backend specification for AWS Lambda + DynamoDB + API Gateway'));

  const spinner = ora('Processing MVP specification...').start();

  try {
    // Load the bigspec
    const specContent = await readFile(specPath, 'utf-8');
    const bigSpec = yaml.parse(specContent);

    // Generate backend specification
    const backSpec = generateBackendSpec(bigSpec);
    
    // Generate Amazon Q Developer prompt
    const prompt = generateBackendPrompt(bigSpec, backSpec);

    // Save outputs
    const outputPath = options.output || path.join(path.dirname(specPath), 'backend-prompt.txt');
    const backSpecPath = path.join(path.dirname(specPath), 'backspec.yaml');
    
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
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

function generateBackendSpec(bigSpec: any): any {
  const tables = generateDynamoTables(bigSpec.data_model);
  const lambdas = generateLambdaFunctions(bigSpec.features);
  
  return {
    name: `${bigSpec.name} Backend`,
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

function generateBackendPrompt(bigSpec: any, backSpec: any): string {
  return `# ${bigSpec.name} - Serverless Backend Implementation

Create a production-ready serverless backend using AWS Lambda, DynamoDB, and API Gateway.

## Project Overview
${bigSpec.description}

## Architecture Requirements

### Core Technologies
- **Runtime**: ${backSpec.runtime}
- **Database**: ${backSpec.database.type}
- **API**: ${backSpec.api_gateway.type} API Gateway
- **IaC**: ${backSpec.infrastructure.iac}
- **Monitoring**: ${backSpec.infrastructure.monitoring}
- **Tracing**: ${backSpec.infrastructure.tracing}

### DynamoDB Tables

${backSpec.database.tables.map((table: any) => `#### ${table.name} Table
- **Partition Key**: ${table.partition_key} (String)
- **Sort Key**: ${table.sort_key} (String)
- **Attributes**: ${table.attributes.map((attr: string) => {
  const [name, type] = attr.split(':').map(s => s.trim());
  return `\n  - ${name} (${type || 'String'})`;
}).join('')}
${table.indexes.length > 0 ? `- **Global Secondary Indexes**:${table.indexes.map((idx: any) => `
  - ${idx.name}: PK=${idx.partition_key}, SK=${idx.sort_key}`).join('')}` : ''}`).join('\n\n')}

### Lambda Functions

${backSpec.lambdas.map((lambda: any) => `#### ${lambda.name}
- **Handler**: ${lambda.handler}
- **HTTP Method**: ${lambda.method}
- **Path**: ${lambda.path}
- **Description**: ${lambda.description}
- **Environment Variables**:
  - TABLE_NAME: ${lambda.environment.TABLE_NAME}`).join('\n\n')}

### API Gateway Configuration

- **Type**: ${backSpec.api_gateway.type}
- **CORS**: ${backSpec.api_gateway.cors ? 'Enabled for all origins' : 'Disabled'}
- **Authorization**: ${backSpec.api_gateway.authorization}
- **Rate Limiting**: ${backSpec.api_gateway.throttling.rate_limit} requests/second
- **Burst Limit**: ${backSpec.api_gateway.throttling.burst_limit} requests

## Implementation Requirements

### 1. Project Structure
\`\`\`
backend/
├── template.yaml          # SAM template
├── package.json
├── tsconfig.json
├── src/
│   ├── handlers/         # Lambda function handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── utils/            # Shared utilities
│   └── types/            # TypeScript types
└── tests/                # Unit and integration tests
\`\`\`

### 2. Lambda Function Implementation

Each Lambda function should:
- Use TypeScript for type safety
- Implement proper error handling with meaningful error messages
- Include input validation using a library like Joi or Zod
- Return consistent response formats
- Include correlation IDs for request tracing
- Implement proper logging using structured logs

### 3. DynamoDB Best Practices

- Use single-table design where appropriate
- Implement optimistic locking for updates
- Use batch operations for bulk actions
- Implement proper pagination using LastEvaluatedKey
- Design partition keys to avoid hot partitions
- Use transactions for atomic operations

### 4. Security Requirements

- Implement least-privilege IAM roles
- Use environment variables for configuration
- Enable API Gateway request validation
- Implement rate limiting per API key
- Use AWS Secrets Manager for sensitive data
- Enable AWS WAF for additional protection

### 5. Error Handling

Implement consistent error responses:
\`\`\`json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": {...},
    "correlationId": "uuid"
  }
}
\`\`\`

### 6. Monitoring & Observability

- CloudWatch Logs for all Lambda functions
- Custom CloudWatch metrics for business KPIs
- X-Ray tracing for performance monitoring
- CloudWatch alarms for error rates and latencies
- Structured logging with JSON format

### 7. Testing Strategy

- Unit tests for all business logic
- Integration tests for API endpoints
- Load testing configuration
- Local testing with SAM CLI

### 8. Deployment Configuration

Include in template.yaml:
- API Gateway stage variables
- Lambda environment configurations
- DynamoDB provisioned throughput settings
- CloudWatch log retention policies
- API usage plans and API keys

### 9. Sample Code Structure

For each Lambda handler:
\`\`\`typescript
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (event) => {
  // Implementation
};
\`\`\`

## Features to Implement

${bigSpec.features.map((feature: any) => `### ${feature.name}
${feature.description}

**Required Endpoints:**
${feature.endpoints ? feature.endpoints.map((e: any) => `- ${e.method} ${e.path} - ${e.description}`).join('\n') : 'No endpoints defined'}`).join('\n\n')}

## Deliverables

1. Complete SAM template (template.yaml)
2. All Lambda function implementations
3. DynamoDB table definitions
4. API Gateway configuration
5. IAM roles and policies
6. Environment configuration files
7. Deployment scripts
8. README with setup instructions

Please generate a complete, production-ready serverless backend that can be deployed immediately using SAM CLI.`;
}