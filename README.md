# EHR Design System

A React design system for an Electronic Health Record product suite, a small
website built only from it, and a mock API that feeds the website invented
patient data.

| Package | Path | What it is |
| --- | --- | --- |
| `ui` | `packages/ui` | The component library: Button, TextField, Card, Table, DescriptionList. React, TypeScript, CSS Modules, tokens as CSS custom properties. [How to use it](./packages/ui/README.md). |
| `app` | `packages/app` | A searchable patient list and a patient detail page. |
| `api` | `api/Intrahealth.Api` | ASP.NET Core minimal API, in-memory data, no auth. |

`app` imports `ui` and `ui/styles.css` by name, through the library's
`exports` map to its built `dist/`; deep imports into its source don't
resolve.

```
packages/ui     the component library
packages/app    the website
  src/api/        the API client and the one payload-to-display mapping
  src/pages/      the two pages
api/            the mock API, and its tests in api/Intrahealth.Api.Tests
docs/           design document, API contract, tasks, decisions, conventions
```

## Running it

Needs Node 20+ (npm 7+) and the .NET 10 SDK. From the repository root:

```bash
npm install                    # once
npm run api                    # terminal 1: the API on http://localhost:5080
npm run dev                    # terminal 2: builds ui, serves the site on http://localhost:5173
```

The site's dev server forwards `/api` to the API, so both must run. With the
API stopped, the site shows "Something went wrong"; that is intended.

| Package | Command | What it does |
| --- | --- | --- |
| `ui` | `npm run build --workspace ui` | Builds `dist/` (JS, CSS, type declarations). |
| `ui` | `npm run test --workspace ui` | Library tests. |
| `ui` | `npm run storybook` | Storybook on http://localhost:6006. |
| `ui` | `npm run build-storybook --workspace ui` | Static Storybook in `packages/ui/storybook-static/`. |
| `ui` | `npm run new-component --workspace ui -- Badge` | Scaffolds a component; see the library README's Contributing section. |
| `ui` | `npm run capture-states --workspace ui` | Re-captures the state screenshots. Needs `npx playwright install chromium` once. |
| `app` | `npm run dev --workspace app` | The site alone. Needs `ui` built. |
| `app` | `npm run build --workspace app` | Type-checks and builds the site. Needs `ui` built. |
| `app` | `npm run test --workspace app` | Mapping and page tests. Needs `ui` built. |
| `api` | `dotnet run --project api/Intrahealth.Api` | The API (same as `npm run api`). |
| `api` | `dotnet test api/Intrahealth.Api.Tests` | API tests (same as `npm run test:api`). |

## Tests

```bash
npm test                       # builds ui, then runs the ui and app tests
npm run typecheck              # builds ui, then runs tsc in both workspaces
npm run test:api               # the API's xUnit tests
```

`app` resolves `ui` through `dist/`, so both commands build `ui` first.

- **`ui`:** behaviour tests beside each component (Vitest, Testing Library, no
  snapshots), plus checks that every component is exported, every story
  renders, and the README matches the code.
- **`app`:** the display mapping, and both pages in every state against mocked
  responses.
- **`api`:** every endpoint, the search rules, the 404 body and the wire shape,
  run in memory with `WebApplicationFactory`.

## The API

| Endpoint | Returns |
| --- | --- |
| `GET /api/patients` | Every patient. |
| `GET /api/patients?search=oko` | Patients whose name contains the text, ignoring case; `[]` if none. |
| `GET /api/patients/{id}` | One patient, or `404` with a `ProblemDetails` body. |
| `GET /health` | `ok`. |

Some seed patients lack an email, phone or address, so missing values can be
seen. Full shape: `docs/API-CONTRACT.md`.

## Project documents

| Document | What it holds |
| --- | --- |
| `docs/DESIGNDOCUMENT.md` | The specification: tokens, components, pages. |
| `docs/API-CONTRACT.md` | The endpoints and payloads `app` and `api` share. |
| `docs/TASKS.md` | The work, as tasks with a check for each. |
| `docs/DECISIONS.md` | Why things are the way they are. |
| `docs/CONVENTIONS.md` | How code here is written. |

---

Built as a take-home exercise; the notes on approach, decisions and next
steps are in [INTERVIEW.md](./INTERVIEW.md).
