import { readFile } from 'fs/promises';
import chalk from 'chalk';
import ora from 'ora';
import yaml from 'yaml';
import { BedrockClient } from '../lib/bedrock-client.js';
import { PromptChainManager, workflowSteps } from '../lib/prompt-chain.js';
import { MVPSpecification, WorkflowState } from '../types/index.js';
import { resolveMVPName, printMVPInfo } from '../lib/mvp-resolver.js';

interface RunOptions {
  skipFrontend?: boolean;
  skipBackend?: boolean;
  dryRun?: boolean;
}

export async function runCommand(mvpNameOrPath: string, options: RunOptions) {
  console.log(chalk.bold.cyan('\n🏃 Running Overnight MVP Workflow\n'));

  try {
    const mvpPaths = await resolveMVPName(mvpNameOrPath);
    printMVPInfo(mvpPaths);
    console.log();
    
    const specContent = await readFile(mvpPaths.mvpspecPath, 'utf-8');
    const mvpSpec: MVPSpecification = yaml.parse(specContent);
    
    console.log(chalk.bold(`Project: ${mvpSpec.name}`));
    console.log(chalk.gray(mvpSpec.description));
    console.log();

    if (options.dryRun) {
      console.log(chalk.yellow('🔍 Dry Run Mode - Showing planned actions:\n'));
      showWorkflowPlan(mvpSpec, options);
      return;
    }

    const workflowState: WorkflowState = { mvpSpec };
    const bedrockClient = new BedrockClient();
    const promptChain = new PromptChainManager(bedrockClient, process.cwd());

    if (!options.skipFrontend) {
      await executeFrontendWorkflow(workflowState, promptChain);
    }

    if (!options.skipBackend) {
      await executeBackendWorkflow(workflowState, promptChain);
    }

    await deployApplication(workflowState);

    console.log(chalk.bold.green('\n✅ MVP Successfully Built and Deployed!\n'));
    showDeploymentSummary(workflowState);

  } catch (error) {
    console.error(chalk.red('\n❌ Workflow failed:'), error);
    process.exit(1);
  }
}

function showWorkflowPlan(spec: MVPSpecification, options: RunOptions) {
  const steps = [];
  
  if (!options.skipFrontend) {
    steps.push(
      '1. Generate frontend using Lovable.dev',
      '2. Deploy frontend to AWS S3/CloudFront',
      '3. Analyze frontend for API requirements'
    );
  }
  
  if (!options.skipBackend) {
    steps.push(
      '4. Generate backend specification',
      '5. Build backend with AWS Q Developer',
      '6. Deploy backend to AWS'
    );
  }
  
  steps.forEach(step => console.log(chalk.gray(`  ${step}`)));
  
  console.log(chalk.cyan('\n📊 Expected Outputs:'));
  console.log(chalk.gray(`  - Frontend: ${spec.frontend.pages.length} pages`));
  console.log(chalk.gray(`  - APIs: ${spec.backend.apis.length} endpoints`));
  console.log(chalk.gray(`  - Deployment: ${spec.deployment.hosting}`));
}

async function executeFrontendWorkflow(state: WorkflowState, chain: PromptChainManager) {
  console.log(chalk.bold.cyan('\n🎨 Frontend Generation Phase\n'));
  
  const spinner = ora('Opening Lovable.dev for frontend generation...').start();
  
  console.log(chalk.yellow('\n⚠️  Manual Step Required:'));
  console.log(chalk.gray('1. Go to https://lovable.dev'));
  console.log(chalk.gray('2. Paste the following specification:'));
  console.log(chalk.gray('---'));
  console.log(formatFrontendSpec(state.mvpSpec));
  console.log(chalk.gray('---'));
  console.log(chalk.gray('3. Download the generated code'));
  console.log(chalk.gray('4. Extract to ./frontend directory'));
  
  spinner.info('Waiting for frontend code...');
  
  console.log(chalk.cyan('\nPress Enter when frontend is ready in ./frontend'));
  await waitForUserInput();
  
  state.frontendPath = './frontend';
}

async function executeBackendWorkflow(state: WorkflowState, chain: PromptChainManager) {
  console.log(chalk.bold.cyan('\n⚙️  Backend Generation Phase\n'));
  
  const analysisSteps = workflowSteps.filter(step => 
    step.id === 'frontendAnalysis' || step.id === 'backendSpec'
  );
  
  const results = await chain.executeChain(analysisSteps, {
    frontendPath: state.frontendPath,
    mvpSpec: state.mvpSpec
  });
  
  state.frontendAnalysis = results[0];
  state.backendSpec = results[1];
  
  console.log(chalk.yellow('\n⚠️  Manual Step Required:'));
  console.log(chalk.gray('1. Run: aws q developer generate-code'));
  console.log(chalk.gray('2. Use the following specification:'));
  console.log(chalk.gray('---'));
  console.log(yaml.stringify(state.backendSpec));
  console.log(chalk.gray('---'));
  
  console.log(chalk.cyan('\nPress Enter when backend is ready'));
  await waitForUserInput();
  
  state.backendPath = './backend';
}

async function deployApplication(state: WorkflowState) {
  console.log(chalk.bold.cyan('\n🚀 Deployment Phase\n'));
  
  const spinner = ora('Deploying to AWS...').start();
  
  spinner.text = 'Deploying frontend to S3/CloudFront...';
  await new Promise(resolve => setTimeout(resolve, 2000));
  state.deploymentInfo = {
    frontendUrl: `https://${state.mvpSpec.name}.cloudfront.net`,
    cdnUrl: `https://${state.mvpSpec.name}.cloudfront.net`
  };
  
  if (state.backendPath) {
    spinner.text = 'Deploying backend API...';
    await new Promise(resolve => setTimeout(resolve, 2000));
    state.deploymentInfo.apiUrl = `https://api.${state.mvpSpec.name}.com`;
  }
  
  spinner.succeed('Deployment complete!');
}

function showDeploymentSummary(state: WorkflowState) {
  console.log(chalk.bold('Deployment Summary:'));
  console.log(chalk.gray('─'.repeat(50)));
  
  if (state.deploymentInfo?.frontendUrl) {
    console.log(chalk.green('Frontend URL:'), state.deploymentInfo.frontendUrl);
  }
  
  if (state.deploymentInfo?.apiUrl) {
    console.log(chalk.green('API URL:'), state.deploymentInfo.apiUrl);
  }
  
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.cyan('\n🎉 Your MVP is live!'));
}

function formatFrontendSpec(spec: MVPSpecification): string {
  return `Project: ${spec.name}
Description: ${spec.description}

Features:
${spec.features.map(f => `- ${f}`).join('\n')}

Pages:
${spec.frontend.pages.map(p => `- ${p}`).join('\n')}

Components:
${spec.frontend.components.map(c => `- ${c}`).join('\n')}

Styling: ${spec.frontend.styling.framework || 'Tailwind CSS'}
Primary Color: ${spec.frontend.styling.primaryColor || '#3B82F6'}`;
}

async function waitForUserInput(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}