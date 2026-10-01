# Example website

## Summary

A clinic's patient list and a patient's record, the kind of Electronic Health
Record (EHR) screens the `ui` components exist to build. It is built only from
those components and plain layout, and reads from the [mock API](../../api/README.md).

## Quick start

Needs Node 20+ and the .NET 10 SDK. From the repository root:

```bash
npm install                    # once
npm run api                    # terminal 1: the API on http://localhost:5080
npm run dev                    # terminal 2: builds ui, serves the site on http://localhost:5173
```

Open <http://localhost:5173>. Or try the live copy:
<https://ui-components-package.onrender.com>. It sleeps when idle, so the
first visit can take about a minute.

## Tech stack

React 19 and TypeScript, React Router 7 for the two routes, Vite to serve and
build, and Vitest with Testing Library for the tests. Every visible part comes
from `ui`.

## Pages

| Route | Page |
| --- | --- |
| `/` | The patient list. Search by name; click a row, or press Enter on it, to open the patient. |
| `/patients/:id` | One patient's details, or "Patient not found". |

Both pages show a loading state, and a failure message if the API is down.
The list says when a search matches no one. A missing phone, email or
address shows as "—".

## How it uses `ui`

- It imports only `'ui'` and `'ui/styles.css'`, by package name, and never
  overrides a `ui` style.
- `src/api/patients.ts` is the one mapping layer: the only code that calls
  the API, knows its field names, or decides a value is missing.

## Commands

Run from the repository root. Each needs `ui` built first
(`npm run build --workspace ui`); `npm run dev` does that for you.

| Command | What it does |
| --- | --- |
| `npm run dev --workspace app` | The site alone on :5173. |
| `npm run build --workspace app` | Type-checks and builds the site into `dist/`. |
| `npm run test --workspace app` | The mapping tests, and both pages in every state against mocked responses. |

## Files

| Path | What it holds |
| --- | --- |
| `src/main.tsx` | The routes. |
| `src/pages/` | The two pages and their tests. |
| `src/api/patients.ts` | The API calls and the payload-to-display mapping. |

## Contributing

To add a page:

1. Build it from `ui` components and plain layout markup. If it needs a
   component `ui` lacks, add it to the library first: see the library
   README's [Contributing](../ui/README.md#contributing-extending-the-library).
2. Add its route in `src/main.tsx`.
3. Fetch and map its data in `src/api/patients.ts`, the one mapping layer.
4. Test it in every state, as `src/pages/` does, and run
   `npm run test --workspace app`.
