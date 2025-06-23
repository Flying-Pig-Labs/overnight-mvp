import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile } from 'fs/promises';
import yaml from 'yaml';
import { BedrockClient } from '../lib/bedrock-client.js';
import path from 'path';

interface FrontendOptions {
  output?: string;
  model: string;
}

interface DesignPreferences {
  vibe: string;
  emotions: string[];
  style: string;
  colorScheme: string;
  targetAudience: string;
  inspiration: string;
}

export async function frontendCommand(specPath: string, options: FrontendOptions) {
  console.log(chalk.bold.cyan('\n🎨 Frontend Design Session\n'));
  console.log(chalk.gray('Let\'s create a beautiful frontend for your MVP.'));
  console.log(chalk.gray('I\'ll ask you about the look, feel, and user experience.\n'));

  try {
    // Load the bigspec
    const specContent = await readFile(specPath, 'utf-8');
    const bigSpec = yaml.parse(specContent);

    // Interactive design questions
    const designAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'vibe',
        message: 'What\'s the overall vibe/personality of your app? (e.g., professional, playful, minimal, bold)',
        default: 'modern and clean'
      },
      {
        type: 'checkbox',
        name: 'emotions',
        message: 'What emotions should users feel when using your app?',
        choices: [
          'Confident',
          'Excited',
          'Relaxed',
          'Empowered',
          'Delighted',
          'Focused',
          'Inspired',
          'Secure',
          'Accomplished',
          'Connected'
        ],
        validate: (answer) => answer.length > 0 || 'Please select at least one emotion'
      },
      {
        type: 'list',
        name: 'style',
        message: 'What visual style appeals to you?',
        choices: [
          'Minimal & Clean',
          'Bold & Colorful', 
          'Dark & Sophisticated',
          'Light & Airy',
          'Retro & Nostalgic',
          'Futuristic & Tech',
          'Natural & Organic',
          'Playful & Fun'
        ]
      },
      {
        type: 'input',
        name: 'colorScheme',
        message: 'Describe your preferred color scheme (or name specific colors):',
        default: 'blue and white with gray accents'
      },
      {
        type: 'input',
        name: 'targetAudience',
        message: 'Who is your target audience?',
        default: 'general users'
      },
      {
        type: 'input',
        name: 'inspiration',
        message: 'Any apps/websites you love the design of? (optional)',
        default: ''
      }
    ]);

    const preferences: DesignPreferences = designAnswers;

    // Animation and interaction preferences
    const interactionAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'animations',
        message: 'Do you want smooth animations and transitions?',
        default: true
      },
      {
        type: 'confirm',
        name: 'microInteractions',
        message: 'Include micro-interactions (hover effects, loading states, etc)?',
        default: true
      },
      {
        type: 'list',
        name: 'complexity',
        message: 'How complex should the interface be?',
        choices: [
          { name: 'Very Simple - Focus on core functionality', value: 'simple' },
          { name: 'Balanced - Good features without overwhelming', value: 'balanced' },
          { name: 'Feature-Rich - Power user interface', value: 'rich' }
        ]
      }
    ]);

    const spinner = ora('Generating frontend implementation prompt...').start();

    // Create the frontend spec from bigspec
    const frontSpec = await generateFrontendSpec(bigSpec, preferences, interactionAnswers);
    
    // Generate the Lovable.dev prompt
    const prompt = await generateFrontendPrompt(bigSpec, frontSpec, preferences, interactionAnswers);

    // Save outputs
    const outputPath = options.output || path.join(path.dirname(specPath), 'frontend-prompt.txt');
    const frontSpecPath = path.join(path.dirname(specPath), 'frontspec.yaml');
    
    await writeFile(outputPath, prompt);
    await writeFile(frontSpecPath, yaml.stringify(frontSpec));
    
    spinner.succeed(chalk.green('✅ Frontend design complete!'));
    
    console.log(chalk.bold.cyan('\n📋 Generated Files:'));
    console.log(chalk.gray(`- Frontend Specification: ${frontSpecPath}`));
    console.log(chalk.gray(`- Lovable.dev Prompt: ${outputPath}`));
    console.log(chalk.bold.cyan('\n🚀 Next Steps:'));
    console.log(chalk.gray('1. Copy the prompt from ' + outputPath));
    console.log(chalk.gray('2. Paste into Lovable.dev to generate your frontend'));
    console.log(chalk.gray('3. Run "make backend" to create the backend\n'));

  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

