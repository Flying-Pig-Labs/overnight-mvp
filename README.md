# MVP Deployment System Spec

## Overview

This system allows users to submit a natural language description of their MVP, which is then automatically transformed into a fully functional frontend and backend—each deployed, integrated, and versioned via GitHub.

---

## 🧾 Step-by-Step Flow

### 1. User Submission
- The user submits an MVP idea in plain English.

### 2. Frontend Prompt Generation
- An internal LLM converts this description into a structured **Lovable.dev prompt** using a standardized template.
  - this is a DSL we call [`FrontSpec`](frontspec/README.md)
- This prompt must be one-shot and deterministic to:
  - ensure predictable output from Lovable
  - keep Lovable costs down

### 3. Frontend Creation (Lovable)
- This prompt is manually issued via Lovable.dev (1 min)
- Lovable generates acceptable frontend (React/Next.js) (5 min) and we manually export it to GitHub (1 min).

### 4. App Structure Extraction
- The exported app is cloned (this is where it gets interesting).
- **Codex/Cursor** processes the codebase:
  - Removes Lovable/Supabase-specific code
  - Refactors into a clean structure
  - Extracts a normalized **AppSpec** or DSL
    - Pages
    - Components
    - State model
    - API expectations (method, path, schema)

### 5. Backend Generation (Encore.dev)
- AppSpec is passed into **Encore.dev**
- Encore generates and deploys a backend API
- Returns:
  - **OpenAPI spec**
  - **Live endpoint**

### 6. API Reintegration
- Codex/Cursor updates the frontend repo:
  - Replaces dummy API calls with real endpoint(s)
  - Syncs environment config
  - Validates API usage against OpenAPI spec

---

## 📦 Output Artifacts

### `frontend/` GitHub Repo (output from Lovable)
- Clean React/Next.js frontend
- Stubbed out API layer (circuit-breaking `api.foo.com"443` to `localhost:8000`)
    - designed for OpenAPI Spec
- Deployment-ready (Vercel, S3, etc.)

### `backend/` GitHub Repo
- Encore.dev Go backend (or whatever is easily auto-generated for AWS deployment)
- OpenAPI spec
- AWS deployable

### `deployments/` GitHub Repo
- instruction sets:
  - for combining both repositories
  - for deploying combined app to AWS
