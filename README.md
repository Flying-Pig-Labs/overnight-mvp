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
make frontend                                # Generate frontend implementation
make backend                                 # Generate backend implementation
make integration                             # Connect frontend to backend & deploy
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
make frontend
# Or: overnight-mvp frontend mvpspec.yml -o frontend-prompt.txt
```
Interactive design session + implementation prompt → `frontend-prompt.txt`

### 3️⃣ Generate Backend
```bash
make backend
# Or: overnight-mvp backend mvpspec.yml -o backend-prompt.txt
```
AWS Lambda + DynamoDB implementation → `backend-prompt.txt`

### 4️⃣ Integrate & Deploy
```bash
make integration
# Or: overnight-mvp integration
```
Connects frontend to backend and generates deployment instructions → `integration-prompt.txt`

**Note:** The backend networking details are read from `networking-spec.yaml` which should be populated after backend deployment.

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
| `make frontend` | Generate frontend implementation |
| `make backend` | Generate backend implementation |
| `make integration` | Generate integration & deployment prompt |
| `make example` | Create example MVP with all specs |
| `make help` | Show all commands |

### CLI Commands
| Command | Purpose |
|---------|---------|
| `overnight-mvp mvp` | Interactive MVP specification builder |
| `overnight-mvp frontend <spec>` | Generate frontend with design session |
| `overnight-mvp backend` | Generate AWS Lambda backend |
| `overnight-mvp integration` | Generate integration deployment prompt |
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
make frontend
# → Interactive design session, then copy prompt to Claude Code

# 3. Generate backend
make backend
# → Copy prompt to Claude Code for AWS Lambda implementation

# 4. Integrate & Deploy
make integration
# → Connect frontend to backend and deploy with Claude Code

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