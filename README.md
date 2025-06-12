# MVP Deployment System Spec

## Overview

This system allows users to submit a natural language description of their MVP, which is then automatically transformed into a fully functional frontend and backend—each deployed, integrated, and versioned via GitHub.

---

## 🧾 Step-by-Step Flow

### 1. User Submission
- The user submits an MVP idea in plain English.

### 2. Domain purchase
- Purchase the domain and get details

### 2. FronSpec Prompt Generation
- An internal LLM converts this description + domain details into a structured **Lovable.dev prompt** using a standardized template.
  - this is a DSL we call [`FrontSpec`](frontspec/README.md)
- This prompt must be one-shot and deterministic to:
  - ensure predictable output from Lovable
  - keep Lovable costs down

### 3. Frontend Creation (Lovable)
- This prompt is manually issued via Lovable.dev (1 min)
- Lovable generates acceptable frontend (React/Next.js) (x min)
- Code is exported it to GitHub (1 min)
  - at this point, it's not expected to be deployable yet (no backend)

### 4. Backend Generation (Encore.dev)
- AppSpec is passed into **Encore.dev**
- Encore generates and deploys a backend API
  - this could be very complicated in theory (complex Agent workflows <-> simple Lambda invocations)
  - to start, we need to just do simple DB tables + whatever you can run in Lambda
- Returns:
  - **OpenAPI spec**
  - **Live endpoint**

### 5. Frontend API Reintegration
- Codex updates the frontend repo:
  - Replace all placeholder fetch calls with real endpoints defined in the OpenAPI spec
  - Inject `NEXT_PUBLIC_API_URL` and other runtime config via `.env`
  - Align request/response payloads with API schema
  - (Optional) Generate a typed API client from the spec for type safety and DX
  - Remove unused mocks, stub services, and redundant fetch logic

### 6. Stack Deployment (AWS)
- The backend and frontend are deployed to AWS using preconfigured IaC templates:
  - **Backend**: Encore-deployed Go API with AWS Gateway + Lambda (or Fargate)
  - **Frontend**: React app deployed via S3 + CloudFront or Vercel (if applicable)
  - **Domain**: Route 53 Hosted Zone + ACM + API Gateway + CloudFront DNS wiring
- IAM, secrets, and API Gateway config are standardized across projects
- Artifacts include CloudFormation outputs, live URLs, and deployment logs

---

### 7. Smoke Tests & Verification
- Validate deployed endpoints using OpenAPI-based tests or Postman collection
- Run basic UI smoke tests (e.g., Playwright, Cypress) to verify frontend/API integration
- (Optional) Generate a lightweight HTML test report linked in the `meta/` repo

---

### 8. Deliverables
- `foo-frontend/`: GitHub repo with cleaned, API-integrated frontend
- `foo-backend/`: GitHub repo with deployed Go API + infra
- `foo-config/`: GitHub repo with:
  - FrontSpec and AppSpec
  - LLM prompts and responses
  - Deployment logs
  - OpenAPI schema
  - DNS and domain records

---

### x. Next Features (Planned)
- Agent workflow orchestration (Strands SDK, Bedrock, n8n)
- Contact center auto-deployment via Amazon Connect
- Auth integration (Cognito, Clerk, or Auth0)
- Custom CLI to manage this entire workflow end-to-end
