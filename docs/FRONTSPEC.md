# 🎨 FrontSpec Reference

> A YAML DSL for capturing complete frontend specifications

## Overview

FrontSpec ensures nothing is missed when generating frontends:
- Pages & routing
- Components & props  
- Styling & themes
- Data bindings
- Interactions
- i18n support

## Example

```yaml
app:
  name: TaskTracker
  description: Team task management
  framework: react

pages:
  - name: Dashboard
    path: "/"
    components:
      - TaskList
      - AddTaskButton

components:
  - name: TaskList
    props:
      tasks: array
    dataBind: TaskAPI.getTasks

  - name: AddTaskButton
    props:
      onClick: showModal
    
dataSources:
  - name: TaskAPI
    type: REST
    endpoints:
      - GET /api/tasks
      - POST /api/tasks

styleTokens:
  primaryColor: "#3B82F6"
  fontFamily: "Inter"
```

## Usage

1. Generated automatically by `make chat`
2. Enhanced by `make lovable` 
3. Used by Lovable.dev for frontend generation

See [example-mvp-spec.yaml](../templates/example-mvp-spec.yaml) for complete reference.