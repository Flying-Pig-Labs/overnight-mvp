# Prompt: Generate Backend Implementation with AWS Q Developer CLI

You are given a `backend-spec.json` that defines the full shape of required backend services and routes.

Your job is to convert this structured specification into a natural language prompt that can be used with AWS Q Developer CLI to automatically generate and deploy the complete backend infrastructure.

## Tasks

* Convert the backend-spec.json into a clear, natural language description
* Include all required endpoints, methods, and data structures
* Specify the desired technology stack (CDK + TypeScript, Lambda + Python)
* Add requirements for security, validation, and best practices
* Format the prompt for optimal Q CLI understanding

## Output

Generate a Q CLI prompt like:

```
I want to build a serverless application with an API Gateway that has the following endpoints:

1. POST /contact
   - Accepts JSON payload: {name: string, email: string, message: string}
   - Returns: {success: boolean, message: string}
   - Purpose: Submit contact form

2. GET /user
   - Accepts: No payload
   - Returns: {id: string, name: string, email: string}
   - Purpose: Get current user profile

3. POST /auth/login
   - Accepts: {email: string, password: string}
   - Returns: {token: string, user: object}
   - Purpose: User authentication

I want to build the AWS infrastructure using CDK in TypeScript and Lambda functions in Python.
Include proper CORS configuration for frontend integration, input validation, error handling, and security best practices.
Generate comprehensive documentation and OpenAPI specification.
```

## Q CLI Integration Benefits

* **Automated Generation**: Q CLI creates all CDK infrastructure code
* **Best Practices**: Built-in security, validation, and error handling
* **Rapid Deployment**: Complete backend deployed in minutes
* **Consistent Architecture**: Follows AWS recommended patterns
* **Documentation**: Auto-generated OpenAPI specs and deployment guides

## Usage Instructions

1. Generate the Q CLI prompt from backend-spec.json
2. Run `q chat` in terminal
3. Paste the generated prompt
4. Follow Q CLI's interactive deployment process
5. Extract generated OpenAPI spec and endpoint URLs
6. Update frontend with real API endpoints 