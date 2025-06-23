import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import yaml from 'yaml';
import { BedrockClient } from '../lib/bedrock-client.js';
import { FrontendAnalysis } from '../types/index.js';

interface AnalyzeOptions {
  output: string;
}

export async function analyzeCommand(frontendPath: string, options: AnalyzeOptions) {
  console.log(chalk.bold.cyan('\n🔍 Analyzing Frontend Code\n'));
  
  const spinner = ora('Reading frontend files...').start();
  
  try {
    const codeFiles = await collectCodeFiles(frontendPath);
    spinner.text = 'Analyzing code patterns...';
    
    const bedrockClient = new BedrockClient();
    const analysis = await analyzeFrontendCode(codeFiles, bedrockClient);
    
    spinner.text = 'Saving analysis results...';
    await saveAnalysis(analysis, options.output);
    
    spinner.succeed(chalk.green('Frontend analysis complete!'));
    
    showAnalysisSummary(analysis);
    
  } catch (error) {
    spinner.fail(chalk.red('Analysis failed'));
    throw error;
  }
}

async function collectCodeFiles(basePath: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
  
  async function scanDirectory(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await scanDirectory(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        const content = await readFile(fullPath, 'utf-8');
        const relativePath = fullPath.replace(basePath + '/', '');
        files.set(relativePath, content);
      }
    }
  }
  
  await scanDirectory(basePath);
  return files;
}

async function analyzeFrontendCode(
  files: Map<string, string>, 
  bedrockClient: BedrockClient
): Promise<FrontendAnalysis> {
  const codeContext = Array.from(files.entries())
    .map(([path, content]) => `// File: ${path}\n${content}`)
    .join('\n\n');
  
  const analysisPrompt = `Analyze this frontend code and extract API requirements.

Focus on:
1. API calls (fetch, axios, etc.) - find all endpoints and methods
2. State management patterns - identify global and local state
3. Authentication requirements - detect auth flows and methods
4. Data flow - how data moves through the application

Frontend Code:
${codeContext.substring(0, 10000)} // Truncated for context

Return a detailed analysis in JSON format with:
{
  "apiCalls": [
    {
      "endpoint": "/api/users",
      "method": "GET",
      "usage": "Fetch user list",
      "component": "UserList.tsx"
    }
  ],
  "stateManagement": {
    "globalState": {},
    "localState": {}
  },
  "authentication": {
    "required": true,
    "methods": ["JWT", "OAuth"]
  },
  "dataFlow": {}
}`;

  const response = await bedrockClient.chat(analysisPrompt, false);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      apiCalls: [],
      stateManagement: { globalState: {}, localState: {} },
      authentication: { required: false, methods: [] },
      dataFlow: {}
    };
  }
}

async function saveAnalysis(analysis: FrontendAnalysis, outputPath: string) {
  const yamlContent = yaml.stringify(analysis);
  await writeFile(outputPath, yamlContent);
}

function showAnalysisSummary(analysis: FrontendAnalysis) {
  console.log(chalk.bold('\n📊 Analysis Summary:'));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.cyan('API Endpoints Found:'), analysis.apiCalls.length);
  analysis.apiCalls.forEach(api => {
    console.log(chalk.gray(`  ${api.method} ${api.endpoint} - ${api.usage}`));
  });
  
  console.log(chalk.cyan('\nAuthentication:'), 
    analysis.authentication.required ? 'Required' : 'Not Required'
  );
  
  if (analysis.authentication.methods.length > 0) {
    console.log(chalk.gray('  Methods:'), analysis.authentication.methods.join(', '));
  }
  
  console.log(chalk.gray('─'.repeat(50)));
}

import { writeFile } from 'fs/promises';