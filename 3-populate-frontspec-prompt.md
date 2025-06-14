# Prompt: Populate FrontSpec from GitHub Frontend Output

You are given a frontend codebase stored in a GitHub repo, in the `frontend/` directory. It was deployed to AWS in a previous step using CDK.

Analyze the contents of the frontend source code and extract the following structure into a FrontSpec YAML format:

## Tasks

* Identify:
  * All route paths and pages
  * All UI components, their props, and layout usage
  * Any API calls made by components (via `fetch`, `axios`, etc.)
  * Any user-triggered events (form submissions, button clicks)
  * Any environment variable usage (`VITE_*`)
* Infer likely data bindings or data sources based on usage
* Capture style tokens (color, font, spacing) from CSS/JSX where possible

## Output

Return a `frontspec.yaml` file compatible with the FrontSpec DSL defined in Prompt 2.
Use best guesses and naming based on component usage and code structure. 