# 🚀 Overnight MVP

> Transform your idea into a deployed application in under an hour using AI.

## ✨ What is this?

A streamlined CLI that orchestrates AI tools to build and deploy full-stack applications:

1. **💬 Describe** your idea in plain English
2. **🎨 Generate** a frontend with Lovable.dev
3. **☁️ Deploy** to AWS S3/CloudFront with one command

## 🎯 Quick Start

```bash
# Install
npm install
make build

# Create your MVP
make chat                                    # Describe your idea
make lovable SPEC=mvp-spec.yaml             # Generate frontend prompt
make s3-site REPO=github.com/you/your-app   # Generate deployment
```

## 📋 Complete Workflow

### 1️⃣ Define Your MVP
```bash
make chat
```
Interactive session to capture your requirements → `mvp-spec.yaml`

### 2️⃣ Generate Frontend
```bash
make lovable SPEC=mvp-spec.yaml
```
Creates optimized Lovable.dev prompt → `lovable-prompt.txt`

### 3️⃣ Deploy to AWS
```bash
make s3-site REPO=https://github.com/you/frontend
```
Generates complete AWS infrastructure → `s3-deployment-prompt.txt`

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
| `make chat` | Start interactive MVP builder |
| `make lovable SPEC=file` | Generate Lovable.dev prompt |
| `make s3-site REPO=url` | Generate AWS deployment |
| `make help` | Show all commands |

## 🏗️ Architecture

```
Idea → Chat → Spec → Lovable → GitHub → S3/CloudFront → Live App
         ↓      ↓        ↓         ↓          ↓
       AI    YAML    Frontend   Code    Infrastructure
```

## 💡 Example

Building a task tracker:

```bash
# 1. Describe your idea
make chat
> "I need a task tracker for teams with projects and deadlines"

# 2. Generate frontend
make lovable SPEC=mvp-spec.yaml
# → Copy prompt to lovable.dev

# 3. Deploy
make s3-site REPO=https://github.com/you/task-tracker
# → Paste prompt to Claude Code

# Result: Live app at https://your-app.cloudfront.net
```

## 🤝 Contributing

Issues and PRs welcome! See [SIMPLIFIED_ISSUES.md](SIMPLIFIED_ISSUES.md) for roadmap.

## 📄 License

MIT