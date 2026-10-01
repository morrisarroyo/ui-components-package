# Example website

## Summary

Electronic Health Record (EHR) screens built only from the `ui` components: a
clinic's patient list, a patient's record and a form to register a patient.
Data comes from the [mock API](../../api/README.md).

## Quick start

From the repository root (prerequisites: [project README](../../README.md#quick-start)):

```bash
npm install                    # once
npm run api                    # terminal 1: the API on http://localhost:5080
npm run dev                    # terminal 2: builds ui, serves the site on http://localhost:5173
```

Live copy: <https://ui-components-package.onrender.com>.

## Tech stack

React 19, TypeScript, React Router 7, Vite and Vitest.

## Pages

| Route | Page |
| --- | --- |
| `/` | Patient list. Search by name; click a row or press Enter to open it. The search stays in the address, so Back from a patient keeps it. |
| `/patients/:id` | One patient's details, or "Patient not found". |
| `/patients/new` | Register a patient. Errors show on their fields; the form is disabled while saving; success opens the record. |

Every page shows loading, empty and API-down messages where they apply. A
missing phone, email or address shows as "—".

## Rules

- Import only `'ui'` and `'ui/styles.css'`. Never override a `ui` style.
- Only `src/api/patients.ts` calls the API or decides a value is missing.

## Commands

Run from the repository root, after `npm run build --workspace ui`.

| Command | What it does |
| --- | --- |
| `npm run dev --workspace app` | The site alone on :5173. |
| `npm run build --workspace app` | Type-checks and builds into `dist/`. |
| `npm run test --workspace app` | Unit and page tests. |
| `npm run test:e2e` | Browser tests against the real API. |

Test coverage: [docs/TESTING.md](../../docs/TESTING.md).

## Files

| Path | What it holds |
| --- | --- |
| `src/main.tsx` | The routes. |
| `src/pages/` | The pages and their tests. |
| `src/api/patients.ts` | API calls, display values and the register form's rules. |

## Contributing

To add a page:

1. Build it from `ui` components and plain layout. Missing a component? Add it
   to the library first ([how](../ui/README.md#contributing-extending-the-library)).
2. Add its route in `src/main.tsx`.
3. Fetch and map its data in `src/api/patients.ts`.
4. Test every state, as `src/pages/` does.
