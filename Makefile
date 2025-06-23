# Overnight MVP Makefile
# Simplifies common development and deployment tasks

.PHONY: help install build dev clean test lint typecheck mvp run analyze deploy issues setup-aws docker-build docker-run frontend backend example

# Default target - show help
help:
	@echo "Overnight MVP - Available Commands:"
	@echo "================================================"
	@echo "  make install      Install dependencies"
	@echo "  make build        Build TypeScript to JavaScript"
	@echo "  make dev          Run CLI in development mode"
	@echo "  make clean        Clean build artifacts"
	@echo "  make test         Run test suite"
	@echo "  make lint         Run ESLint"
	@echo "  make typecheck    Run TypeScript type checking"
	@echo ""
	@echo "CLI Commands:"
	@echo "  make mvp          Start interactive MVP builder"
	@echo "  make example      Regenerate example MVP in mvps/example-mvp"
	@echo "  make run          Run example MVP workflow"
	@echo "  make analyze      Analyze example frontend"
	@echo "  make deploy       Deploy example project"
	@echo ""
	@echo "Workflow Commands:"
	@echo "  make frontend     Generate frontend with interactive prompts"
	@echo "  make backend      Generate backend with Amazon Q"
	@echo "  make s3-site REPO=github.com/.. Generate S3 deployment prompt"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup-aws    Configure AWS credentials"
	@echo "  make issues       Create GitHub issues from test plan"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build Build Docker image"
	@echo "  make docker-run   Run CLI in Docker"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

# Build TypeScript
build: clean
	@echo "🔨 Building TypeScript..."
	npm run build
	@echo "✅ Build complete"

# Run in development mode
dev:
	@echo "🚀 Starting development mode..."
	npm run dev

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/.cache/
	@echo "✅ Clean complete"

# Run tests
test:
	@echo "🧪 Running tests..."
	npm test

# Run linter
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

# Run type checking
typecheck:
	@echo "📝 Running TypeScript type check..."
	npm run typecheck

# Start interactive MVP builder
mvp: build
	@echo "💬 Starting interactive MVP builder..."
	@if [ "$$(ls -A mvps 2>/dev/null | grep -v example-mvp | wc -l)" -eq 0 ]; then \
		echo "📁 Creating your first MVP project..."; \
		read -p "Enter a short name for your MVP (lowercase, no spaces): " MVP_NAME; \
		mkdir -p "mvps/$$MVP_NAME"; \
		AWS_PROFILE=personal ./dist/cli.js chat --output "mvps/$$MVP_NAME/bigspec.yaml"; \
	else \
		echo "📁 Existing MVP projects:"; \
		ls -1 mvps | grep -v example-mvp; \
		read -p "Enter MVP name (or new name to create): " MVP_NAME; \
		mkdir -p "mvps/$$MVP_NAME"; \
		AWS_PROFILE=personal ./dist/cli.js chat --output "mvps/$$MVP_NAME/bigspec.yaml"; \
	fi

# Run example workflow
run: build
	@echo "🏃 Running example MVP workflow..."
	AWS_PROFILE=personal ./dist/cli.js run templates/example-mvp-spec.yaml --dry-run

# Analyze example frontend
analyze: build
	@echo "🔍 Analyzing frontend code..."
	@mkdir -p example-frontend
	@echo "// Example React component" > example-frontend/App.tsx
	@echo "fetch('/api/tasks').then(r => r.json())" >> example-frontend/App.tsx
	AWS_PROFILE=personal ./dist/cli.js analyze example-frontend -o example-api-spec.yaml
	@rm -rf example-frontend

# Deploy example
deploy: build
	@echo "🚀 Deploying example project..."
	AWS_PROFILE=personal ./dist/cli.js deploy . --dry-run

# Create GitHub issues
issues:
	@echo "📋 Creating GitHub issues..."
	@chmod +x .github/create_issues.sh
	./.github/create_issues.sh

# Generate frontend with interactive prompts
frontend: build
	@echo "🎨 Starting frontend generation..."
	@if [ -z "$(MVP)" ]; then \
		echo "📁 Available MVP projects:"; \
		ls -1 mvps 2>/dev/null || echo "No MVPs found"; \
		read -p "Enter MVP name: " MVP_NAME; \
	else \
		MVP_NAME="$(MVP)"; \
	fi; \
	if [ ! -f "mvps/$$MVP_NAME/bigspec.yaml" ]; then \
		echo "❌ MVP $$MVP_NAME not found. Run 'make mvp' first."; \
		exit 1; \
	fi; \
	echo "📝 Starting interactive frontend design for $$MVP_NAME..."; \
	AWS_PROFILE=personal ./dist/cli.js frontend "mvps/$$MVP_NAME/bigspec.yaml" --output "mvps/$$MVP_NAME/frontend-prompt.txt"

# Generate backend with Amazon Q
backend: build
	@echo "⚙️  Starting backend generation with Amazon Q..."
	@if [ -z "$(MVP)" ]; then \
		echo "📁 Available MVP projects:"; \
		ls -1 mvps 2>/dev/null || echo "No MVPs found"; \
		read -p "Enter MVP name: " MVP_NAME; \
	else \
		MVP_NAME="$(MVP)"; \
	fi; \
	if [ ! -f "mvps/$$MVP_NAME/bigspec.yaml" ]; then \
		echo "❌ MVP $$MVP_NAME not found. Run 'make mvp' first."; \
		exit 1; \
	fi; \
	echo "📝 Generating backend spec for Lambda+DynamoDB+API Gateway..."; \
	AWS_PROFILE=personal ./dist/cli.js backend "mvps/$$MVP_NAME/bigspec.yaml" --output "mvps/$$MVP_NAME/backend-prompt.txt"