async function generateFrontendSpec(bigSpec: any, preferences: DesignPreferences, interactions: any): Promise<any> {
  // Transform bigspec into detailed frontend specification
  return {
    name: `${bigSpec.name} Frontend`,
    framework: 'React with TypeScript',
    styling: 'Tailwind CSS',
    design: {
      vibe: preferences.vibe,
      emotions: preferences.emotions,
      style: preferences.style,
      colorScheme: preferences.colorScheme,
      animations: interactions.animations,
      microInteractions: interactions.microInteractions,
      complexity: interactions.complexity
    },
    pages: generatePagesFromFeatures(bigSpec.features),
    components: generateComponentsFromFeatures(bigSpec.features),
    state_management: {
      tool: 'Zustand',
      stores: generateStoresFromDataModel(bigSpec.data_model)
    },
    api_integration: {
      baseUrl: 'process.env.REACT_APP_API_URL',
      endpoints: extractEndpointsFromFeatures(bigSpec.features)
    }
  };
}

function generatePagesFromFeatures(features: any[]): any[] {
  const pages = [];
  
  // Always include a dashboard/home
  pages.push({
    name: 'Dashboard',
    path: '/',
    description: 'Main landing page with overview'
  });

  // Generate pages based on features
  features.forEach(feature => {
    if (feature.endpoints) {
      const hasListEndpoint = feature.endpoints.some((e: any) => e.method === 'GET' && !e.path.includes('{'));
      const hasDetailEndpoint = feature.endpoints.some((e: any) => e.method === 'GET' && e.path.includes('{'));
      
      if (hasListEndpoint) {
        pages.push({
          name: `${feature.name} List`,
          path: `/${feature.name.toLowerCase().replace(/\s+/g, '-')}`,
          description: `List view for ${feature.name}`
        });
      }
      
      if (hasDetailEndpoint) {
        pages.push({
          name: `${feature.name} Detail`,
          path: `/${feature.name.toLowerCase().replace(/\s+/g, '-')}/:id`,
          description: `Detailed view for individual ${feature.name}`
        });
      }
    }
  });

  return pages;
}

function generateComponentsFromFeatures(features: any[]): any[] {
  const components = [];

  features.forEach(feature => {
    // List component
    components.push({
      name: `${feature.name.replace(/\s+/g, '')}List`,
      type: 'container',
      description: `Display list of ${feature.name}`
    });

    // Form component
    if (feature.endpoints?.some((e: any) => e.method === 'POST' || e.method === 'PUT')) {
      components.push({
        name: `${feature.name.replace(/\s+/g, '')}Form`,
        type: 'form',
        description: `Form for creating/editing ${feature.name}`
      });
    }

    // Card/Item component
    components.push({
      name: `${feature.name.replace(/\s+/g, '')}Card`,
      type: 'display',
      description: `Display card for ${feature.name}`
    });
  });

  // Common components
  components.push(
    { name: 'Header', type: 'layout', description: 'App header with navigation' },
    { name: 'Sidebar', type: 'layout', description: 'Navigation sidebar' },
    { name: 'LoadingSpinner', type: 'utility', description: 'Loading state indicator' },
    { name: 'ErrorBoundary', type: 'utility', description: 'Error handling wrapper' }
  );

  return components;
}

