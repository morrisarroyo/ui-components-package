# EHR Design System

A React design system for an Electronic Health Record product suite, together
with a small website that consumes it and a mock API that feeds it.

The library is the product. The website exists to prove it: two pages, a
patient list and a patient detail view, built from nothing but the library's
components and plain layout markup. The API serves invented patient data so the
website has something real to load, search and fail against.

## What is here

| Package | Path | What it is |
| --- | --- | --- |
| `ui` | `packages/ui` | The component library: Button, TextField, Card, Table, DescriptionList. React + TypeScript, CSS Modules, design tokens as CSS custom properties, one entry point. |
| `app` | `packages/app` | The website: a searchable patient list and a patient detail page, built only from `ui`. |
| `api` | `api/Intrahealth.Api` | An ASP.NET Core minimal API serving invented patient data from memory. No database, no authentication. |

`app` consumes `ui` as an installed package. It imports `ui` and
`ui/styles.css` by name, resolved through the library's `exports` map to its
built `dist/`, so a deep import into the library's source does not resolve.

## Layout

```
packages/ui     the component library    → packages/ui/README.md for how to use it
packages/app    the website
  src/api/        the API client and the one payload-to-display mapping
  src/pages/      the two pages
api/            the mock API, and its tests in api/Intrahealth.Api.Tests
docs/           design document, API contract, tasks, decisions, conventions
```

## Requirements

- **Node 20 or later** with npm 7 or later (for workspaces). Developed on Node
  26.7 and npm 11.19.
- **.NET SDK 10.** Developed on 10.0.400.

## Running it

From the repository root:

```bash
npm install                    # once: installs both JavaScript workspaces
npm run api                    # terminal 1: the mock API on http://localhost:5080
npm run dev                    # terminal 2: builds ui, then serves the site on http://localhost:5173
```

Open <http://localhost:5173>. Both processes need to be running: the site calls
same-origin `/api/...`, and its dev server forwards those requests to the API.
With the API stopped, the site shows its "Something went wrong" state, which is
the intended behaviour, not a setup problem.

### Per package

| Package | Command | What it does |
| --- | --- | --- |
| `ui` | `npm run build --workspace ui` | Builds `dist/ui.js`, `dist/ui.css` and type declarations. |
| `ui` | `npm run test --workspace ui` | Component behaviour tests. |
| `ui` | `npm run storybook --workspace ui` | Storybook on http://localhost:6006, every component in every state. The same as `npm run storybook`. |
| `ui` | `npm run build-storybook --workspace ui` | Builds a static Storybook into `packages/ui/storybook-static/`. |
| `ui` | `npm run new-component --workspace ui -- Badge` | Scaffolds a component's four files and its export; see the library README's Extending section. |
| `ui` | `npm run capture-states --workspace ui` | Builds Storybook and re-captures the state screenshots in `packages/ui/docs/states/`. Downloads nothing; needs `npx playwright install chromium` once. |
| `app` | `npm run dev --workspace app` | The site's dev server alone. Needs `ui` built first; the root `npm run dev` does both. |
| `app` | `npm run build --workspace app` | Type-checks and builds the site for production. Needs `ui` built. |
| `app` | `npm run test --workspace app` | Mapping and page tests. Needs `ui` built. |
| `api` | `dotnet run --project api/Intrahealth.Api` | The mock API, the same as `npm run api`. |
| `api` | `dotnet test api/Intrahealth.Api.Tests` | The API's tests, the same as `npm run test:api`. |

## Tests

```bash
npm test                       # builds ui, then runs every workspace's tests: ui, then app
npm run typecheck              # builds ui, then runs tsc across both workspaces
npm run test:api               # the mock API's xUnit tests (needs the .NET SDK)
```

Both build `ui` first because `app` resolves `ui` through its built `dist/`,
exactly as an outside consumer would. Run per package, `app`'s tests and
type-check need `npm run build --workspace ui` to have run once.

- **`ui`** — Vitest and Testing Library, one test file beside each
  component, plus a test that the entry point exports every component, one
  that renders every Storybook story, and one that keeps the README's worked
  example identical to its source. They check behaviour, not markup: a disabled or loading Button
  cannot be clicked or tabbed to, a TextField's error replaces its helper
  text, a clickable Table row works from the keyboard, a DescriptionList shows
  `—` for a missing value. There are no snapshot tests.
- **`app`** — the display mapping (names, dates, missing fields, the three
  outcomes of a request) and both pages in each of their states, against
  mocked API responses.
- **`api`** — xUnit in `api/Intrahealth.Api.Tests`, running the real API in
  memory through `WebApplicationFactory`: every endpoint in
  `docs/API-CONTRACT.md`, the search filter's matching rules, the 404
  ProblemDetails body, the wire shape (camelCase, nulls sent rather than
  omitted), and the seed patients with missing fields.

## The API

| Endpoint | Returns |
| --- | --- |
| `GET /api/patients` | Every patient. |
| `GET /api/patients?search=oko` | Patients whose name contains the text, ignoring case. `[]` when nothing matches. |
| `GET /api/patients/{id}` | One patient, or `404` with a `ProblemDetails` body. |
| `GET /health` | `ok`. |

Several seed patients are deliberately incomplete (no email, no phone, no
address, a partial address) so the website's handling of missing values can
be seen. The full shape is in `docs/API-CONTRACT.md`.

## Using the library

See [`packages/ui/README.md`](./packages/ui/README.md): getting started, the
token sheet and how styling works, a reference for each component, and how to
add a sixth.

## Project documents

| Document | What it holds |
| --- | --- |
| `docs/DESIGNDOCUMENT.md` | The specification: tokens, components, pages. |
| `docs/API-CONTRACT.md` | The endpoints and payloads `app` and `api` share. |
| `docs/TASKS.md` | The work, broken into tasks with a check for each. |
| `docs/DECISIONS.md` | Why things are the way they are. |
| `docs/CONVENTIONS.md` | How code in this repository is written. |

---

This project was built as a take-home exercise. The notes on how it was
approached, what was decided and what would come next are in
[INTERVIEW.md](./INTERVIEW.md).
