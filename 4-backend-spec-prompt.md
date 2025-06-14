# Prompt: Generate Backend Spec from FrontSpec

You are given a `frontspec.yaml` file that describes the pages, components, interactions, and data bindings of a frontend React application.

Your job is to extract and infer all backend capabilities this frontend needs. For each interaction, form, or data-bound element:

## Tasks

* Identify and list all required backend routes (e.g. `POST /contact`, `GET /user`)
* Define each route's:
  * Purpose
  * Expected request payload
  * Expected response
  * HTTP method
* Group routes into logical services or domains if applicable
* Suggest names for Lambda functions or service modules

## Output

Generate a `backend-spec.json` like:

```json
{
  "services": [
    {
      "name": "ContactService",
      "routes": [
        {
          "method": "POST",
          "path": "/contact",
          "description": "Submit contact form",
          "request": {"name": "string", "email": "string", "message": "string"},
          "response": {"success": true, "message": "Thank you for contacting us!"}
        }
      ]
    }
  ]
}
``` 