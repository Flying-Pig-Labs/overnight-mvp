import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import yaml from 'yaml';
import path from 'path';
import { BedrockClient } from '../lib/bedrock-client.js';
import { parseMVPName } from '../lib/mvp-resolver.js';

interface MVPOptions {
  output?: string;
  model: string;
  name?: string;
  description?: string;
}

export async function mvpCommand(options: MVPOptions) {
  console.log(chalk.bold.cyan('\n🚀 Welcome to Overnight MVP Builder!\n'));
  console.log(chalk.gray('Let\'s turn your idea into a deployed application in under an hour.'));
  console.log(chalk.gray('I\'ll help you create a comprehensive MVP specification.\n'));

  try {
    // Get MVP name
    let mvpName: string;
    if (options.name) {
      mvpName = options.name;
      console.log(chalk.gray(`MVP Name: ${mvpName}`));
    } else {
      const nameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'mvpName',
          message: chalk.cyan('What is the name of your MVP?'),
          validate: (input) => {
            if (input.trim().length === 0) return 'Please enter a name';
            if (input.trim().length > 50) return 'Name should be less than 50 characters';
            return true;
          }
        }
      ]);
      mvpName = nameAnswer.mvpName;
    }

    // Parse name to create directory
    const mvpDirName = parseMVPName(mvpName);
    const mvpDir = path.join(process.cwd(), 'mvps', mvpDirName);
    
    // Check if MVP already exists
    if (existsSync(mvpDir) && existsSync(path.join(mvpDir, 'mvpspec.yml'))) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow(`MVP '${mvpDirName}' already exists. Overwrite?`),
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.gray('MVP creation cancelled.'));
        return;
      }
    }

    // Get MVP description
    let mvpDescription: string;
    if (options.description) {
      mvpDescription = options.description;
      console.log(chalk.gray(`Description: ${mvpDescription}`));
    } else {
      const descAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'mvpDescription',
          message: chalk.cyan('Describe your MVP idea in a few sentences:'),
          validate: (input) => {
            if (input.trim().length === 0) return 'Please enter a description';
            if (input.trim().length < 20) return 'Please provide a more detailed description (at least 20 characters)';
            return true;
          }
        }
      ]);
      mvpDescription = descAnswer.mvpDescription;
    }

    // Create MVP directory and prompts subdirectory
    await mkdir(mvpDir, { recursive: true });
    const promptsDir = path.join(mvpDir, 'prompts');
    await mkdir(promptsDir, { recursive: true });

    const spinner = ora('Generating MVP specification...').start();

    try {
      const bedrockClient = new BedrockClient({ modelId: options.model });
      
      // Load template
      const templatePath = path.join(process.cwd(), 'templates', 'example-mvp-spec.yaml');
      const templateContent = await readFile(templatePath, 'utf-8');
      
      // Generate the prompt
      const prompt = createMVPPrompt(mvpName, mvpDescription, templateContent);
      
      // Save the prompt first
      const mvpPromptPath = path.join(promptsDir, 'make_mvp.txt');
      await writeFile(mvpPromptPath, prompt);
      
      // Generate specification using AI
      const specification = await bedrockClient.chat(prompt, false);
      const cleanedSpec = specification
        .replace(/```yaml\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Save specification
      const outputPath = path.join(mvpDir, 'mvpspec.yml');
      await writeFile(outputPath, cleanedSpec);
      
      spinner.succeed(chalk.green(`✅ MVP specification saved to ${outputPath}`));
      
      console.log(chalk.bold.yellow('\n⚠️  IMPORTANT: Review Your MVP Specification'));
      console.log(chalk.yellow(`Please open and review: ${outputPath}`));
      console.log(chalk.gray('The AI-generated specification may need adjustments to match your vision.'));
      console.log(chalk.gray('Take a moment to:'));
      console.log(chalk.gray('  • Check that all features are correctly captured'));
      console.log(chalk.gray('  • Verify the data models match your needs'));
      console.log(chalk.gray('  • Ensure API endpoints are properly defined'));
      console.log(chalk.gray('  • Adjust any technical requirements\n'));
      
      console.log(chalk.bold.cyan('📋 Next Steps:'));
      console.log(chalk.gray(`1. Review and edit the specification in ${outputPath}`));
      console.log(chalk.gray(`2. Run: make frontend`));
      console.log(chalk.gray(`3. Run: make backend`));
      console.log(chalk.gray('4. Use the generated prompts with Lovable.dev and Amazon Q\n'));

    } catch (error) {
      spinner.fail(chalk.red('Failed to generate specification'));
      throw error;
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error);
    process.exit(1);
  }
}

function createMVPPrompt(
  name: string,
  description: string,
  template: string
): string {
  
  const prompt = `You are an expert MVP consultant. Generate a comprehensive MVP specification based on the following:

MVP Name: ${name}
MVP Description: ${description}

Use this YAML template as a guide for the structure and format:

${template}

Generate a complete MVP specification that:
1. Expands the description into concrete features
2. Defines clear REST API endpoints for each feature
3. Creates a normalized data model with proper relationships
4. Lists specific UI pages and components needed
5. Includes relevant technical requirements
6. Focuses on MVP scope - essential features only

Important formatting rules:
- Use the exact YAML structure from the template
- Keep feature names concise (2-3 words)
- Use lowercase for model names, camelCase for field names
- Include realistic field types: string, number, boolean, timestamp, array, object
- Make sure all endpoints follow RESTful conventions
- Include user stories that match the features

Return ONLY the YAML specification, no additional text or explanation.`;

  return prompt;
}

// Import readFile from fs/promises
import { readFile } from 'fs/promises';