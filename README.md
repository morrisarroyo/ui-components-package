# EHR Design System

> **Status: in progress.** This README is a skeleton, filled in as the work
> lands (task T-4.2 in `docs/TASKS.md`). Sections marked TODO are not yet true.

A React design system for an Electronic Health Record product suite, together
with a small website that consumes it and a mock API that feeds it.

## What is here

| Package | Path | What it is |
| --- | --- | --- |
| `ui` | `packages/ui` | The component library: Button, TextField, Card, Table, DescriptionList. React + TypeScript, CSS Modules, one entry point. |
| `app` | `packages/app` | The website: a patient list and a patient detail page, built only from `ui`. |
| `api` | `api/Intrahealth.Api` | An ASP.NET Core mock API serving invented patient data from memory. |

`app` consumes `ui` as a package — it imports from the library's entry point,
not from its source.

## Layout

```
packages/ui     the component library      → packages/ui/README.md for how to use it
packages/app    the website
api/            the mock API
docs/           design document, tasks, API contract, decisions, conventions
```

## Running it

TODO — confirm each command from a clean checkout before this section is
trusted (T-4.2).

```bash
npm install                    # once, at the root
npm run api                    # terminal 1: the mock API on :5080
npm run dev                    # terminal 2: builds ui, then serves the site on :5173
```

Both need to be running: the site's dev server proxies `/api` to the API.

### Per package

| Package | Command |
| --- | --- |
| `ui` | `npm run build --workspace ui` · `npm run test --workspace ui` |
| `app` | `npm run dev --workspace app` (requires `ui` to be built) |
| `api` | `dotnet run --project api/Intrahealth.Api` |

## Requirements

- Node — TODO: state the version the work was done on
- .NET SDK — TODO: state the version the work was done on

## Using the library

See `packages/ui/README.md`: getting started, the token sheet and how styling
works, a reference for each component, and how to add a sixth.

## Tests

TODO — what is covered and how to run it.

---

This project was built as a take-home exercise. The notes on how it was
approached, what was decided and what would come next are in
[INTERVIEW.md](./INTERVIEW.md).
