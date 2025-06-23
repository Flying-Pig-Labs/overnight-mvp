# 📝 Prompt Templates

## Overview

The system uses these prompt templates to guide AI generation at each step.

## 1. AWS Static Site (`1-aws-static-site-prompt.md`)

**Purpose:** Generate CDK infrastructure for S3/CloudFront deployment

**Key Elements:**
- S3 bucket with OAC
- CloudFront distribution
- SPA routing support
- GitHub Actions workflow
- Environment variables

## 2. Frontend Analysis (`3-populate-frontspec-prompt.md`)

**Purpose:** Extract API requirements from frontend code

**Analyzes:**
- Route paths and pages
- API calls (fetch, axios)
- User events
- Environment variables
- Data bindings

## 3. Backend Specification (`4-backend-spec-prompt.md`)

**Purpose:** Generate backend spec from frontend analysis

**Generates:**
- API routes and methods
- Request/response schemas
- Service groupings
- Lambda function names
- Data models

## 4. Backend Implementation (`5-backend-implementation-prompt.md`)

**Purpose:** Guide AWS Q Developer for backend generation

**Includes:**
- Service architecture
- API Gateway setup
- Lambda functions
- DynamoDB tables
- Authentication flow

## Usage

These prompts are automatically loaded by the CLI:
- `make chat` → Uses custom prompts
- `make lovable` → Generates from templates
- `make s3-site` → Uses deployment template

The prompts use `{{variable}}` syntax for interpolation.