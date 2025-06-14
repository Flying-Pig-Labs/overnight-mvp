# Prompt: Turn GitHub Frontend into AWS-Hosted Static Site

You are building a complete infrastructure and deployment pipeline for a static frontend website using AWS CDK (TypeScript) and GitHub Actions.

## Context

* The static site has already been generated and committed to GitHub under `frontend/`
* This repo only contains frontend assets
* The frontend communicates with a separately deployed backend API, which will be exposed via API Gateway
* All backend authentication and authorization is handled separately
* The frontend must be able to communicate with this API via an environment-provided base URL (e.g. `VITE_API_URL`)
* AWS credentials are available locally for deployment
* Infrastructure should support future extension (e.g. auth integration, preview environments)

## Tasks

### 1. Infrastructure (CDK in TypeScript)

* Create a `FrontendStack` that:
  * Sets up a private S3 bucket for static assets
  * Adds a CloudFront distribution with OAC or OAI to access S3
  * Supports SPA fallback to `index.html`
  * Accepts parameters like `domainName`, `apiUrl`, and `environment`
* Create a `CertStack` to issue and validate an ACM certificate in `us-east-1`
* Create a `DnsStack` to configure a Route 53 A/AAAA record pointing to CloudFront

### 2. GitHub Actions Workflow

* Triggered on push to `main`
* Uses Node.js + Vite to build the frontend from `frontend/`
* Uploads the `dist/` folder to S3 using `aws s3 sync`
* Invalidates CloudFront distribution to reflect changes
* Injects the `VITE_API_URL` environment variable into the build step
* Optionally supports matrix deploys for `staging` and `prod` environments

### 3. Project Layout

* `cdk.json`, `bin/app.ts`, `lib/FrontendStack.ts`, `lib/CertStack.ts`, `lib/DnsStack.ts`
* `.github/workflows/deploy.yml`
* `frontend/` containing Lovable.dev output (or other Vite-compatible static site)
* `.env.production` for local overrides
* Output CloudFront URL or domain name after deploy

### 4. Modularity & Extensibility

* No backend logic lives in this repo
* Clean separation between infrastructure and build artifacts
* Reusable CDK constructs that can be parameterized or extended
* Designed to work with any API exposed via API Gateway, defined in a separate stack

## Output

* CDK files: `cdk.json`, `bin/app.ts`, `lib/FrontendStack.ts`, etc.
* GitHub Actions: `.github/workflows/deploy.yml`
* `.env.example` with `VITE_API_URL`
* `README.md` with setup instructions 