# Generate S3/CloudFront deployment prompt from GitHub repo
s3-site:
	@echo "☁️  Generating S3/CloudFront deployment prompt..."
	@if [ -z "$(REPO)" ]; then \
		echo "❌ Please provide a GitHub repo URL: make s3-site REPO=https://github.com/user/repo"; \
		exit 1; \
	fi
	@echo "📝 Creating deployment prompt for $(REPO)..."
	@AWS_PROFILE=personal ./dist/cli.js s3-site --repo $(REPO)

# Regenerate example MVP
example: build
	@echo "🔄 Regenerating example MVP..."
	@rm -rf mvps/example-mvp
	@mkdir -p mvps/example-mvp
	@echo "📝 Creating example specs and prompts..."
	@AWS_PROFILE=personal ./dist/cli.js example --output-dir mvps/example-mvp
	@echo "✅ Example MVP regenerated in mvps/example-mvp/"

# Check AWS credentials
setup-aws:
	@echo "🔐 Checking AWS credentials..."
	@if aws sts get-caller-identity --profile personal > /dev/null 2>&1; then \
		echo "✅ AWS credentials found (using 'personal' profile)"; \
		aws sts get-caller-identity --profile personal --query "Account" --output text | xargs -I {} echo "Account: {}"; \
		aws configure get region --profile personal | xargs -I {} echo "Region: {}"; \
		echo ""; \
		echo "Checking Bedrock access..."; \
		if aws bedrock list-foundation-models --profile personal --query "modelSummaries[?contains(modelId, 'claude')].modelId" --output table 2>/dev/null | grep -q claude; then \
			echo "✅ Bedrock access confirmed"; \
		else \
			echo "⚠️  Unable to list Bedrock models - check IAM permissions"; \
		fi \
	else \
		echo "❌ AWS 'personal' profile not found"; \
		echo "Please configure AWS CLI with: aws configure --profile personal"; \
		exit 1; \
	fi

# Docker build
docker-build:
	@echo "🐳 Building Docker image..."
	@echo "FROM node:20-alpine" > Dockerfile
	@echo "WORKDIR /app" >> Dockerfile
	@echo "COPY package*.json ./" >> Dockerfile
	@echo "RUN npm ci --only=production" >> Dockerfile
	@echo "COPY . ." >> Dockerfile
	@echo "RUN npm run build" >> Dockerfile
	@echo "ENTRYPOINT [\"node\", \"dist/cli.js\"]" >> Dockerfile
	docker build -t overnight-mvp .
	@echo "✅ Docker image built"

# Docker run
docker-run:
	@echo "🐳 Running CLI in Docker..."
	docker run -it --rm \
		-v ~/.aws:/root/.aws:ro \
		-v $(PWD)/output:/app/output \
		-e AWS_PROFILE=personal \
		-e AWS_REGION=$${AWS_REGION:-us-east-1} \
		overnight-mvp chat

# Development workflow shortcuts
.PHONY: dev-mvp dev-run dev-analyze

# Quick development commands
dev-mvp:
	AWS_PROFILE=personal npm run dev -- chat

dev-run:
	AWS_PROFILE=personal npm run dev -- run templates/example-mvp-spec.yaml

dev-analyze:
	AWS_PROFILE=personal npm run dev -- analyze ./frontend

# Full workflow test
.PHONY: test-workflow

test-workflow: build
	@echo "🧪 Testing full workflow..."
	@echo "1. Building project..."
	@make build
	@echo "2. Running MVP builder simulation..."
	@echo "Test MVP for task tracking" | ./dist/cli.js chat -o test-mvp.yaml || true
	@echo "3. Running workflow..."
	@./dist/cli.js run test-mvp.yaml --dry-run || true
	@echo "✅ Workflow test complete"

# Git helpers
.PHONY: commit push

commit:
	@echo "📝 Committing changes..."
	git add -A
	git commit -m "🚀 Update Overnight MVP implementation"

push: commit
	@echo "⬆️ Pushing to GitHub..."
	git push origin main

# Installation helpers
.PHONY: install-global link unlink

install-global: build
	@echo "🌍 Installing globally..."
	npm link
	@echo "✅ Overnight MVP installed globally"
	@echo "Run 'overnight-mvp' from anywhere"

link: install-global

unlink:
	@echo "🔗 Unlinking global installation..."
	npm unlink
	@echo "✅ Global installation removed"

# Quality checks before commit
.PHONY: pre-commit

pre-commit: lint typecheck test
	@echo "✅ All quality checks passed!"

# Show current configuration
.PHONY: config

config:
	@echo "Current Configuration:"
	@echo "====================="
	@echo "Node Version: $$(node -v)"
	@echo "NPM Version: $$(npm -v)"
	@echo "AWS Region: $${AWS_REGION:-not set}"
	@echo "AWS Profile: $${AWS_PROFILE:-default}"
	@if [ -f .env.local ]; then \
		echo "Local env file: exists"; \
	else \
		echo "Local env file: not found"; \
	fi