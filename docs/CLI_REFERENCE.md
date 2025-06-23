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
overnight-mvp frontend [options]
```
Generate frontend implementation with interactive design session.

**Options:**
- `-o, --output <file>` - Output file for the prompt
- `--model <model>` - Bedrock model to use
- `--shortname <shortname>` - MVP shortname to skip selection

### `backend` - Generate Backend Implementation
```bash
overnight-mvp backend [options]
```
Generate AWS Lambda + DynamoDB backend implementation.

**Options:**
- `-o, --output <file>` - Output file for the prompt
- `--model <model>` - Bedrock model to use
- `--shortname <shortname>` - MVP shortname to skip selection

### `integration` - Generate Integration & Deployment Prompt
```bash
overnight-mvp integration [options]
```
Generate integration prompt to connect frontend to backend and deploy to AWS.

**Options:**
- `-o, --output <file>` - Output file for the prompt
- `--shortname <shortname>` - MVP shortname to skip selection

**Note:** Reads backend networking details from `networking-spec.yaml` which should be populated after backend deployment.

### `example` - Generate Example MVP
```bash
overnight-mvp example [options]
```
Generate a complete example MVP with all specifications and prompts.

**Options:**
- `--output-dir <dir>` - Output directory (default: `mvps/example-mvp`)

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
overnight-mvp frontend -o frontend-prompt.txt

# 3. Generate backend implementation
overnight-mvp backend -o backend-prompt.txt

# 4. Connect frontend to backend and deploy
overnight-mvp integration -o integration-prompt.txt
```

### Quick Frontend-Only Project
```bash
# 1. Define MVP
overnight-mvp mvp

# 2. Generate frontend prompt
overnight-mvp frontend

# 3. Connect and deploy (after backend is ready)
overnight-mvp integration
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