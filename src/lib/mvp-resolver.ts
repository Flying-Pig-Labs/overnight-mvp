import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

export interface MVPPaths {
  mvpDir: string;
  mvpspecPath: string;
  frontspecPath: string;
  backspecPath: string;
  frontendPromptPath: string;
  backendPromptPath: string;
  promptsDir: string;
  mvpPromptPath: string;
  frontendMakePromptPath: string;
  backendMakePromptPath: string;
}

export async function resolveMVPName(mvpNameOrPath: string): Promise<MVPPaths> {
  // Check if it's a direct path to a spec file
  if (mvpNameOrPath.endsWith('.yaml') || mvpNameOrPath.endsWith('.yml')) {
    // If it's a direct spec file path, extract the MVP directory
    const specPath = path.resolve(mvpNameOrPath);
    if (!existsSync(specPath)) {
      throw new Error(`Spec file not found: ${specPath}`);
    }
    
    const mvpDir = path.dirname(specPath);
    const mvpName = path.basename(mvpDir);
    
    // Verify it's in the mvps directory structure
    if (!mvpDir.includes('/mvps/')) {
      throw new Error(`Spec file must be in an MVP directory under 'mvps/' folder`);
    }
    
    return getMVPPaths(mvpDir);
  }
  
  // Otherwise, treat it as an MVP name
  const mvpsDir = path.join(process.cwd(), 'mvps');
  const mvpDir = path.join(mvpsDir, mvpNameOrPath);
  
  // Check if MVP directory exists
  if (!existsSync(mvpDir)) {
    // List available MVPs for helpful error message
    const availableMVPs = await listAvailableMVPs();
    throw new Error(
      `MVP '${mvpNameOrPath}' not found.\n\n` +
      `Available MVPs:\n${availableMVPs.map(mvp => `  - ${mvp}`).join('\n')}\n\n` +
      `To create a new MVP, run: overnight-mvp mvp`
    );
  }
  
  return getMVPPaths(mvpDir);
}

function getMVPPaths(mvpDir: string): MVPPaths {
  const mvpspecPath = path.join(mvpDir, 'mvpspec.yml');
  
  if (!existsSync(mvpspecPath)) {
    throw new Error(`MVP specification not found: ${mvpspecPath}`);
  }
  
  const promptsDir = path.join(mvpDir, 'prompts');
  
  return {
    mvpDir,
    mvpspecPath,
    frontspecPath: path.join(mvpDir, 'frontspec.yml'),
    backspecPath: path.join(mvpDir, 'backspec.yml'),
    frontendPromptPath: path.join(mvpDir, 'frontend-prompt.txt'),
    backendPromptPath: path.join(mvpDir, 'backend-prompt.txt'),
    promptsDir,
    mvpPromptPath: path.join(promptsDir, 'make_mvp.txt'),
    frontendMakePromptPath: path.join(promptsDir, 'make_frontend.txt'),
    backendMakePromptPath: path.join(promptsDir, 'make_backend.txt')
  };
}

export async function listAvailableMVPs(): Promise<string[]> {
  const mvpsDir = path.join(process.cwd(), 'mvps');
  
  if (!existsSync(mvpsDir)) {
    return [];
  }
  
  const entries = await readdir(mvpsDir, { withFileTypes: true });
  const mvps = entries
    .filter(entry => entry.isDirectory())
    .filter(entry => existsSync(path.join(mvpsDir, entry.name, 'mvpspec.yml')))
    .map(entry => entry.name);
  
  return mvps;
}

export function printMVPInfo(paths: MVPPaths): void {
  const mvpName = path.basename(paths.mvpDir);
  console.log(chalk.gray(`Using MVP: ${chalk.bold(mvpName)}`));
  console.log(chalk.gray(`Location: ${paths.mvpDir}`));
}

export function parseMVPName(name: string): string {
  // Convert "My Fancy App" to "my-fancy-app"
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}