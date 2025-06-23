# 🚀 Overnight MVP

> Transform your idea into a deployed application in under an hour using AI.

## ✨ What is this?

A powerful CLI that orchestrates AI tools to build and deploy full-stack applications:

1. **💬 Describe** your idea in plain English
2. **🎨 Generate** frontend and backend implementations
3. **☁️ Deploy** to AWS with automated infrastructure

## 🎯 Quick Start

```bash
# Install
npm install
make build

# Create your MVP
make mvp                                     # Describe your idea interactively
make frontend SPEC=bigspec.yaml              # Generate frontend implementation
make backend SPEC=bigspec.yaml               # Generate backend implementation
make s3-site REPO=github.com/you/your-app   # Deploy to AWS
```

## 📋 Complete Workflow

### 1️⃣ Define Your MVP
```bash
make mvp
# Or: overnight-mvp mvp -o mvp-spec.yaml
```
Interactive session to capture your requirements → `mvpspec.yml`

**⚠️ Important:** After generation, review and edit the `mvpspec.yml` file to ensure:
- All features are correctly captured
- Data models match your needs  
- API endpoints are properly defined
- Technical requirements are accurate

### 2️⃣ Generate Frontend
```bash
make frontend SPEC=mvpspec.yml
# Or: overnight-mvp frontend mvpspec.yml -o frontend-prompt.txt
```
Interactive design session + implementation prompt → `frontend-prompt.txt`

### 3️⃣ Generate Backend
```bash
make backend SPEC=mvpspec.yml
# Or: overnight-mvp backend mvpspec.yml -o backend-prompt.txt
```
AWS Lambda + DynamoDB implementation → `backend-prompt.txt`

### 4️⃣ Deploy to AWS
```bash
make s3-site REPO=https://github.com/you/frontend
# Or: overnight-mvp s3-site -r https://github.com/you/frontend
```
Complete AWS infrastructure deployment → `s3-deployment-prompt.txt`

## 🛠️ Setup

### Prerequisites
- Node.js 20+
- AWS CLI configured with `personal` profile
- GitHub account

### AWS Configuration
```bash
make setup-aws  # Verify AWS access
```

## 📚 Commands

| Command | Purpose |
|---------|---------|
| `make mvp` | Start interactive MVP builder |
| `make frontend SPEC=file` | Generate frontend implementation |
| `make backend SPEC=file` | Generate backend implementation |
| `make s3-site REPO=url` | Generate AWS deployment |
| `make example` | Create example MVP with all specs |
| `make help` | Show all commands |

### CLI Commands
| Command | Purpose |
|---------|---------|
| `overnight-mvp mvp` | Interactive MVP specification builder |
| `overnight-mvp frontend <spec>` | Generate frontend with design session |
| `overnight-mvp backend <spec>` | Generate AWS Lambda backend |
| `overnight-mvp lovable <spec>` | Generate Lovable.dev prompt |
| `overnight-mvp s3-site` | Generate S3/CloudFront deployment |
| `overnight-mvp run <spec>` | Run complete workflow |
| `overnight-mvp analyze <path>` | Extract API requirements |
| `overnight-mvp deploy <path>` | Deploy to AWS |
| `overnight-mvp example` | Generate example project |

## 🏗️ Architecture

```
Idea → MVP → Spec → Frontend/Backend → GitHub → AWS → Live App
        ↓      ↓         ↓               ↓        ↓
      AI    YAML    Implementations   Code   Infrastructure
```

## 💡 Example

Building a task tracker:

```bash
# 1. Describe your idea
make mvp
> "I need a task tracker for teams with projects and deadlines"

# Review and edit the generated mvpspec.yml file

# 2. Generate frontend
make frontend SPEC=mvpspec.yml
# → Interactive design session, then copy prompt to Claude Code

# 3. Generate backend
make backend SPEC=mvpspec.yml
# → Copy prompt to Claude Code for AWS Lambda implementation

# 4. Deploy
make s3-site REPO=https://github.com/you/task-tracker
# → Deploy infrastructure with Claude Code

# Result: Live full-stack app at https://your-app.cloudfront.net
```

## 🚀 Advanced Usage

```bash
# Generate complete example project
make example

# Run full workflow automatically
overnight-mvp run mvpspec.yml

# Analyze existing frontend for API needs
overnight-mvp analyze ./frontend -o api-spec.yaml

# Deploy with specific stage
overnight-mvp deploy ./project --stage prod
```

## 🤝 Contributing

Issues and PRs welcome! See [SIMPLIFIED_ISSUES.md](SIMPLIFIED_ISSUES.md) for roadmap.

## 📄 License

MIT