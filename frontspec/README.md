# FrontSpec

This is a front-end template that is used to aid an LLM in capturing the full essence and shape of a front-end application, from design to technical.

It's a DSL in YAML format.

For OvernightMVP, it's used as an input to pass to custom RAG-based FrontSpec prompting engines.

* Currently, only [Lovable.dev](https://lovable.dev/blog/2025-01-16-lovable-prompting-handbook) is the only supported integration.
* Versions of this engine exist already in [ChatGPT](https://chatgpt.com/g/g-67e1da2c9c988191b52b61084438e8ee-lovable-base-prompt) and Claude.

---

## ✅ Categories Captured in the DSL

This spec ensures no critical design or engineering elements are missed when prompting an LLM to generate a full frontend. It is intended to support one-shot codegen by including all necessary:

* Page and routing definitions
* Component definitions and props
* Layout and theming
* Data sources and bindings
* UI behaviors and interactions
* i18n/localization support
* Test case definitions

---

## 🧩 Example YAML

```yaml
app:
  name: MyCoolApp
  description: A lightweight React app for navigating between pages and showing user data.
  framework: react
  routing: react-router-dom

styleTokens:
  primaryColor: "#0066FF"
  spacing: "8px"
  fontFamily: "Inter"

pages:
  - name: HomePage
    path: "/"
    layout: grid
    components:
      - Header
      - Button

  - name: SettingsPage
    path: "/settings"
    components: []

components:
  - name: Button
    props:
      label: string
      onClick: navigate:/settings
    variants:
      - primary
      - secondary

dataSources:
  - name: UserAPI
    type: REST
    endpoint: GET /me

dataBindings:
  - component: HomePage
    bindsProp: user
    to: UserAPI.getCurrentUser

interactions:
  - trigger: Button.onClick
    action: navigate:/settings

i18n:
  defaultLocale: en
  translations:
    en:
      Button.label: Submit
    es:
      Button.label: Enviar

tests:
  - scenario: Clicking settings button navigates
    steps:
      - Click Button[label='Go to Settings']
      - Expect URL to be /settings
```

---

## 🪄 Generated Prompt (Example)

> Build a React app called **MyCoolApp**. It has two routes: `/` (HomePage) and `/settings` (SettingsPage). The HomePage uses a grid layout with a `Header` and a `Button`. The Button is labeled "Go to Settings" and when clicked, it navigates to `/settings`.
>
> The Button component accepts `label` and `onClick` props and supports `primary` and `secondary` variants.
>
> The theme uses `#0066FF` as primary color, `Inter` font, and 8px spacing.
>
> Fetch user data from a REST endpoint `GET /me`, bind it to the `user` prop of HomePage.
>
> Include i18n support with translations for English and Spanish (`Button.label: Submit / Enviar`).
>
> Add a test case: Click the "Go to Settings" button and assert the URL is `/settings`.

---

You can generate this prompt manually or use a tool to convert `frontend-spec.json` into a fully formed Lovable prompt automatically.
