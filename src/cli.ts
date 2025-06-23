#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { chatCommand } from './commands/chat.js';
import { runCommand } from './commands/run.js';
import { analyzeCommand } from './commands/analyze.js';
import { deployCommand } from './commands/deploy.js';
import { lovableCommand } from './commands/lovable.js';
import { s3SiteCommand } from './commands/s3-site.js';

const program = new Command();

program
  .name('overnight-mvp')
  .description('AI-powered MVP builder that transforms ideas into deployed applications in under an hour')
  .version('1.0.0');

program
  .command('chat')
  .description('Start an interactive chat session to describe your MVP')
  .option('-o, --output <file>', 'Save the MVP specification to a file', 'mvp-spec.yaml')
  .option('--model <model>', 'Bedrock model to use', 'anthropic.claude-3-5-sonnet-20241022-v2:0')
  .action(chatCommand);

program
  .command('run')
  .description('Run the complete MVP workflow from a specification')
  .argument('<spec>', 'Path to the MVP specification file')
  .option('--skip-frontend', 'Skip frontend generation')
  .option('--skip-backend', 'Skip backend generation')
  .option('--dry-run', 'Show what would be done without executing')
  .action(runCommand);

program
  .command('analyze')
  .description('Analyze a frontend to extract API requirements')
  .argument('<frontend-path>', 'Path to the frontend code')
  .option('-o, --output <file>', 'Output file for API specification', 'api-spec.yaml')
  .action(analyzeCommand);

program
  .command('deploy')
  .description('Deploy the MVP to AWS')
  .argument('<project-path>', 'Path to the project directory')
  .option('--frontend-only', 'Deploy only the frontend')
  .option('--backend-only', 'Deploy only the backend')
  .option('--stage <stage>', 'Deployment stage', 'prod')
  .action(deployCommand);

program
  .command('lovable')
  .description('Generate a Lovable.dev prompt from an MVP specification')
  .argument('<spec>', 'Path to the MVP specification file')
  .option('-o, --output <file>', 'Save the prompt to a file', 'lovable-prompt.txt')
  .option('--copy', 'Copy the prompt to clipboard')
  .action(lovableCommand);

program
  .command('s3-site')
  .description('Generate CloudFront/S3 deployment instructions for a GitHub repo')
  .option('-r, --repo <url>', 'GitHub repository URL', '')
  .option('-o, --output <file>', 'Save the prompt to a file', 's3-deployment-prompt.txt')
  .option('--copy', 'Copy the prompt to clipboard')
  .action(s3SiteCommand);

program.addHelpText('after', `
${chalk.bold('Examples:')}
  $ overnight-mvp chat                    # Start interactive MVP builder
  $ overnight-mvp run mvp-spec.yaml       # Run complete workflow
  $ overnight-mvp analyze ./frontend      # Extract API requirements
  $ overnight-mvp deploy ./my-project     # Deploy to AWS

${chalk.bold('Workflow Steps:')}
  1. ${chalk.cyan('Chat')} - Describe your MVP idea in natural language
  2. ${chalk.cyan('Generate')} - Create frontend with Lovable.dev
  3. ${chalk.cyan('Analyze')} - Extract API requirements from frontend
  4. ${chalk.cyan('Build')} - Generate backend with AWS Q Developer
  5. ${chalk.cyan('Deploy')} - Deploy full stack to AWS
`);

program.parse();