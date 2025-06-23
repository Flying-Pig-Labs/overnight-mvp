import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import yaml from 'yaml';
import path from 'path';
import { BedrockClient } from '../lib/bedrock-client.js';
import { listAvailableMVPs, resolveMVPName } from '../lib/mvp-resolver.js';

interface FrontendOptions {
  output?: string;
  model: string;
  shortname?: string;
}

interface DesignPreferences {
  vibe: string;
  emotions: string[];
  style: string;
  colorScheme: string;
  targetAudience: string;
  inspiration: string;
}

export async function frontendCommand(options: FrontendOptions) {
  console.log(chalk.bold.cyan('\n🎨 Frontend Design Session\n'));
  
  try {
    // Get list of available MVPs
    const availableMVPs = await listAvailableMVPs();
    const nonExampleMVPs = availableMVPs.filter(mvp => mvp !== 'example-mvp');
    
    // Skip the check if using --shortname (allows testing with example-mvp)
    if (!options.shortname && nonExampleMVPs.length === 0) {
      console.log(chalk.yellow('No MVPs found. Please run "make mvp" first to create an MVP.'));
      return;
    }

    // Select MVP
    let selectedMVP: string;
    if (options.shortname) {
      // When using shortname, check against all MVPs (including example-mvp)
      if (!availableMVPs.includes(options.shortname)) {
        console.error(chalk.red(`MVP '${options.shortname}' not found.`));
        console.log(chalk.gray('Available MVPs:'));
        availableMVPs.forEach(mvp => console.log(chalk.gray(`  - ${mvp}`)));
        return;
      }
      selectedMVP = options.shortname;
    } else {
      const { mvpChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'mvpChoice',
          message: 'Which MVP do you want to create a frontend for?',
          choices: nonExampleMVPs
        }
      ]);
      selectedMVP = mvpChoice;
    }

    const mvpPaths = await resolveMVPName(selectedMVP);
    console.log(chalk.gray(`\nGenerating frontend for: ${chalk.bold(selectedMVP)}`));
    
    // Check if frontend spec already exists
    if (existsSync(mvpPaths.frontspecPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow('Frontend specification already exists. Overwrite?'),
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.gray('Frontend generation cancelled.'));
        return;
      }
    }

    console.log(chalk.gray('Let\'s create a beautiful frontend for your MVP.'));
    console.log(chalk.gray('I\'ll ask you about the look, feel, and user experience.\n'));

    // Load the mvpspec
    const specContent = await readFile(mvpPaths.mvpspecPath, 'utf-8');
    const mvpSpec = yaml.parse(specContent);

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

    try {
      // Ensure prompts directory exists
      await mkdir(mvpPaths.promptsDir, { recursive: true });
      
      // Load the frontend template and prompt
      const templatePath = path.join(process.cwd(), 'templates', '2-frontspec-template.yaml');
      const promptPath = path.join(process.cwd(), 'prompts', '3-populate-frontspec-prompt.md');
      
      const templateContent = await readFile(templatePath, 'utf-8');
      const promptTemplate = await readFile(promptPath, 'utf-8');

      // Create the frontend spec from mvpspec
      const frontSpec = await generateFrontendSpec(mvpSpec, preferences, interactionAnswers);
      
      // Generate the Lovable.dev prompt
      const prompt = await generateFrontendPrompt(mvpSpec, frontSpec, preferences, interactionAnswers, promptTemplate);

      // Save the prompt to prompts directory first
      await writeFile(mvpPaths.frontendMakePromptPath, prompt);

      // Save outputs
      const outputPath = options.output || mvpPaths.frontendPromptPath;
      const frontSpecPath = mvpPaths.frontspecPath;
      
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
      spinner.fail(chalk.red('Failed to generate frontend specification'));
      throw error;
    }

  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

