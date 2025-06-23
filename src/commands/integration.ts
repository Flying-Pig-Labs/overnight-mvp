import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import yaml from 'yaml';
import path from 'path';
import { listAvailableMVPs, resolveMVPName } from '../lib/mvp-resolver.js';

interface IntegrationOptions {
  output?: string;
  shortname?: string;
}

interface NetworkingSpec {
  apiGateway: {
    url: string;
    stage: string;
    region: string;
  };
  cloudFront?: {
    distributionId: string;
    domainName: string;
  };
  authentication?: {
    type: string;
    details: any;
  };
}

export async function integrationCommand(options: IntegrationOptions) {
  console.log(chalk.bold.cyan('\n🔗 Generating Integration Deployment Prompt\n'));

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
          message: 'Which MVP do you want to create an integration prompt for?',
          choices: nonExampleMVPs
        }
      ]);
      selectedMVP = mvpChoice;
    }

    const mvpPaths = await resolveMVPName(selectedMVP);
    console.log(chalk.gray(`\nGenerating integration prompt for: ${chalk.bold(selectedMVP)}`));

    // Check if required specs exist
    if (!existsSync(mvpPaths.mvpspecPath)) {
      console.error(chalk.red('MVP specification not found. Please run "make mvp" first.'));
      return;
    }

    if (!existsSync(mvpPaths.backspecPath)) {
      console.error(chalk.red('Backend specification not found. Please run "make backend" first.'));
      return;
    }

    // Load specifications
    const mvpSpec = yaml.parse(await readFile(mvpPaths.mvpspecPath, 'utf-8'));
    const backSpec = yaml.parse(await readFile(mvpPaths.backspecPath, 'utf-8'));
    
    // Load networking spec (must exist)
    const networkingSpecPath = path.join(mvpPaths.mvpDir, 'networking-spec.yaml');
    
    if (!existsSync(networkingSpecPath)) {
      console.error(chalk.red('Networking specification not found. Please ensure networking-spec.yaml exists.'));
      console.log(chalk.gray('This file should contain the backend deployment details (API Gateway URL, etc.)'));
      return;
    }
    
    console.log(chalk.gray('Loading networking specification...'));
    const networkingSpec: NetworkingSpec = yaml.parse(await readFile(networkingSpecPath, 'utf-8'));

    // Ensure prompts directory exists
    await mkdir(mvpPaths.promptsDir, { recursive: true });

    // Generate the integration prompt
    const integrationPrompt = generateIntegrationPrompt(mvpSpec, backSpec, networkingSpec);
    
    // Determine output path
    const outputPath = options.output || path.join(mvpPaths.promptsDir, 'integration-prompt.txt');
    
    await writeFile(outputPath, integrationPrompt);
    console.log(chalk.green(`\n✅ Integration prompt saved to ${outputPath}`));
    
    console.log(chalk.bold.cyan('\n📋 Generated Files:'));
    console.log(chalk.gray(`- Integration Prompt: ${outputPath}`));
    
    console.log(chalk.bold.cyan('\n🚀 Next Steps:'));
    console.log(chalk.gray('1. Copy the integration prompt to Claude'));
    console.log(chalk.gray('2. Update the frontend to use the real backend'));
    console.log(chalk.gray('3. Deploy to S3/CloudFront'));
    console.log(chalk.gray('4. Your app will be live!\n'));
    
    console.log(chalk.bold('Preview of generated prompt:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(integrationPrompt.substring(0, 500) + '...');
    console.log(chalk.gray('─'.repeat(50)));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate integration prompt:'), error);
    process.exit(1);
  }
}

function generateIntegrationPrompt(mvpSpec: any, backSpec: any, networkingSpec: NetworkingSpec): string {
  const repoName = mvpSpec.name.toLowerCase().replace(/\s+/g, '-');
  
  return `I have a frontend application that needs to be integrated with a deployed AWS backend and then deployed to AWS S3/CloudFront.

## Context

**Application**: ${mvpSpec.name}
**Description**: ${mvpSpec.description}
**Frontend Repository**: https://github.com/[owner]/${repoName}

## Backend Details (Already Deployed)

The backend has been deployed with the following specifications:

### API Gateway
- **Base URL**: ${networkingSpec.apiGateway.url}/${networkingSpec.apiGateway.stage}
- **Region**: ${networkingSpec.apiGateway.region}
- **Authentication**: ${networkingSpec.authentication?.type || 'None'}
${networkingSpec.authentication?.type === 'apiKey' ? `- **API Key Header**: ${networkingSpec.authentication.details.headerName}` : ''}

### Lambda Functions
${backSpec.lambdas.map((lambda: any) => `- **${lambda.name}**: ${lambda.method} ${lambda.path}`).join('\n')}

### DynamoDB Tables
${backSpec.database.tables.map((table: any) => `- **${table.name}**: PK=${table.partition_key}, SK=${table.sort_key}`).join('\n')}

## Tasks

### 1. Update Frontend to Use Real Backend

Update all API calls in the frontend to:
- Use the actual API Gateway URL: ${networkingSpec.apiGateway.url}/${networkingSpec.apiGateway.stage}
- Include proper authentication headers
- Handle CORS properly
- Update environment variables

**Required Changes:**
- Update \`.env\` or environment configuration
- Modify all API client configurations
- Test all endpoints to ensure they work with the real backend

### 2. Deploy Frontend to AWS S3/CloudFront

Create AWS CDK infrastructure for:

#### S3 Bucket Configuration
- Private bucket (no public access)
- Configured for static website hosting
- Proper bucket policies for CloudFront access

#### CloudFront Distribution
- Origin Access Control (OAC) for secure S3 access
- Custom error pages for SPA routing (404 → index.html)
- HTTPS only
- Caching optimization for static assets
- Compression enabled
${networkingSpec.cloudFront ? `- Use existing distribution if needed: ${networkingSpec.cloudFront.domainName}` : ''}

#### Build and Deployment
- Detect the frontend framework (React/Vite, Next.js, etc.)
- Set up proper build commands
- Configure environment variables:
  - VITE_API_URL=${networkingSpec.apiGateway.url}/${networkingSpec.apiGateway.stage}
  - VITE_API_KEY=${networkingSpec.authentication?.type === 'apiKey' ? '[SECURE_API_KEY]' : 'N/A'}
- Create deployment scripts

#### GitHub Actions Workflow
- Trigger on push to main branch
- Build the frontend application
- Upload to S3 using \`aws s3 sync\`
- Invalidate CloudFront cache
- Support for staging/production environments

## Project Structure Expected

\`\`\`
${repoName}/
├── cdk/
│   ├── bin/
│   │   └── app.ts
│   ├── lib/
│   │   └── frontend-stack.ts
│   ├── cdk.json
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml
├── scripts/
│   └── deploy.sh
├── .env.example
└── README.md (with setup instructions)
\`\`\`

## Implementation Notes

1. **Environment Variables**: 
   - Ensure all API URLs point to the real backend
   - Use GitHub Secrets for sensitive values like API keys
   
2. **CORS Configuration**:
   - The backend should already have CORS configured
   - Frontend should send proper headers

3. **Error Handling**:
   - Remove any mock data returns
   - Implement proper error states for failed API calls

4. **Testing**:
   - Test each endpoint integration
   - Verify authentication works correctly
   - Check error handling

Please analyze the repository, update the frontend to use the real backend, and create all necessary files for S3/CloudFront deployment.`;
}