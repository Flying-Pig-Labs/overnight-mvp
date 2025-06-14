# MVP Deployment System Spec

## Overview

This system allows users to submit a natural language description of their MVP, which is then automatically transformed into a fully functional frontend and backend—each deployed, integrated, and versioned via GitHub.

---

## 🧾 Step-by-Step Flow

### 1. User Submission
- The user submits an MVP idea in plain English.

### 2. Domain Purchase
- Purchase the domain and get details

### 3. FrontSpec Prompt Generation
- An internal LLM converts this description + domain details into a structured **Lovable.dev prompt** using a standardized template.
  - This is a DSL we call [`FrontSpec`](frontspec/README.md)
- This prompt must be one-shot and deterministic to:
  - ensure predictable output from Lovable
  - keep Lovable costs down

### 4. Frontend Creation (Lovable)
- This prompt is manually issued via Lovable.dev (1 min)
- Lovable generates acceptable frontend (React/Next.js) (x min)
- Code is exported to GitHub (1 min)
  - At this point, it's not expected to be deployable yet (no backend)

### 5. Frontend Infrastructure Setup (AWS CDK)
- Deploy AWS infrastructure for static site hosting:
  - **FrontendStack**: S3 bucket + CloudFront distribution with OAC/OAI
  - **CertStack**: ACM certificate in us-east-1 for HTTPS
  - **DnsStack**: Route 53 A/AAAA records pointing to CloudFront
- Configure GitHub Actions workflow for automated deployment
- Support SPA fallback to `index.html`
- Accept parameters like `domainName`, `apiUrl`, and `environment`

### 6. Frontend Analysis & FrontSpec Population
- Analyze the generated frontend codebase in `frontend/` directory
- Extract route paths, components, props, and layout usage
- Identify API calls, user interactions, and environment variables
- Generate a complete `frontspec.yaml` file compatible with the FrontSpec DSL
- Capture style tokens, data bindings, and component relationships

### 7. Backend Specification Generation
- Extract backend requirements from the populated FrontSpec
- Identify all required API routes (e.g., `POST /contact`, `GET /user`)
- Define request/response payloads, HTTP methods, and route purposes
- Group routes into logical services or domains
- Generate a `backend-spec.json` with complete API specification

### 8. Backend Implementation (AWS CDK + Lambda)
- Implement backend using AWS-native services:
  - **API Gateway + Lambda** for REST API endpoints
  - **Input validation** using zod or native validation
  - **CORS configuration** for frontend integration
  - **IAM permissions** for required AWS services
- Deploy using CDK with TypeScript
- Generate OpenAPI spec and live endpoint URLs

### 9. Frontend API Integration
- Update frontend to use real backend endpoints
- Inject `VITE_API_URL` environment variable for API communication
- Replace placeholder fetch calls with actual API calls
- Align request/response payloads with backend specification
- Remove unused mocks and stub services

### 10. Full Stack Deployment & Testing
- Deploy both frontend and backend to AWS
- Configure DNS and SSL certificates
- Run smoke tests to verify frontend/backend integration
- Validate API endpoints using OpenAPI-based tests
- Generate deployment reports and live URLs

---

## 📁 Project Structure

```
├── frontend/                    # Lovable.dev generated frontend
├── lib/                        # CDK stack definitions
│   ├── FrontendStack.ts        # S3 + CloudFront infrastructure
│   ├── CertStack.ts           # ACM certificate management
│   └── DnsStack.ts            # Route 53 DNS configuration
├── bin/
│   └── app.ts                 # CDK app entry point
├── .github/workflows/
│   └── deploy.yml             # GitHub Actions deployment
├── frontspec/
│   └── README.md              # FrontSpec DSL documentation
├── 1-aws-static-site-prompt.md
├── 2-frontspec-template.yaml
├── 3-populate-frontspec-prompt.md
├── 4-backend-spec-prompt.md
└── 5-backend-implementation-prompt.md
```

---

## 🚀 Deliverables

- **Frontend Repository**: GitHub repo with AWS-deployed React app
- **Backend Repository**: GitHub repo with API Gateway + Lambda API
- **Configuration Repository**: Contains:
  - FrontSpec and BackendSpec files
  - LLM prompts and responses
  - Deployment logs and infrastructure code
  - OpenAPI schema and DNS records
  - Live URLs and test reports

---

## 🔧 Technology Stack

- **Frontend**: React/Next.js (Lovable.dev generated)
- **Backend**: AWS API Gateway + Lambda (TypeScript)
- **Infrastructure**: AWS CDK (TypeScript)
- **Deployment**: GitHub Actions + AWS S3/CloudFront
- **DNS**: Route 53 + ACM certificates
- **Specification**: FrontSpec DSL (YAML) + BackendSpec (JSON)

---

## 🔮 Future Enhancements

- Agent workflow orchestration (Strands SDK, Bedrock, n8n)
- Contact center auto-deployment via Amazon Connect
- Auth integration (Cognito, Clerk, or Auth0)
- Custom CLI to manage this entire workflow end-to-end
- Preview environments for staging deployments
- Multi-environment support (dev/staging/prod)
