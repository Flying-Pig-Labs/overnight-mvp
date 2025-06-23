import { readFile, writeFile } from 'fs/promises';
import chalk from 'chalk';
import yaml from 'yaml';
import { MVPSpecification } from '../types/index.js';

interface LovableOptions {
  output: string;
  copy?: boolean;
}

export async function lovableCommand(specFile: string, options: LovableOptions) {
  console.log(chalk.bold.cyan('\n🎨 Generating Lovable.dev Prompt\n'));

  try {
    const specContent = await readFile(specFile, 'utf-8');
    const mvpSpec: MVPSpecification = yaml.parse(specContent);
    
    const lovablePrompt = generateLovablePrompt(mvpSpec);
    
    await writeFile(options.output, lovablePrompt);
    console.log(chalk.green(`✅ Lovable prompt saved to ${options.output}`));
    
    if (options.copy) {
      console.log(chalk.yellow('📋 Note: Copy to clipboard not implemented. Please copy from the file.'));
    }
    
    console.log(chalk.bold.cyan('\n📝 Lovable.dev Instructions:'));
    console.log(chalk.gray('1. Go to https://lovable.dev'));
    console.log(chalk.gray('2. Start a new project'));
    console.log(chalk.gray('3. Paste the generated prompt'));
    console.log(chalk.gray('4. Let Lovable generate your frontend'));
    console.log(chalk.gray('5. Download the code when complete\n'));
    
    console.log(chalk.bold('Preview of generated prompt:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(lovablePrompt.substring(0, 500) + '...');
    console.log(chalk.gray('─'.repeat(50)));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate Lovable prompt:'), error);
    process.exit(1);
  }
}

function generateLovablePrompt(spec: MVPSpecification): string {
  return `Build a ${spec.name} - ${spec.description}

## Core Features
${spec.features.map(f => `- ${f}`).join('\n')}

## User Stories
${spec.userStories.map(story => `- ${story}`).join('\n')}

## Technical Requirements

### Pages Required
${spec.frontend.pages.map(page => `- ${page}`).join('\n')}

### Key Components
${spec.frontend.components.map(comp => `- ${comp}`).join('\n')}

### Design Preferences
- Style Framework: ${spec.frontend.styling.framework || 'Tailwind CSS'}
- Primary Color: ${spec.frontend.styling.primaryColor || '#3B82F6'}
- Theme: ${spec.frontend.styling.theme || 'Modern and clean'}

### API Integration
The frontend should make API calls to these endpoints (use placeholder URLs like \`/api/...\`):
${spec.backend.apis.map(api => `- ${api.method} ${api.path} - ${api.description}`).join('\n')}

### Data Models
The app will work with these data structures:
${spec.backend.dataModels.map(model => `
**${model.name}**
${model.fields.map(field => `- ${field.name}: ${field.type}${field.required ? ' (required)' : ''}`).join('\n')}
`).join('\n')}

## Additional Requirements
- Make the UI responsive and mobile-friendly
- Use modern React patterns (hooks, functional components)
- Include proper loading states and error handling
- Add form validation where needed
- Use environment variables for API endpoints (VITE_API_URL)
- Structure the code to be production-ready

## Deployment Target
This will be deployed to AWS S3/CloudFront as a static site, so ensure:
- All routing works with client-side routing
- Build outputs to a standard 'dist' folder
- No server-side dependencies

Please create a complete, working frontend application with all the features described above.`;
}