async function generateFrontendSpec(mvpSpec: any, preferences: DesignPreferences, interactions: any): Promise<any> {
  // Transform mvpspec into detailed frontend specification
  return {
    name: `${mvpSpec.name} Frontend`,
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
    pages: generatePagesFromFeatures(mvpSpec.features),
    components: generateComponentsFromFeatures(mvpSpec.features),
    state_management: {
      tool: 'Zustand',
      stores: generateStoresFromDataModel(mvpSpec.data_model)
    },
    api_integration: {
      baseUrl: 'process.env.REACT_APP_API_URL',
      endpoints: extractEndpointsFromFeatures(mvpSpec.features)
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

async function generateFrontendPrompt(mvpSpec: any, frontSpec: any, preferences: DesignPreferences, interactions: any, promptTemplate: string): Promise<string> {
  const basePrompt = `# Context

You are a senior AI application engineer using Lovable to build a complete, production-ready application frontend.

Below this prompt is a full specification file called \`mvpspec.yml\` that serves as your Knowledge Base and single source of truth. It contains the project's overview, features, API endpoints, data models, UI requirements, and technical constraints.

## Task

Build the complete frontend application described in \`mvpspec.yml\` from scratch in Lovable, with all API calls properly stubbed for a backend that doesn't exist yet.

### Guidelines

**Tech Stack Requirements:**
- Frontend Framework: React + TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui components
- State Management: Use appropriate solution (Zustand/Context API)
- Build Tool: Vite
- API Client: Axios or Fetch API

**Backend Architecture (Already Decided):**
- The backend will be AWS Lambda + DynamoDB + API Gateway
- Do NOT suggest alternative backend architectures
- Do NOT implement any backend code
- Focus exclusively on the frontend implementation

**Development Approach:**
1. Start by parsing the \`mvpspec.yml\` and summarizing the application
2. Scaffold the base layout and navigation structure
3. Create all pages and routes based on UI requirements
4. Implement components progressively from layout → containers → features
5. Wire up all API calls with proper error handling
6. Ensure mobile-first, responsive design throughout

#### Constraints

**API Implementation Requirements:**
- Make REAL HTTP calls to placeholder endpoints (e.g., \`http://localhost:3001/api/...\`)
- All API calls will initially fail with 404 errors - this is expected
- When any API call fails, show a toast/notification bubble with: "API not implemented yet: [Action Name]"
- Use a toast library (react-hot-toast or similar) for notifications
- Handle errors gracefully without breaking the UI flow
- Structure request payloads exactly as the backend will expect them
- Include proper headers (Content-Type, etc.)
- Show loading states during API calls

**Example API Implementation:**
\`\`\`typescript
const createUser = async (userData: UserData) => {
  try {
    setLoading(true);
    const response = await axios.post('http://localhost:3001/api/users', userData);
    return response.data;
  } catch (error) {
    toast.error('API not implemented yet: Creating user');
    // Optionally return mock data to keep UI functional
    return { id: 'mock-id', ...userData };
  } finally {
    setLoading(false);
  }
};
\`\`\`

**Strict Requirements:**
- Do NOT invent features not in the specification
- Do NOT modify field names, endpoints, or data types
- Do NOT implement authentication unless specified
- Do NOT create backend code or serverless functions
- Maintain clean separation of concerns
- Follow the exact URL patterns from the spec

# Instructions

1. First, parse and understand the complete \`mvpspec.yml\` below
2. Create a clear mental model of the application's structure
3. Build the frontend systematically, starting with layout and navigation
4. Implement all features with proper API stubs as described above
5. Ensure the UI is polished, responsive, and production-ready

## Design Specifications

**Visual Design Requirements:**
- **Style**: ${preferences.style}
- **Color Palette**: ${preferences.colorScheme}
- **Target Audience**: ${preferences.targetAudience}
- **Brand Personality**: ${preferences.vibe}
- **User Emotions**: ${preferences.emotions.join(', ').toLowerCase()}
${preferences.inspiration ? `- **Design Inspiration**: ${preferences.inspiration}` : ''}

**Interaction Design:**
- ${interactions.animations ? 'Smooth animations and transitions on all interactions' : 'Minimal animations, focus on performance'}
- ${interactions.microInteractions ? 'Rich micro-interactions (hover effects, loading states, transitions)' : 'Simple, functional interactions only'}
- **Interface Complexity**: ${interactions.complexity}
- Error states should be friendly and helpful
- Success states should be celebratory but professional

## MVP Specification

\`\`\`yaml
${yaml.stringify(mvpSpec)}
\`\`\``;

  return basePrompt;
}