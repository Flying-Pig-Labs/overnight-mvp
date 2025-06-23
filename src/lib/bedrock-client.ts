import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import chalk from 'chalk';

export interface BedrockClientConfig {
  region?: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
}

export class BedrockClient {
  private client: BedrockRuntimeClient;
  private modelId: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: BedrockClientConfig = {}) {
    this.client = new BedrockRuntimeClient({ 
      region: config.region || process.env.AWS_REGION || 'us-east-1',
      credentials: process.env.AWS_PROFILE ? undefined : fromIni({ profile: 'personal' })
    });
    this.modelId = config.modelId || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  async chat(prompt: string, streaming: boolean = false): Promise<string> {
    const body = {
      anthropic_version: "bedrock-2023-05-31",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: this.maxTokens,
      temperature: this.temperature
    };

    if (streaming) {
      return await this.streamChat(body);
    } else {
      return await this.invokeModel(body);
    }
  }

  private async invokeModel(body: any): Promise<string> {
    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(body)
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.content[0].text;
    } catch (error) {
      console.error(chalk.red('Error invoking Bedrock model:'), error);
      throw error;
    }
  }

  private async streamChat(body: any): Promise<string> {
    try {
      const command = new InvokeModelWithResponseStreamCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(body)
      });

      const response = await this.client.send(command);
      let fullResponse = '';

      if (response.body) {
        for await (const chunk of response.body) {
          if (chunk.chunk) {
            const chunkData = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes));
            if (chunkData.type === 'content_block_delta' && chunkData.delta?.text) {
              process.stdout.write(chunkData.delta.text);
              fullResponse += chunkData.delta.text;
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error(chalk.red('Error streaming from Bedrock:'), error);
      throw error;
    }
  }

  async generateSystemPrompt(context: string): Promise<string> {
    return `You are an AI assistant helping to build MVPs quickly and efficiently. 
Your goal is to understand the user's requirements and help generate clean, 
production-ready code that follows best practices.

Context: ${context}

Please provide clear, actionable responses that move the project forward.`;
  }
}