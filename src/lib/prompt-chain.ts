import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { BedrockClient } from './bedrock-client.js';
import { MVPSpecification, FrontendAnalysis, BackendSpecification } from '../types/index.js';

export interface PromptStep {
  id: string;
  name: string;
  promptFile: string;
  inputTransform?: (input: any) => any;
  outputTransform?: (output: string) => any;
  validate?: (output: any) => boolean;
}

export class PromptChainManager {
  private bedrockClient: BedrockClient;
  private projectRoot: string;

  constructor(bedrockClient: BedrockClient, projectRoot: string) {
    this.bedrockClient = bedrockClient;
    this.projectRoot = projectRoot;
  }

  async loadPrompt(filename: string): Promise<string> {
    const promptPath = join(this.projectRoot, filename);
    return await readFile(promptPath, 'utf-8');
  }

  async executeStep(step: PromptStep, input: any): Promise<any> {
    const spinner = ora(`${step.name}...`).start();
    
    try {
      const promptTemplate = await this.loadPrompt(step.promptFile);
      
      const transformedInput = step.inputTransform 
        ? step.inputTransform(input) 
        : input;
      
      const prompt = this.interpolatePrompt(promptTemplate, transformedInput);
      
      const response = await this.bedrockClient.chat(prompt);
      
      let output = step.outputTransform 
        ? step.outputTransform(response) 
        : response;
      
      if (step.validate && !step.validate(output)) {
        throw new Error(`Validation failed for step: ${step.name}`);
      }
      
      spinner.succeed(chalk.green(`✓ ${step.name} completed`));
      return output;
    } catch (error) {
      spinner.fail(chalk.red(`✗ ${step.name} failed`));
      throw error;
    }
  }

  async executeChain(steps: PromptStep[], initialInput: any): Promise<any[]> {
    const results: any[] = [];
    let currentInput = initialInput;
    
    console.log(chalk.bold.cyan('\n🔗 Starting Prompt Chain Execution\n'));
    
    for (const step of steps) {
      const result = await this.executeStep(step, currentInput);
      results.push(result);
      currentInput = { ...currentInput, [`${step.id}Result`]: result };
    }
    
    console.log(chalk.bold.green('\n✨ Prompt Chain Completed Successfully!\n'));
    return results;
  }

  private interpolatePrompt(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key);
      return value !== undefined ? String(value) : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
}

export const workflowSteps: PromptStep[] = [
  {
    id: 'mvpSpec',
    name: 'Generate MVP Specification',
    promptFile: 'prompts/3-populate-frontspec-prompt.md',
    inputTransform: (input) => ({
      userDescription: input.description,
      template: input.frontspecTemplate
    }),
    outputTransform: (output) => {
      try {
        return JSON.parse(output);
      } catch {
        return output;
      }
    },
    validate: (output) => {
      return output && typeof output === 'object' && 'name' in output;
    }
  },
  {
    id: 'frontendAnalysis',
    name: 'Analyze Frontend Requirements',
    promptFile: 'prompts/3-populate-frontspec-prompt.md',
    inputTransform: (input) => ({
      frontendCode: input.frontendCode,
      mvpSpec: input.mvpSpecResult
    }),
    outputTransform: (output) => {
      try {
        return JSON.parse(output);
      } catch {
        return output;
      }
    }
  },
  {
    id: 'backendSpec',
    name: 'Generate Backend Specification',
    promptFile: 'prompts/4-backend-spec-prompt.md',
    inputTransform: (input) => ({
      frontendAnalysis: input.frontendAnalysisResult,
      mvpSpec: input.mvpSpecResult
    }),
    outputTransform: (output) => {
      try {
        return JSON.parse(output);
      } catch {
        return output;
      }
    }
  }
];