import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile } from 'fs/promises';
import yaml from 'yaml';
import { BedrockClient } from '../lib/bedrock-client.js';

interface ChatOptions {
  output: string;
  model: string;
}

interface MVPConversation {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  specification: any;
}

export async function chatCommand(options: ChatOptions) {
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
          await generateSpecification(conversation, bedrockClient, options.output);
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
    const specPrompt = `Based on our conversation, generate a detailed MVP specification in YAML format.

Include:
- name: Project name
- description: Brief description
- features: List of core features
- userStories: Key user stories
- frontend:
    - pages: List of main pages/screens
    - components: Key UI components
    - styling: Design preferences
- backend:
    - apis: List of API endpoints needed
    - dataModels: Core data structures
    - integrations: External services
- deployment:
    - hosting: Preferred hosting (default: AWS)
    - domain: Domain preferences
    - scaling: Initial scaling needs

Conversation:
${conversation.messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}

Generate a complete, well-structured YAML specification:`;

    const specification = await bedrockClient.chat(specPrompt, false);
    
    await writeFile(outputFile, specification);
    
    spinner.succeed(chalk.green(`✅ MVP specification saved to ${outputFile}`));
    
    console.log(chalk.bold.cyan('\n📋 Next Steps:'));
    console.log(chalk.gray('1. Review the specification in ' + outputFile));
    console.log(chalk.gray('2. Run: overnight-mvp run ' + outputFile));
    console.log(chalk.gray('3. Follow the automated workflow to build your MVP\n'));

  } catch (error) {
    spinner.fail(chalk.red('Failed to generate specification'));
    throw error;
  }
}