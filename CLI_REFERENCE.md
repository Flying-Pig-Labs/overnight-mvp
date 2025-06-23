# 🔧 CLI Reference

## Commands

### `chat` - Interactive MVP Builder
```bash
overnight-mvp chat [options]
```
Start an interactive session to define your MVP.

**Options:**
- `-o, --output <file>` - Output file (default: `mvp-spec.yaml`)
- `--model <model>` - Bedrock model to use

### `lovable` - Generate Frontend Prompt
```bash
overnight-mvp lovable <spec> [options]
```
Convert MVP spec to Lovable.dev prompt.

**Options:**
- `-o, --output <file>` - Output file (default: `lovable-prompt.txt`)

### `s3-site` - Generate Deployment
```bash
overnight-mvp s3-site [options]
```
Generate AWS S3/CloudFront deployment instructions.

**Options:**
- `-r, --repo <url>` - GitHub repository URL (required)
- `-o, --output <file>` - Output file (default: `s3-deployment-prompt.txt`)

### `run` - Full Workflow
```bash
overnight-mvp run <spec> [options]
```
Execute the complete MVP workflow.

**Options:**
- `--dry-run` - Preview without executing
- `--skip-frontend` - Skip frontend generation
- `--skip-backend` - Skip backend generation

### `analyze` - Analyze Frontend
```bash
overnight-mvp analyze <path> [options]
```
Extract API requirements from frontend code.

**Options:**
- `-o, --output <file>` - Output file (default: `api-spec.yaml`)

### `deploy` - Deploy to AWS
```bash
overnight-mvp deploy <path> [options]
```
Deploy project to AWS.

**Options:**
- `--stage <stage>` - Deployment stage (default: `prod`)
- `--frontend-only` - Deploy only frontend
- `--backend-only` - Deploy only backend

## Environment Variables

- `AWS_PROFILE` - AWS profile (default: `personal`)
- `AWS_REGION` - AWS region (default: `us-east-1`)
- `BEDROCK_MODEL_ID` - Claude model ID
- `BEDROCK_MAX_TOKENS` - Max response tokens
- `BEDROCK_TEMPERATURE` - Model temperature