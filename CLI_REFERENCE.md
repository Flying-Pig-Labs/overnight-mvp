# 🔧 CLI Reference

## Commands

### `mvp` - Interactive MVP Builder
```bash
overnight-mvp mvp [options]
```
Start an interactive session to define your MVP specification.

**Options:**
- `-o, --output <file>` - Output file (default: saves to current directory)
- `--model <model>` - Bedrock model to use (default: `anthropic.claude-3-5-sonnet-20241022-v2:0`)

**Alias:** `chat` (for backward compatibility)

### `frontend` - Generate Frontend Implementation
```bash
overnight-mvp frontend <spec> [options]
```
Generate frontend implementation with interactive design session.

**Arguments:**
- `<spec>` - Path to the bigspec.yaml file

**Options:**
- `-o, --output <file>` - Output file for the prompt
- `--model <model>` - Bedrock model to use

### `backend` - Generate Backend Implementation
```bash
overnight-mvp backend <spec> [options]
```
Generate AWS Lambda + DynamoDB backend implementation.

**Arguments:**
- `<spec>` - Path to the bigspec.yaml file

**Options:**
- `-o, --output <file>` - Output file for the prompt
- `--model <model>` - Bedrock model to use

### `lovable` - Generate Lovable.dev Prompt
```bash
overnight-mvp lovable <spec> [options]
```
Convert MVP spec to Lovable.dev prompt.

**Arguments:**
- `<spec>` - Path to the MVP specification file

**Options:**
- `-o, --output <file>` - Output file (default: `lovable-prompt.txt`)
- `--copy` - Copy the prompt to clipboard

### `s3-site` - Generate S3/CloudFront Deployment
```bash
overnight-mvp s3-site [options]
```
Generate AWS S3/CloudFront deployment instructions for a GitHub repo.

**Options:**
- `-r, --repo <url>` - GitHub repository URL
- `-o, --output <file>` - Output file (default: `s3-deployment-prompt.txt`)
- `--copy` - Copy the prompt to clipboard

### `example` - Generate Example MVP
```bash
overnight-mvp example [options]
```
Generate a complete example MVP with all specifications and prompts.

**Options:**
- `--output-dir <dir>` - Output directory (default: `mvps/example-mvp`)

### `run` - Execute Full Workflow
```bash
overnight-mvp run <spec> [options]
```
Run the complete MVP workflow from a specification file.

**Arguments:**
- `<spec>` - Path to the MVP specification file

**Options:**
- `--skip-frontend` - Skip frontend generation
- `--skip-backend` - Skip backend generation
- `--dry-run` - Show what would be done without executing

### `analyze` - Analyze Frontend Code
```bash
overnight-mvp analyze <frontend-path> [options]
```
Analyze frontend code to extract API requirements.

**Arguments:**
- `<frontend-path>` - Path to the frontend code directory

**Options:**
- `-o, --output <file>` - Output file (default: `api-spec.yaml`)

### `deploy` - Deploy to AWS
```bash
overnight-mvp deploy <project-path> [options]
```
Deploy the MVP to AWS infrastructure.

**Arguments:**
- `<project-path>` - Path to the project directory

**Options:**
- `--frontend-only` - Deploy only the frontend
- `--backend-only` - Deploy only the backend
- `--stage <stage>` - Deployment stage (default: `prod`)

## Environment Variables

- `AWS_PROFILE` - AWS profile to use (default: `personal`)
- `AWS_REGION` - AWS region (default: `us-east-1`)
- `BEDROCK_MODEL_ID` - Override default Claude model ID
- `BEDROCK_MAX_TOKENS` - Maximum response tokens
- `BEDROCK_TEMPERATURE` - Model temperature (0-1)

## Workflow Examples

### Complete MVP Creation
```bash
# 1. Define your MVP interactively
overnight-mvp mvp -o my-app-spec.yaml

# 2. Generate frontend with design session
overnight-mvp frontend my-app-spec.yaml -o frontend-prompt.txt

# 3. Generate backend implementation
overnight-mvp backend my-app-spec.yaml -o backend-prompt.txt

# 4. Deploy to AWS
overnight-mvp s3-site -r https://github.com/you/my-app
```

### Quick Frontend-Only Project
```bash
# 1. Define MVP
overnight-mvp mvp

# 2. Generate Lovable.dev prompt
overnight-mvp lovable bigspec.yaml --copy

# 3. Deploy static site
overnight-mvp s3-site -r https://github.com/you/frontend
```

### Automated Workflow
```bash
# Run everything automatically
overnight-mvp run my-app-spec.yaml
```

## Model Selection

The CLI uses AWS Bedrock with Claude 3.5 Sonnet by default. You can override the model:

```bash
overnight-mvp mvp --model anthropic.claude-3-opus-latest-v1:0
```

Available models:
- `anthropic.claude-3-5-sonnet-20241022-v2:0` (default)
- `anthropic.claude-3-opus-latest-v1:0`
- `anthropic.claude-3-sonnet-20240229-v1:0`