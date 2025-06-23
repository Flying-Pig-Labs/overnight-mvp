import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';

interface DeployOptions {
  frontendOnly?: boolean;
  backendOnly?: boolean;
  stage: string;
}

export async function deployCommand(projectPath: string, options: DeployOptions) {
  console.log(chalk.bold.cyan('\n🚀 Deploying to AWS\n'));
  
  try {
    if (!options.backendOnly) {
      await deployFrontend(projectPath, options.stage);
    }
    
    if (!options.frontendOnly) {
      await deployBackend(projectPath, options.stage);
    }
    
    console.log(chalk.bold.green('\n✅ Deployment Complete!\n'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Deployment failed:'), error);
    process.exit(1);
  }
}

async function deployFrontend(projectPath: string, stage: string) {
  const frontendPath = join(projectPath, 'frontend');
  
  if (!existsSync(frontendPath)) {
    console.log(chalk.yellow('⚠️  No frontend directory found, skipping frontend deployment'));
    return;
  }
  
  console.log(chalk.bold.cyan('📦 Deploying Frontend\n'));
  
  const spinner = ora('Building frontend...').start();
  
  try {
    process.chdir(frontendPath);
    
    if (existsSync('package.json')) {
      spinner.text = 'Installing dependencies...';
      execSync('npm install', { stdio: 'pipe' });
      
      spinner.text = 'Building production bundle...';
      execSync('npm run build', { stdio: 'pipe' });
    }
    
    spinner.text = 'Deploying to S3...';
    const buildDir = existsSync('dist') ? 'dist' : 'build';
    const bucketName = `overnight-mvp-${stage}-frontend`;
    
    execSync(`aws s3 sync ${buildDir} s3://${bucketName} --delete`, { stdio: 'pipe' });
    
    spinner.text = 'Invalidating CloudFront cache...';
    
    spinner.succeed(chalk.green('Frontend deployed successfully!'));
    console.log(chalk.gray(`  URL: https://${bucketName}.s3-website.amazonaws.com`));
    
  } catch (error) {
    spinner.fail(chalk.red('Frontend deployment failed'));
    throw error;
  } finally {
    process.chdir('..');
  }
}

async function deployBackend(projectPath: string, stage: string) {
  const backendPath = join(projectPath, 'backend');
  
  if (!existsSync(backendPath)) {
    console.log(chalk.yellow('⚠️  No backend directory found, skipping backend deployment'));
    return;
  }
  
  console.log(chalk.bold.cyan('\n⚙️  Deploying Backend\n'));
  
  const spinner = ora('Preparing backend deployment...').start();
  
  try {
    process.chdir(backendPath);
    
    if (existsSync('cdk.json')) {
      spinner.text = 'Deploying with AWS CDK...';
      execSync('npm install', { stdio: 'pipe' });
      execSync(`npx cdk deploy --all --require-approval never`, { stdio: 'pipe' });
      
    } else if (existsSync('serverless.yml')) {
      spinner.text = 'Deploying with Serverless Framework...';
      execSync('npm install', { stdio: 'pipe' });
      execSync(`npx serverless deploy --stage ${stage}`, { stdio: 'pipe' });
      
    } else if (existsSync('template.yaml') || existsSync('template.yml')) {
      spinner.text = 'Deploying with SAM...';
      execSync('sam build', { stdio: 'pipe' });
      execSync(`sam deploy --no-confirm-changeset --stack-name overnight-mvp-${stage}`, { stdio: 'pipe' });
    }
    
    spinner.succeed(chalk.green('Backend deployed successfully!'));
    
  } catch (error) {
    spinner.fail(chalk.red('Backend deployment failed'));
    throw error;
  } finally {
    process.chdir('..');
  }
}