import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile } from 'fs/promises';
import yaml from 'yaml';
import path from 'path';
import { BedrockClient } from '../lib/bedrock-client.js';

interface MVPOptions {
  output?: string;
  model: string;
}

interface MVPConversation {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  specification: any;
}

export async function mvpCommand(options: MVPOptions) {
  console.log(chalk.bold.cyan('\n🚀 Welcome to Overnight MVP Builder!\n'));
  console.log(chalk.gray('Let\'s turn your idea into a deployed application in under an hour.'));
  console.log(chalk.gray('Start by describing your MVP idea in natural language.\n'));

  const bedrockClient = new BedrockClient({ modelId: options.model });
  const conversation: MVPConversation = {
    messages: [],
    specification: {}
  };

  let continueChat = true;

  while (continueChat) {
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: chalk.cyan('You:'),
        validate: (input) => input.trim().length > 0 || 'Please enter a description'
      }
    ]);

    if (userInput.toLowerCase() === 'done' || userInput.toLowerCase() === 'exit') {
      continueChat = false;
      break;
    }

    conversation.messages.push({ role: 'user', content: userInput });

    const spinner = ora('Thinking...').start();

    try {
      const systemPrompt = await generateSystemPrompt(conversation);
      const response = await bedrockClient.chat(
        systemPrompt + '\n\nUser: ' + userInput,
        false
      );

      spinner.stop();
      
      console.log(chalk.green('\nAssistant:'), response);
      conversation.messages.push({ role: 'assistant', content: response });

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '\nWhat would you like to do?',
          choices: [
            { name: 'Continue refining the MVP', value: 'continue' },
            { name: 'Generate specification and proceed', value: 'generate' },
            { name: 'Start over', value: 'restart' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);

      switch (action) {
        case 'generate':
          await generateSpecification(conversation, bedrockClient, options.output || 'bigspec.yaml');
          continueChat = false;
          break;
        case 'restart':
          conversation.messages = [];
          console.log(chalk.yellow('\n📝 Starting fresh. Describe your MVP idea:\n'));
          break;
        case 'exit':
          continueChat = false;
          break;
      }

    } catch (error) {
      spinner.fail(chalk.red('Error communicating with AI'));
      console.error(error);
    }
  }
}

async function generateSystemPrompt(conversation: MVPConversation): Promise<string> {
  const conversationContext = conversation.messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n\n');

  return `You are an expert MVP consultant helping users define their Minimum Viable Product.
Your goal is to extract key requirements and help shape ideas into concrete specifications.

Guidelines:
1. Ask clarifying questions about features, users, and technical requirements
2. Suggest practical MVP scope that can be built quickly
3. Focus on core functionality that delivers immediate value
4. Consider frontend UI/UX needs and backend API requirements
5. Think about deployment and scalability from the start

Current conversation:
${conversationContext}

Provide helpful guidance to refine the MVP idea. Be concise but thorough.`;
}

async function generateSpecification(
  conversation: MVPConversation,
  bedrockClient: BedrockClient,
  outputFile: string
) {
  const spinner = ora('Generating MVP specification...').start();

  try {
    const specPrompt = `Based on our conversation, generate a detailed MVP specification in YAML format that matches this exact structure:

name: [Project Name]
description: [Brief project description]
features:
  - name: [Feature Name]
    description: [Feature description]
    endpoints:
      - method: [GET/POST/PUT/DELETE]
        path: [/resource or /resource/{id}]
        description: [What this endpoint does]
      # Add more endpoints as needed
  # Add more features as needed
data_model:
  [model_name]:
    - id: string
    - [field_name]: [field_type]
    # Add more fields
  # Add more models as needed
ui_requirements:
  - [UI requirement description]
  # Add more UI requirements
technical_requirements:
  - [Technical requirement]
  # Add more technical requirements

Guidelines:
1. Extract all core features from the conversation
2. For each feature, define clear REST API endpoints
3. Create a normalized data model with proper field types
4. List specific UI/UX requirements mentioned
5. Include any technical constraints or preferences
6. Keep descriptions concise but comprehensive
7. Use lowercase for model names, camelCase for field names
8. Common field types: string, number, boolean, timestamp, array, object

Conversation:
${conversation.messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}

Generate a complete bigspec.yaml following the exact format above:`;

    const specification = await bedrockClient.chat(specPrompt, false);
    
    await writeFile(outputFile, specification);
    
    spinner.succeed(chalk.green(`✅ MVP specification saved to ${outputFile}`));
    
    console.log(chalk.bold.cyan('\n📋 Next Steps:'));
    console.log(chalk.gray('1. Review the bigspec in ' + outputFile));
    console.log(chalk.gray('2. Run: make frontend MVP=' + path.basename(path.dirname(outputFile))));
    console.log(chalk.gray('3. Run: make backend MVP=' + path.basename(path.dirname(outputFile))));
    console.log(chalk.gray('4. Use the generated prompts with Lovable.dev and Amazon Q\n'));

  } catch (error) {
    spinner.fail(chalk.red('Failed to generate specification'));
    throw error;
  }
}