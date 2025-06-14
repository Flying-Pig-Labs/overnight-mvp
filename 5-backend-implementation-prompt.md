# Prompt: Generate Backend Implementation Prompt from Backend Spec

You are given a `backend-spec.json` that defines the full shape of required backend services and routes.

Write a clear, production-ready AI prompt to implement this backend stack using AWS-native services. Assume AWS CDK with TypeScript and follow best practices.

## Tasks

* For each service and route, generate:
  * CDK infrastructure (API Gateway route + Lambda)
  * Lambda handler code stub
  * Input validation (zod or native)
  * CORS and API config
  * IAM permissions if needed (e.g. write to DynamoDB)

## Output

Return a single AI prompt that says:

> Build an AWS backend using CDK (TypeScript). It will deploy an API Gateway + Lambda-based REST API. Implement the following:
>
> **ContactService**:
>
> * `POST /contact` accepts JSON `{ name, email, message }` and returns a thank-you response.
>
> Create:
>
> * CDK stack with API Gateway + Lambda
> * Lambda code to parse input and log it
> * CORS enabled for all origins
> * IAM role with basic execution permissions

Repeat the above for each route in the backend spec. 