import { writeFile } from 'fs/promises';
import chalk from 'chalk';

interface S3SiteOptions {
  repo: string;
  output: string;
  copy?: boolean;
}

export async function s3SiteCommand(options: S3SiteOptions) {
  console.log(chalk.bold.cyan('\n☁️  Generating S3/CloudFront Deployment Prompt\n'));

  if (!options.repo) {
    console.error(chalk.red('❌ Please provide a GitHub repository URL with --repo'));
    process.exit(1);
  }

  try {
    const deploymentPrompt = generateS3DeploymentPrompt(options.repo);
    
    await writeFile(options.output, deploymentPrompt);
    console.log(chalk.green(`✅ Deployment prompt saved to ${options.output}`));
    
    if (options.copy) {
      console.log(chalk.yellow('📋 Note: Copy to clipboard not implemented. Please copy from the file.'));
    }
    
    console.log(chalk.bold.cyan('\n📝 Claude Code Instructions:'));
    console.log(chalk.gray('1. Open a new Claude Code conversation'));
    console.log(chalk.gray('2. Paste the generated prompt'));
    console.log(chalk.gray('3. Let Claude Code set up your infrastructure'));
    console.log(chalk.gray('4. Follow the deployment instructions\n'));
    
    console.log(chalk.bold('Preview of generated prompt:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(deploymentPrompt.substring(0, 500) + '...');
    console.log(chalk.gray('─'.repeat(50)));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate deployment prompt:'), error);
    process.exit(1);
  }
}

function generateS3DeploymentPrompt(repoUrl: string): string {
  // Extract repo name from URL
  const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'frontend-app';
  
  return `I have a frontend application in this GitHub repository: ${repoUrl}

Please help me deploy it to AWS S3 with CloudFront CDN. I need:

## Infrastructure Setup (using AWS CDK in TypeScript)

1. **S3 Bucket Configuration**
   - Private bucket (no public access)
   - Configured for static website hosting
   - Proper bucket policies for CloudFront access

2. **CloudFront Distribution**
   - Origin Access Control (OAC) for secure S3 access
   - Custom error pages for SPA routing (404 → index.html)
   - HTTPS only
   - Caching optimization for static assets
   - Compression enabled

3. **Build and Deployment**
   - Detect the frontend framework (React/Vite, Next.js, etc.)
   - Set up proper build commands
   - Configure environment variables (especially VITE_API_URL or NEXT_PUBLIC_API_URL)
   - Create deployment scripts

4. **GitHub Actions Workflow**
   - Trigger on push to main branch
   - Build the frontend application
   - Upload to S3 using \`aws s3 sync\`
   - Invalidate CloudFront cache
   - Support for staging/production environments

5. **Optional: Custom Domain**
   - Route 53 configuration (if domain provided)
   - ACM certificate in us-east-1
   - CloudFront alias configuration

## Project Structure Expected

\`\`\`
${repoName}/
├── cdk/
│   ├── bin/
│   │   └── app.ts
│   ├── lib/
│   │   ├── frontend-stack.ts
│   │   └── certificate-stack.ts (if custom domain)
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

## Requirements

- The CDK code should be production-ready with proper error handling
- Include cost estimates in comments
- Make the stack reusable and parameterized
- Include rollback procedures
- Set up CloudWatch alarms for 4xx/5xx errors

## Environment Variables

The frontend needs these environment variables:
- VITE_API_URL or NEXT_PUBLIC_API_URL: The backend API endpoint
- Any other app-specific variables

Please analyze the repository, detect the framework, and create all necessary files for deployment.

Repository: ${repoUrl}`;
}