#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { mvpCommand } from './commands/mvp.js';
import { integrationCommand } from './commands/integration.js';
import { frontendCommand } from './commands/frontend.js';
import { backendCommand } from './commands/backend.js';
import { exampleCommand } from './commands/example.js';

const program = new Command();

program
  .name('overnight-mvp')
  .description('AI-powered MVP builder that transforms ideas into deployed applications in under an hour')
  .version('1.0.0');

program
  .command('mvp')
  .description('Start an interactive MVP builder session')
  .option('-o, --output <file>', 'Save the MVP specification to a file')
  .option('--model <model>', 'Bedrock model to use', 'anthropic.claude-3-5-sonnet-20241022-v2:0')
  .option('--name <name>')
  .option('--description <description>')
  .action(mvpCommand);



program
  .command('integration')
  .description('Generate integration prompt for connecting frontend to backend with deployment')
  .option('-o, --output <file>', 'Save the prompt to a file')
  .option('--shortname <shortname>')
  .action(integrationCommand);

program
  .command('frontend')
  .description('Generate frontend implementation prompt with interactive design session')
  .option('-o, --output <file>', 'Save the prompt to a file')
  .option('--model <model>', 'Bedrock model to use', 'anthropic.claude-3-5-sonnet-20241022-v2:0')
  .option('--shortname <shortname>')
  .action(frontendCommand);

program
  .command('backend')
  .description('Generate backend implementation prompt for AWS Lambda + DynamoDB')
  .option('-o, --output <file>', 'Save the prompt to a file')
  .option('--model <model>', 'Bedrock model to use', 'anthropic.claude-3-5-sonnet-20241022-v2:0')
  .option('--shortname <shortname>')
  .action(backendCommand);

program
  .command('example')
  .description('Generate example MVP with all specifications and prompts')
  .option('--output-dir <dir>', 'Output directory for example files', 'mvps/example-mvp')
  .action(exampleCommand);

program.addHelpText('after', `
${chalk.bold('Examples:')}
  $ overnight-mvp mvp                     # Start interactive MVP builder
  $ overnight-mvp frontend                # Generate frontend (interactive selection)
  $ overnight-mvp backend                 # Generate backend (interactive selection)
  $ overnight-mvp integration             # Generate integration deployment prompt

${chalk.bold('Workflow Steps:')}
  1. ${chalk.cyan('MVP')} - Create MVP specification with name and description
  2. ${chalk.cyan('Frontend')} - Design and generate frontend with Lovable.dev
  3. ${chalk.cyan('Backend')} - Generate backend with AWS Q Developer
  4. ${chalk.cyan('Integration')} - Connect frontend to backend with deployment setup

${chalk.bold('Using Make Commands:')}
  $ make mvp                              # Create new MVP specification
  $ make frontend                         # Generate frontend (interactive)
  $ make backend                          # Generate backend (interactive)
  $ make integration                      # Generate integration deployment prompt
`);

program.parse();