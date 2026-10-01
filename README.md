# UI Components Package

## Summary

React UI components that developers use to build applications for the
healthcare setting: the screens of an Electronic Health Record (EHR) system.
The repository also holds an example website built only from them and a mock
API that feeds it invented patient data.

## Quick start

Try it live. The free host sleeps when idle, so the first visit can take
about a minute.

| Site | Address |
| --- | --- |
| Example website | <https://ui-components-package.onrender.com> |
| Component docs | <https://ui-components-package.onrender.com/docs/> |
| Mock API (Swagger) | <https://ui-components-package.onrender.com/api/swagger> |

Or run it locally. Needs Node 20+ (npm 7+) and the .NET 10 SDK. From the
repository root:

```bash
npm install                    # once
npm run api                    # terminal 1: the API on http://localhost:5080
npm run dev                    # terminal 2: builds ui, serves the site on http://localhost:5173
```

The site's dev server forwards `/api` to the API, so both must run.

## Tech stack

| Part | Built with |
| --- | --- |
| Components (`ui`) | React 19, TypeScript, CSS Modules, Vite (library build) |
| Docs site | Storybook 10 with MDX pages |
| Example website (`app`) | React 19, React Router 7, Vite |
| Mock API (`api`) | ASP.NET Core on .NET 10, Swagger (Swashbuckle) |
| Tests | Vitest and Testing Library; xUnit for the API; Playwright end to end |
| CI | GitHub Actions running Docker builds; gitleaks for secrets |
| Hosting | One Docker image on Render |

## READMEs

Each part of the project has its own README, starting with a quick start.

| Part | What it is | README |
| --- | --- | --- |
| UI components | The library: Button, TextField, Card, Table, DescriptionList. | [packages/ui/README.md](./packages/ui/README.md) |
| Storybook docs | A page per component with live demos, the tokens, a worked example and how to contribute. | [packages/ui/src/docs/README.md](./packages/ui/src/docs/README.md) |
| Example website | A searchable patient list, a patient's record and a register form, built from the components. | [packages/app/README.md](./packages/app/README.md) |
| Mock API | ASP.NET Core, in-memory patient data, Swagger docs. | [api/README.md](./api/README.md) |
| Tests | What each test suite covers, how to run them, and CI. | [TESTING.md](./TESTING.md) |
| Harness | The Claude Code skills the project was built with. | [.claude/README.md](./.claude/README.md) |

## Layout

```
packages/ui     the component library, and its Storybook docs in src/docs
packages/app    the example website
api/            the mock API, and its tests in api/Intrahealth.Api.Tests
e2e/            end-to-end tests
docs/           design document, API contract, tasks, decisions, conventions, testing guide
```

`app` imports `ui` by package name only, as any other app would.

## Hosting

The `Dockerfile` builds one image that serves the website at `/`, the API at
`/api` and the component docs at `/docs`. `render.yaml` deploys it as a free
Render web service: push the repository to GitHub, then in Render choose
**New → Blueprint** and pick the repository.

## Project documents

| Document | What it holds |
| --- | --- |
| `docs/DESIGNDOCUMENT.md` | The specification: tokens, components, pages. |
| `docs/API-CONTRACT.md` | The endpoints and payloads `app` and `api` share. |
| `docs/TASKS.md` | The work, as tasks with a check for each. |
| `docs/DECISIONS.md` | Why things are the way they are. |
| `docs/CONVENTIONS.md` | How code here is written. |
| [`docs/TESTING-GUIDE.md`](./docs/TESTING-GUIDE.md) | How to write unit and behaviour tests that catch real breakage. |

## Contributing

To add a component, run the scaffold and follow the steps in the library
README's [Contributing](./packages/ui/README.md#contributing-extending-the-library)
section, or the **Contributing** page on the
[docs site](https://ui-components-package.onrender.com/docs/). House style is
in `docs/CONVENTIONS.md`; run `npm run ci` before you commit.

---

Built as a take-home exercise; the notes on approach, decisions and next
steps are in [INTERVIEW.md](./INTERVIEW.md).
