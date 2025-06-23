import chalk from 'chalk';
import ora from 'ora';
import { writeFile, mkdir } from 'fs/promises';
import yaml from 'yaml';
import path from 'path';

interface ExampleOptions {
  outputDir: string;
}

export async function exampleCommand(options: ExampleOptions) {
  console.log(chalk.bold.cyan('\n🔄 Generating Example MVP\n'));
  console.log(chalk.gray('Creating a complete task tracker example with all specifications and prompts.'));

  const spinner = ora('Creating example MVP files...').start();

  try {
    // Ensure output directory exists
    await mkdir(options.outputDir, { recursive: true });

    // Generate all example files
    const bigSpec = getExampleBigSpec();
    const frontSpec = getExampleFrontSpec();
    const backSpec = getExampleBackSpec();
    const frontendPrompt = getExampleFrontendPrompt(bigSpec, frontSpec);
    const backendPrompt = getExampleBackendPrompt(bigSpec, backSpec);

    // Save all files
    await writeFile(path.join(options.outputDir, 'bigspec.yaml'), yaml.stringify(bigSpec));
    await writeFile(path.join(options.outputDir, 'frontspec.yaml'), yaml.stringify(frontSpec));
    await writeFile(path.join(options.outputDir, 'backspec.yaml'), yaml.stringify(backSpec));
    await writeFile(path.join(options.outputDir, 'frontend-prompt.txt'), frontendPrompt);
    await writeFile(path.join(options.outputDir, 'backend-prompt.txt'), backendPrompt);

    spinner.succeed(chalk.green('✅ Example MVP generated successfully!'));
    
    console.log(chalk.bold.cyan('\n📁 Generated Files:'));
    console.log(chalk.gray(`- ${options.outputDir}/bigspec.yaml`));
    console.log(chalk.gray(`- ${options.outputDir}/frontspec.yaml`));
    console.log(chalk.gray(`- ${options.outputDir}/backspec.yaml`));
    console.log(chalk.gray(`- ${options.outputDir}/frontend-prompt.txt`));
    console.log(chalk.gray(`- ${options.outputDir}/backend-prompt.txt`));
    
    console.log(chalk.bold.cyan('\n🎯 Example MVP: Task Tracker'));
    console.log(chalk.gray('A simple but complete task management application featuring:'));
    console.log(chalk.gray('- Task CRUD operations'));
    console.log(chalk.gray('- Category management'));
    console.log(chalk.gray('- Modern React frontend'));
    console.log(chalk.gray('- Serverless AWS backend'));
    console.log(chalk.gray('\nUse this as a reference for your own MVPs!\n'));

  } catch (error) {
    spinner.fail(chalk.red('Failed to generate example MVP'));
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

function getExampleBigSpec() {
  return {
    name: 'Task Tracker MVP',
    description: 'A simple task tracking application for personal productivity',
    features: [
      {
        name: 'Task Management',
        description: 'Create, read, update, and delete tasks',
        endpoints: [
          {
            method: 'POST',
            path: '/tasks',
            description: 'Create a new task'
          },
          {
            method: 'GET',
            path: '/tasks',
            description: 'List all tasks with optional filtering'
          },
          {
            method: 'GET',
            path: '/tasks/{id}',
            description: 'Get a specific task'
          },
          {
            method: 'PUT',
            path: '/tasks/{id}',
            description: 'Update a task'
          },
          {
            method: 'DELETE',
            path: '/tasks/{id}',
            description: 'Delete a task'
          }
        ]
      },
      {
        name: 'Task Categories',
        description: 'Organize tasks by categories',
        endpoints: [
          {
            method: 'GET',
            path: '/categories',
            description: 'List all categories'
          },
          {
            method: 'POST',
            path: '/categories',
            description: 'Create a new category'
          },
          {
            method: 'PUT',
            path: '/categories/{id}',
            description: 'Update a category'
          },
          {
            method: 'DELETE',
            path: '/categories/{id}',
            description: 'Delete a category'
          }
        ]
      }
    ],
    data_model: {
      task: [
        'id: string',
        'title: string',
        'description: string',
        'completed: boolean',
        'priority: string',
        'dueDate: string',
        'categoryId: string',
        'createdAt: timestamp',
        'updatedAt: timestamp'
      ],
      category: [
        'id: string',
        'name: string',
        'color: string',
        'icon: string',
        'createdAt: timestamp'
      ]
    },
    ui_requirements: [
      'Task list view with filtering and sorting',
      'Task creation and editing forms',
      'Category management interface',
      'Dashboard with task statistics',
      'Responsive design for mobile and desktop',
      'Dark mode support'
    ],
    technical_requirements: [
      'React frontend with TypeScript',
      'Serverless backend on AWS',
      'Real-time updates',
      'Offline capability',
      'Export tasks to CSV'
    ]
  };
}

function getExampleFrontSpec() {
  return {
    name: 'Task Tracker Frontend',
    framework: 'React with TypeScript',
    styling: 'Tailwind CSS',
    design: {
      vibe: 'clean and professional',
      emotions: ['focused', 'accomplished', 'organized'],
      style: 'Minimal & Clean',
      colorScheme: 'blue primary with neutral grays',
      animations: true,
      microInteractions: true,
      complexity: 'balanced'
    },
    pages: [
      {
        name: 'Dashboard',
        path: '/',
        description: 'Overview with task statistics and quick actions'
      },
      {
        name: 'Tasks',
        path: '/tasks',
        description: 'Complete task list with filtering and sorting'
      },
      {
        name: 'Task Detail',
        path: '/tasks/:id',
        description: 'Detailed view and edit form for a single task'
      },
      {
        name: 'Categories',
        path: '/categories',
        description: 'Manage task categories'
      },
      {
        name: 'Settings',
        path: '/settings',
        description: 'User preferences and app settings'
      }
    ],
    components: [
      {
        name: 'TaskList',
        type: 'container',
        description: 'Displays tasks with filtering and sorting options'
      },
      {
        name: 'TaskCard',
        type: 'display',
        description: 'Individual task display with quick actions'
      },
      {
        name: 'TaskForm',
        type: 'form',
        description: 'Create and edit tasks'
      },
      {
        name: 'CategoryPicker',
        type: 'input',
        description: 'Select or create categories'
      },
      {
        name: 'StatsWidget',
        type: 'display',
        description: 'Shows task completion statistics'
      },
      {
        name: 'FilterBar',
        type: 'control',
        description: 'Filter tasks by status, category, date'
      },
      {
        name: 'Header',
        type: 'layout',
        description: 'App header with navigation and user menu'
      },
      {
        name: 'Sidebar',
        type: 'layout',
        description: 'Navigation sidebar with category list'
      }
    ],
    state_management: {
      tool: 'Zustand',
      stores: [
        {
          name: 'taskStore',
          state: ['tasks', 'filters', 'sorting', 'loading'],
          actions: ['fetchTasks', 'createTask', 'updateTask', 'deleteTask', 'setFilter', 'setSorting']
        },
        {
          name: 'categoryStore',
          state: ['categories', 'selectedCategory'],
          actions: ['fetchCategories', 'createCategory', 'updateCategory', 'deleteCategory', 'selectCategory']
        },
        {
          name: 'uiStore',
          state: ['darkMode', 'sidebarOpen', 'notifications'],
          actions: ['toggleDarkMode', 'toggleSidebar', 'addNotification', 'removeNotification']
        }
      ]
    },
    api_integration: {
      baseUrl: 'process.env.REACT_APP_API_URL',
      endpoints: [
        { method: 'POST', path: '/tasks', feature: 'Task Management' },
        { method: 'GET', path: '/tasks', feature: 'Task Management' },
        { method: 'GET', path: '/tasks/{id}', feature: 'Task Management' },
        { method: 'PUT', path: '/tasks/{id}', feature: 'Task Management' },
        { method: 'DELETE', path: '/tasks/{id}', feature: 'Task Management' },
        { method: 'GET', path: '/categories', feature: 'Task Categories' },
        { method: 'POST', path: '/categories', feature: 'Task Categories' },
        { method: 'PUT', path: '/categories/{id}', feature: 'Task Categories' },
        { method: 'DELETE', path: '/categories/{id}', feature: 'Task Categories' }
      ]
    }
  };
}

function getExampleBackSpec() {
  return {
    name: 'Task Tracker Backend',
    architecture: 'Serverless (Lambda + DynamoDB + API Gateway)',
    runtime: 'Node.js 20.x',
    database: {
      type: 'DynamoDB',
      tables: [
        {
          name: 'Tasks',
          partition_key: 'userId',
          sort_key: 'taskId',
          attributes: [
            'title: string',
            'description: string',
            'completed: boolean',
            'priority: string',
            'dueDate: string',
            'createdAt: timestamp',
            'updatedAt: timestamp'
          ],
          indexes: [
            {
              name: 'CategoryIndex',
              partition_key: 'categoryId',
              sort_key: 'createdAt'
            },
            {
              name: 'StatusIndex',
              partition_key: 'completed',
              sort_key: 'dueDate'
            }
          ]
        },
        {
          name: 'Categories',
          partition_key: 'userId',
          sort_key: 'categoryId',
          attributes: [
            'name: string',
            'color: string',
            'icon: string',
            'createdAt: timestamp'
          ],
          indexes: []
        }
      ]
    },
    lambdas: [
      {
        name: 'CreateTask',
        handler: 'handlers/tasks.createTask',
        method: 'POST',
        path: '/tasks',
        description: 'Create a new task',
        environment: {
          TABLE_NAME: 'Tasks'
        }
      },
      {
        name: 'ListTasks',
        handler: 'handlers/tasks.listTasks',
        method: 'GET',
        path: '/tasks',
        description: 'List all tasks with optional filtering',
        environment: {
          TABLE_NAME: 'Tasks'
        }
      },
      {
        name: 'GetTask',
        handler: 'handlers/tasks.getTask',
        method: 'GET',
        path: '/tasks/{id}',
        description: 'Get a specific task',
        environment: {
          TABLE_NAME: 'Tasks'
        }
      },
      {
        name: 'UpdateTask',
        handler: 'handlers/tasks.updateTask',
        method: 'PUT',
        path: '/tasks/{id}',
        description: 'Update a task',
        environment: {
          TABLE_NAME: 'Tasks'
        }
      },
      {
        name: 'DeleteTask',
        handler: 'handlers/tasks.deleteTask',
        method: 'DELETE',
        path: '/tasks/{id}',
        description: 'Delete a task',
        environment: {
          TABLE_NAME: 'Tasks'
        }
      },
      {
        name: 'ListCategories',
        handler: 'handlers/categories.listCategories',
        method: 'GET',
        path: '/categories',
        description: 'List all categories',
        environment: {
          TABLE_NAME: 'Categories'
        }
      },
      {
        name: 'CreateCategory',
        handler: 'handlers/categories.createCategory',
        method: 'POST',
        path: '/categories',
        description: 'Create a new category',
        environment: {
          TABLE_NAME: 'Categories'
        }
      },
      {
        name: 'UpdateCategory',
        handler: 'handlers/categories.updateCategory',
        method: 'PUT',
        path: '/categories/{id}',
        description: 'Update a category',
        environment: {
          TABLE_NAME: 'Categories'
        }
      },
      {
        name: 'DeleteCategory',
        handler: 'handlers/categories.deleteCategory',
        method: 'DELETE',
        path: '/categories/{id}',
        description: 'Delete a category',
        environment: {
          TABLE_NAME: 'Categories'
        }
      }
    ],
    api_gateway: {
      type: 'REST',
      cors: true,
      authorization: 'API Key',
      throttling: {
        rate_limit: 1000,
        burst_limit: 2000
      }
    },
    infrastructure: {
      iac: 'AWS SAM',
      monitoring: 'CloudWatch',
      tracing: 'X-Ray'
    }
  };
}

function getExampleFrontendPrompt(bigSpec: any, frontSpec: any): string {
  return `# Task Tracker MVP - Frontend Implementation

Create a modern, responsive task tracking application with the following specifications:

## Project Overview
A simple task tracking application for personal productivity

## Design Requirements

### Visual Design & Feel
- **Vibe**: clean and professional
- **Emotions**: Users should feel focused, accomplished, organized
- **Style**: Minimal & Clean
- **Color Scheme**: blue primary with neutral grays
- **Target Audience**: Productivity-focused individuals

### Interactions & Animations
- Smooth animations and transitions throughout
- Micro-interactions on all interactive elements
- **Interface Complexity**: balanced

## Technical Stack
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Vite
- **Type Safety**: TypeScript with strict mode

## Features to Implement

### Task Management
Create, read, update, and delete tasks

**API Endpoints:**
- POST /tasks - Create a new task
- GET /tasks - List all tasks with optional filtering
- GET /tasks/{id} - Get a specific task
- PUT /tasks/{id} - Update a task
- DELETE /tasks/{id} - Delete a task

### Task Categories
Organize tasks by categories

**API Endpoints:**
- GET /categories - List all categories
- POST /categories - Create a new category
- PUT /categories/{id} - Update a category
- DELETE /categories/{id} - Delete a category

## Pages & Routes

- **Dashboard** (/): Overview with task statistics and quick actions
- **Tasks** (/tasks): Complete task list with filtering and sorting
- **Task Detail** (/tasks/:id): Detailed view and edit form for a single task
- **Categories** (/categories): Manage task categories
- **Settings** (/settings): User preferences and app settings

## Components Structure

### Container Components
- **TaskList**: Displays tasks with filtering and sorting options

### Display Components
- **TaskCard**: Individual task display with quick actions
- **StatsWidget**: Shows task completion statistics

### Form Components
- **TaskForm**: Create and edit tasks

### Input Components
- **CategoryPicker**: Select or create categories

### Control Components
- **FilterBar**: Filter tasks by status, category, date

### Layout Components
- **Header**: App header with navigation and user menu
- **Sidebar**: Navigation sidebar with category list

## State Management

Using Zustand for state management with the following stores:

### taskStore
- State: tasks, filters, sorting, loading
- Actions: fetchTasks, createTask, updateTask, deleteTask, setFilter, setSorting

### categoryStore
- State: categories, selectedCategory
- Actions: fetchCategories, createCategory, updateCategory, deleteCategory, selectCategory

### uiStore
- State: darkMode, sidebarOpen, notifications
- Actions: toggleDarkMode, toggleSidebar, addNotification, removeNotification

## API Integration

Base URL: \`process.env.REACT_APP_API_URL\`

- POST /tasks (Task Management)
- GET /tasks (Task Management)
- GET /tasks/{id} (Task Management)
- PUT /tasks/{id} (Task Management)
- DELETE /tasks/{id} (Task Management)
- GET /categories (Task Categories)
- POST /categories (Task Categories)
- PUT /categories/{id} (Task Categories)
- DELETE /categories/{id} (Task Categories)

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

## Additional Features

- Task filtering by status, category, and date range
- Sorting by priority, due date, or creation date
- Bulk actions (mark multiple as complete, delete multiple)
- Quick task creation with minimal fields
- Keyboard shortcuts for power users
- Export tasks to CSV format
- Dark mode toggle
- Task statistics dashboard
- Due date reminders
- Search functionality

## Styling Guidelines

1. Use Tailwind CSS utility classes
2. Create custom components for repeated patterns
3. Implement a consistent spacing system
4. Use CSS variables for theme values
5. Support dark mode with Tailwind's dark: modifier

## Development Setup

Please create a complete, production-ready application with:
- All pages and components fully implemented
- Complete TypeScript types
- Error boundaries and loading states
- Form validation with Zod or Yup
- Responsive design for all screen sizes
- Clean, maintainable code structure
- Proper accessibility attributes
- Performance optimizations

The application should be immediately usable and visually polished, matching the design requirements specified above.`;
}

function getExampleBackendPrompt(bigSpec: any, backSpec: any): string {
  return `# Task Tracker MVP - Serverless Backend Implementation

Create a production-ready serverless backend using AWS Lambda, DynamoDB, and API Gateway.

## Project Overview
A simple task tracking application for personal productivity

## Architecture Requirements

### Core Technologies
- **Runtime**: Node.js 20.x
- **Database**: DynamoDB
- **API**: REST API Gateway
- **IaC**: AWS SAM
- **Monitoring**: CloudWatch
- **Tracing**: X-Ray

### DynamoDB Tables

#### Tasks Table
- **Partition Key**: userId (String)
- **Sort Key**: taskId (String)
- **Attributes**: 
  - title (string)
  - description (string)
  - completed (boolean)
  - priority (string)
  - dueDate (string)
  - createdAt (timestamp)
  - updatedAt (timestamp)
- **Global Secondary Indexes**:
  - CategoryIndex: PK=categoryId, SK=createdAt
  - StatusIndex: PK=completed, SK=dueDate

#### Categories Table
- **Partition Key**: userId (String)
- **Sort Key**: categoryId (String)
- **Attributes**: 
  - name (string)
  - color (string)
  - icon (string)
  - createdAt (timestamp)

### Lambda Functions

#### CreateTask
- **Handler**: handlers/tasks.createTask
- **HTTP Method**: POST
- **Path**: /tasks
- **Description**: Create a new task
- **Environment Variables**:
  - TABLE_NAME: Tasks

#### ListTasks
- **Handler**: handlers/tasks.listTasks
- **HTTP Method**: GET
- **Path**: /tasks
- **Description**: List all tasks with optional filtering
- **Environment Variables**:
  - TABLE_NAME: Tasks

#### GetTask
- **Handler**: handlers/tasks.getTask
- **HTTP Method**: GET
- **Path**: /tasks/{id}
- **Description**: Get a specific task
- **Environment Variables**:
  - TABLE_NAME: Tasks

#### UpdateTask
- **Handler**: handlers/tasks.updateTask
- **HTTP Method**: PUT
- **Path**: /tasks/{id}
- **Description**: Update a task
- **Environment Variables**:
  - TABLE_NAME: Tasks

#### DeleteTask
- **Handler**: handlers/tasks.deleteTask
- **HTTP Method**: DELETE
- **Path**: /tasks/{id}
- **Description**: Delete a task
- **Environment Variables**:
  - TABLE_NAME: Tasks

#### ListCategories
- **Handler**: handlers/categories.listCategories
- **HTTP Method**: GET
- **Path**: /categories
- **Description**: List all categories
- **Environment Variables**:
  - TABLE_NAME: Categories

#### CreateCategory
- **Handler**: handlers/categories.createCategory
- **HTTP Method**: POST
- **Path**: /categories
- **Description**: Create a new category
- **Environment Variables**:
  - TABLE_NAME: Categories

#### UpdateCategory
- **Handler**: handlers/categories.updateCategory
- **HTTP Method**: PUT
- **Path**: /categories/{id}
- **Description**: Update a category
- **Environment Variables**:
  - TABLE_NAME: Categories

#### DeleteCategory
- **Handler**: handlers/categories.deleteCategory
- **HTTP Method**: DELETE
- **Path**: /categories/{id}
- **Description**: Delete a category
- **Environment Variables**:
  - TABLE_NAME: Categories

### API Gateway Configuration

- **Type**: REST
- **CORS**: Enabled for all origins
- **Authorization**: API Key
- **Rate Limiting**: 1000 requests/second
- **Burst Limit**: 2000 requests

## Implementation Requirements

### 1. Project Structure
\`\`\`
backend/
├── template.yaml          # SAM template
├── package.json
├── tsconfig.json
├── src/
│   ├── handlers/         # Lambda function handlers
│   │   ├── tasks.ts
│   │   └── categories.ts
│   ├── services/         # Business logic
│   │   ├── taskService.ts
│   │   └── categoryService.ts
│   ├── models/           # Data models
│   │   ├── Task.ts
│   │   └── Category.ts
│   ├── utils/            # Shared utilities
│   │   ├── dynamodb.ts
│   │   ├── response.ts
│   │   └── validation.ts
│   └── types/            # TypeScript types
│       └── index.ts
└── tests/                # Unit and integration tests
\`\`\`

### 2. Lambda Function Implementation

Each Lambda function should:
- Use TypeScript for type safety
- Implement proper error handling with meaningful error messages
- Include input validation using Zod
- Return consistent response formats
- Include correlation IDs for request tracing
- Implement proper logging using structured logs

### 3. DynamoDB Best Practices

- Use single-table design where appropriate
- Implement optimistic locking for updates
- Use batch operations for bulk actions
- Implement proper pagination using LastEvaluatedKey
- Design partition keys to avoid hot partitions
- Use transactions for atomic operations

### 4. Security Requirements

- Implement least-privilege IAM roles
- Use environment variables for configuration
- Enable API Gateway request validation
- Implement rate limiting per API key
- Use AWS Secrets Manager for sensitive data
- Enable AWS WAF for additional protection

### 5. Error Handling

Implement consistent error responses:
\`\`\`json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": {...},
    "correlationId": "uuid"
  }
}
\`\`\`

### 6. Monitoring & Observability

- CloudWatch Logs for all Lambda functions
- Custom CloudWatch metrics for business KPIs
- X-Ray tracing for performance monitoring
- CloudWatch alarms for error rates and latencies
- Structured logging with JSON format

### 7. Testing Strategy

- Unit tests for all business logic
- Integration tests for API endpoints
- Load testing configuration
- Local testing with SAM CLI

### 8. Deployment Configuration

Include in template.yaml:
- API Gateway stage variables
- Lambda environment configurations
- DynamoDB provisioned throughput settings
- CloudWatch log retention policies
- API usage plans and API keys

### 9. Sample Implementation

#### Task Handler Example:
\`\`\`typescript
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  categoryId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional()
});

export const createTask: APIGatewayProxyHandler = async (event) => {
  const correlationId = event.headers['x-correlation-id'] || uuidv4();
  
  try {
    const body = JSON.parse(event.body || '{}');
    const validated = CreateTaskSchema.parse(body);
    
    const task = {
      userId: event.requestContext.authorizer?.userId || 'anonymous',
      taskId: uuidv4(),
      ...validated,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await docClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: task
    }));
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId
      },
      body: JSON.stringify({ data: task })
    };
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers: { 'X-Correlation-Id': correlationId },
        body: JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
            correlationId
          }
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: { 'X-Correlation-Id': correlationId },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          correlationId
        }
      })
    };
  }
};
\`\`\`

## Features to Implement

### Task Management
Create, read, update, and delete tasks

**Required Endpoints:**
- POST /tasks - Create a new task
- GET /tasks - List all tasks with optional filtering
- GET /tasks/{id} - Get a specific task
- PUT /tasks/{id} - Update a task
- DELETE /tasks/{id} - Delete a task

### Task Categories
Organize tasks by categories

**Required Endpoints:**
- GET /categories - List all categories
- POST /categories - Create a new category
- PUT /categories/{id} - Update a category
- DELETE /categories/{id} - Delete a category

## Additional Features to Implement

1. **Filtering & Sorting**
   - Filter tasks by category, status, priority, date range
   - Sort by creation date, due date, priority
   - Full-text search in task titles and descriptions

2. **Bulk Operations**
   - Bulk update task status
   - Bulk delete tasks
   - Bulk move tasks to different categories

3. **Data Export**
   - Export tasks to CSV format
   - Export filtered task lists
   - Include all task metadata in exports

4. **Performance Optimizations**
   - Implement caching strategies
   - Use DynamoDB batch operations
   - Optimize query patterns

## Deliverables

1. Complete SAM template (template.yaml)
2. All Lambda function implementations
3. DynamoDB table definitions
4. API Gateway configuration
5. IAM roles and policies
6. Environment configuration files
7. Deployment scripts
8. README with setup instructions

Please generate a complete, production-ready serverless backend that can be deployed immediately using SAM CLI.`;
}