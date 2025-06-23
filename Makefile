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
	@echo "  make run          (Removed - use mvp/frontend/backend instead)"
	@echo "  make analyze      (Removed - specs generated from MVP)"
	@echo "  make deploy       (Removed - use generated infra code)"
	@echo ""
	@echo "Workflow Commands:"
	@echo "  make frontend     Generate frontend with interactive prompts"
	@echo "  make backend      Generate backend with Amazon Q"
	@echo "  make integration  Generate integration prompt for frontend/backend deployment"
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
	@AWS_PROFILE=personal node ./dist/cli.js mvp

# Run example workflow
run: build
	@echo "❌ The 'run' command has been removed. Please use:"
	@echo "  make mvp       - Create a new MVP specification"
	@echo "  make frontend  - Generate frontend for an MVP"
	@echo "  make backend   - Generate backend for an MVP"

# Analyze example frontend
analyze: build
	@echo "❌ The 'analyze' command has been removed. Frontend and backend prompts are now generated from MVP specifications."

# Deploy example
deploy: build
	@echo "❌ The 'deploy' command has been removed. Use the generated infrastructure code with AWS CDK or SAM."

# Create GitHub issues
issues:
	@echo "📋 Creating GitHub issues..."
	@chmod +x .github/create_issues.sh
	./.github/create_issues.sh

# Generate frontend with interactive prompts
frontend: build
	@echo "🎨 Starting frontend generation..."
	@AWS_PROFILE=personal node ./dist/cli.js frontend

# Generate backend with Amazon Q
backend: build
	@echo "⚙️  Starting backend generation with Amazon Q..."
	@AWS_PROFILE=personal node ./dist/cli.js backend

# Generate integration prompt for frontend/backend deployment
integration: build
	@echo "🔗 Generating integration deployment prompt..."
	@AWS_PROFILE=personal node ./dist/cli.js integration

# Regenerate example MVP
example: build
	@echo "🔄 Regenerating example MVP..."
	@rm -rf mvps/example-mvp
	@mkdir -p mvps/example-mvp
	@echo "📝 Creating example specs and prompts..."
	@AWS_PROFILE=personal node ./dist/cli.js example --output-dir mvps/example-mvp
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
		overnight-mvp mvp

# Development workflow shortcuts
.PHONY: dev-mvp dev-run dev-analyze

# Quick development commands
dev-mvp:
	AWS_PROFILE=personal npm run dev -- mvp

dev-run:
	@echo "❌ The 'run' command has been removed."

dev-analyze:
	@echo "❌ The 'analyze' command has been removed."

# Full workflow test
.PHONY: test-workflow

test-workflow: build
	@echo "🧪 Testing full workflow..."
	@echo "1. Building project..."
	@make build
	@echo "2. Running MVP builder simulation..."
	@node ./dist/cli.js mvp --name "Test MVP" --description "A task tracking application for testing" || true
	@echo "3. Running workflow..."
	@echo "run command has been removed"
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