# MVP Deployment System Spec

## Overview

This system allows users to submit a natural language description of their MVP, which is then automatically transformed into a fully functional frontend and backend—each deployed, integrated, and versioned via GitHub.

---

## 🧾 Step-by-Step Flow

### 1. User Submission
- The user submits an MVP idea in plain English.

### 2. Frontend Prompt Generation
- An internal LLM converts this description into a structured **Lovable.dev prompt** using a standardized template.
- This prompt is one-shot and deterministic to ensure predictable output from Lovable.

### 3. Frontend Creation (Lovable)
- The prompt is sent to Lovable.dev.
- Lovable generates a frontend (React/Next.js) and exports it to GitHub.

### 4. App Structure Extraction
- The exported app is cloned.
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

### `frontend/` GitHub Repo
- Clean React/Next.js frontend
- Integrated API layer
- Deployment-ready (Vercel, S3, etc.)

### `backend/` GitHub Repo
- Encore.dev Go backend
- OpenAPI spec
- AWS deployable
