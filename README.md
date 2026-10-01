# UI Components Package

## Summary

React components that developers use to build healthcare apps: the screens of
an Electronic Health Record (EHR) system. Also here: an example website built
only from them, and a mock API with invented patient data.

## Quick start

Try it live. The free host sleeps when idle, so the first visit takes about a
minute.

| Site | Address |
| --- | --- |
| Example website | <https://ui-components-package.onrender.com> |
| Component docs | <https://ui-components-package.onrender.com/docs/> |
| Mock API (Swagger) | <https://ui-components-package.onrender.com/api/swagger> |

Or run it locally with Node 20+ and the .NET 10 software development kit
(SDK), from the repository root:

```bash
npm install                    # once
npm run api                    # terminal 1: the API on http://localhost:5080
npm run dev                    # terminal 2: builds ui, serves the site on http://localhost:5173
```

The site forwards `/api` to the API, so both must run.

## Tech stack

| Part | Built with |
| --- | --- |
| Components (`ui`) | React 19, TypeScript, CSS Modules, Vite (library build) |
| Docs site | Storybook 10 with MDX pages |
| Example website (`app`) | React 19, React Router 7, Vite |
| Mock API (`api`) | ASP.NET Core on .NET 10, Swagger (Swashbuckle) |
| Tests | Vitest and Testing Library; xUnit for the API; Playwright end to end |
| Lint | ESLint, Stylelint, dotnet format |
| CI | GitHub Actions running Docker builds; gitleaks for secrets |
| Hosting | One Docker image on Render |

## Parts and documents

| Part | README |
| --- | --- |
| UI components: Button, TextField, Card, Table, DescriptionList | [packages/ui/README.md](./packages/ui/README.md) |
| Docs site: a page per component, the tokens, a worked example | [packages/ui/src/docs/README.md](./packages/ui/src/docs/README.md) |
| Example website: patient list, record, register form | [packages/app/README.md](./packages/app/README.md) |
| Mock API: in-memory patient data, Swagger docs | [api/README.md](./api/README.md) |
| Tests and CI: running and writing them | [docs/TESTING.md](./docs/TESTING.md) |
| Harness: the Claude Code skills that built it | [.claude/README.md](./.claude/README.md) |

| Document | What it holds |
| --- | --- |
| [`docs/DESIGNDOCUMENT.md`](./docs/DESIGNDOCUMENT.md) | The spec: tokens, components, pages. |
| [`docs/API-CONTRACT.md`](./docs/API-CONTRACT.md) | Endpoints and payloads. |
| [`docs/TASKS.md`](./docs/TASKS.md) | The work, as tasks with checks. |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md) | Why things are as they are. |
| [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) | How code here is written. |

## Repository layout

```
CLAUDE.md                     working context, phases
README.md                     this file (deliverable)
INTERVIEW.md                  interview notes (deliverable)
package.json                  npm workspaces and every root command
eslint.config.js              lint for the TypeScript
stylelint.config.js           lint for the CSS: tokens only
Dockerfile                    the hosted image: site, API and docs
Dockerfile.ci                 every check, run by building it
render.yaml                   the free Render service
playwright.config.ts          end-to-end test setup
.github/workflows/ci.yml      CI on every push and pull request
.claude/                      the harness: skills and their README
docs/                         the project documents, listed above
e2e/                          end-to-end tests, in Chromium
packages/ui/
  src/
    tokens.css                every token-sheet value, defined once
    index.ts                  the only public entry point
    components/               per component: .tsx, .module.css, .test.tsx, .stories.tsx
    docs/                     the Storybook docs pages (MDX)
    examples/                 the worked example
  scripts/                    component scaffold, state screenshots
  docs/                       state screenshots used by the README
  .storybook/                 Storybook config (dev-only, not published)
  README.md                   the library documentation (deliverable)
packages/app/
  src/
    main.tsx                  React root, router, ui stylesheet import
    api/                      typed API calls and the display mapping
    pages/                    one file per page
api/Intrahealth.Api/          the ASP.NET Core project
api/Intrahealth.Api.Tests/    its xUnit tests
api/Intrahealth.slnx          both API projects, for dotnet format
```

## Hosting

One Docker image serves the website at `/`, the API at `/api` and the docs at
`/docs`. To deploy it free: push to GitHub, then in Render choose
**New → Blueprint** and pick the repository. Copy the service's deploy hook
(**Settings → Deploy Hook**) into a GitHub repository secret named
`RENDER_DEPLOY_HOOK_URL`. CI then deploys each push to `main` that passes
every check.

## Contributing

To add a component, see
[Contributing](./packages/ui/README.md#contributing-extending-the-library).
Follow `docs/CONVENTIONS.md` and run `npm run ci` before you commit.

---

Built as a take-home exercise. Approach, decisions and next steps:
[INTERVIEW.md](./INTERVIEW.md).