function generateStoresFromDataModel(dataModel: any): any[] {
  if (!dataModel) return [];
  
  return Object.keys(dataModel).map(modelName => ({
    name: `${modelName}Store`,
    state: dataModel[modelName],
    actions: ['fetch', 'create', 'update', 'delete', 'reset']
  }));
}

function extractEndpointsFromFeatures(features: any[]): any[] {
  const endpoints: any[] = [];
  
  features.forEach(feature => {
    if (feature.endpoints) {
      feature.endpoints.forEach((endpoint: any) => {
        endpoints.push({
          ...endpoint,
          feature: feature.name
        });
      });
    }
  });
  
  return endpoints;
}

async function generateFrontendPrompt(bigSpec: any, frontSpec: any, preferences: DesignPreferences, interactions: any): Promise<string> {
  const prompt = `# ${bigSpec.name} - Frontend Implementation

Create a modern, responsive web application with the following specifications:

## Project Overview
${bigSpec.description}

## Design Requirements

### Visual Design & Feel
- **Vibe**: ${preferences.vibe}
- **Emotions**: Users should feel ${preferences.emotions.join(', ').toLowerCase()}
- **Style**: ${preferences.style}
- **Color Scheme**: ${preferences.colorScheme}
- **Target Audience**: ${preferences.targetAudience}
${preferences.inspiration ? `- **Inspiration**: ${preferences.inspiration}` : ''}

### Interactions & Animations
- ${interactions.animations ? 'Smooth animations and transitions throughout' : 'Minimal animations'}
- ${interactions.microInteractions ? 'Micro-interactions on all interactive elements' : 'Simple interactions only'}
- **Interface Complexity**: ${interactions.complexity}

## Technical Stack
- **Framework**: ${frontSpec.framework}
- **Styling**: ${frontSpec.styling}
- **State Management**: ${frontSpec.state_management.tool}
- **Build Tool**: Vite
- **Type Safety**: TypeScript with strict mode

## Features to Implement

${bigSpec.features.map((feature: any) => `### ${feature.name}
${feature.description}
${feature.endpoints ? `
**API Endpoints:**
${feature.endpoints.map((e: any) => `- ${e.method} ${e.path} - ${e.description}`).join('\n')}
` : ''}`).join('\n\n')}

## Pages & Routes

${frontSpec.pages.map((page: any) => `- **${page.name}** (${page.path}): ${page.description}`).join('\n')}

## Components Structure

${frontSpec.components.map((c: any) => `- **${c.name}** (${c.type}): ${c.description}`).join('\n')}

## State Management

Using ${frontSpec.state_management.tool} for state management with the following stores:

${frontSpec.state_management.stores.map((store: any) => `### ${store.name}
- State: ${store.state.map((s: any) => `${s.split(':')[0]}`).join(', ')}
- Actions: ${store.actions.join(', ')}`).join('\n\n')}

## API Integration

Base URL: \`${frontSpec.api_integration.baseUrl}\`

${frontSpec.api_integration.endpoints.map((endpoint: any) => 
  `- ${endpoint.method} ${endpoint.path} (${endpoint.feature})`
).join('\n')}

## UI/UX Requirements

1. **Responsive Design**
   - Mobile-first approach
   - Breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop)
   
2. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation support
   - Screen reader friendly
   
3. **Performance**
   - Lazy loading for routes
   - Image optimization
   - Code splitting by route

4. **Error Handling**
   - User-friendly error messages
   - Retry mechanisms for failed requests
   - Offline state handling

## Styling Guidelines

1. Use Tailwind CSS utility classes
2. Create custom components for repeated patterns
3. Implement a consistent spacing system
4. Use CSS variables for theme values
5. Support dark mode (if applicable)

## Development Setup

Please create a complete, production-ready application with:
- All pages and components fully implemented
- Complete TypeScript types
- Error boundaries and loading states
- Form validation
- Responsive design
- Clean, maintainable code structure

The application should be immediately usable and visually polished, matching the design requirements specified above.`;

  return prompt;
}