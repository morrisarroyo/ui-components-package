# Tests

How to check that the `ui` components, the example website and the mock API
still work: what developers building healthcare apps with the components rely
on.

## Quick start

Needs Node 20+ and the .NET 10 SDK. From the repository root:

```bash
npm install                    # once
npm test                       # builds ui, then runs the ui and app tests
npm run test:api               # the API's tests
npm run typecheck              # builds ui, then type-checks ui and app
```

`app` uses the built `ui`, so `npm test` and `npm run typecheck` build it
first.

## What each suite covers

| Suite | Tests | Where | What they check |
| --- | --- | --- | --- |
| `ui` components | 67 | `packages/ui/src/components/*.test.tsx` | Behaviour: roles, labels, keyboard, disabled, loading, error, empty, `—`. |
| `ui` worked example | 5 | `packages/ui/src/examples/` | The patient lookup example works, and the README listing matches it. |
| `ui` entry point | 2 | `packages/ui/src/index.test.ts` | Every component is exported, and nothing else. |
| `ui` stories | 21 | `packages/ui/src/stories.test.tsx` | Every Storybook story renders. |
| `ui` README | 81 | `packages/ui/src/readme.test.ts` | The library README's code links, contents and props tables match the code. |
| `app` | 54 | `packages/app/src/**/*.test.ts(x)` | The mapping from API data to display values, and both pages in every state. |
| `api` | 25 | `api/Intrahealth.Api.Tests/` | Every endpoint, the search rules, the 404 body, the JSON shape and the Swagger docs. |

The `ui` and `app` tests use Vitest and Testing Library. They query the page
as a user would and use no snapshots. The `api` tests use xUnit and run the
real API in memory.

## One package at a time

| Command | Runs |
| --- | --- |
| `npm run test --workspace ui` | The `ui` tests. |
| `npm run test --workspace app` | The `app` tests. Build `ui` first. |
| `npm run test:watch --workspace ui` | The `ui` tests, again on every save. |
| `npx vitest run src/components/Button` | One component's tests, from `packages/ui`. |

## Adding tests

Put a component's tests beside it, as `<Component>.test.tsx`. Test one
behaviour per test, and query by role, label or text. A new component's
export, stories and README section are checked without new tests; see
[Contributing](./packages/ui/README.md#contributing-extending-the-library).
