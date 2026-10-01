# Tests

How to run and write tests for the components developers use to build
healthcare apps, plus the example website and mock API. A good test fails when
a user would notice something wrong, and only then.

## Quick start

Needs Node 20+ and the .NET 10 software development kit (SDK). From the
repository root:

```bash
npm install                    # once
npx playwright install chromium  # once, for the end-to-end tests
npm run ci                     # everything below, plus both builds
npm run lint                   # the linters (see Lint)
npm test                       # builds ui, then runs the ui and app tests
npm run test:api               # the API's tests
npm run typecheck              # builds ui, then type-checks ui and app
npm run test:e2e               # the website in Chromium against the real API
```

`npm run test:e2e` starts the API and site, or reuses running ones.

| Command | Runs |
| --- | --- |
| `npm run test --workspace ui` | The `ui` tests. |
| `npm run test --workspace app` | The `app` tests. Build `ui` first. |
| `npm run test:watch --workspace ui` | The `ui` tests, again on every save. |
| `npx vitest run src/components/Button` | One component's tests, from `packages/ui`. |

## Lint

`npm run lint` runs three linters; `npm run lint:fix` fixes what it can.

| Linter | Files | What it enforces |
| --- | --- | --- |
| ESLint | TypeScript in `ui`, `app`, `e2e` | Likely bugs, React hook rules, accessibility (jsx-a11y), and `app` importing only `'ui'` and `'ui/styles.css'`. |
| Stylelint | Every `.css` file | No hard-coded colour, spacing or font size outside `tokens.css`. |
| `dotnet format` | The API and its tests | C# formatting and code style. |

Warnings fail the run too. If a rule must be broken, use a disable comment
on that line that says why, as `DescriptionList.module.css` does for the
visually-hidden `-1px`.

## Continuous integration

GitHub Actions runs three jobs on every push and pull request to `main`
([`ci.yml`](../.github/workflows/ci.yml)):

| Job | What it does |
| --- | --- |
| Tests and builds | Builds `Dockerfile.ci`, which runs `npm run ci`. |
| Hosted image | Builds `Dockerfile`, the image Render deploys. |
| Secrets | Scans every commit for passwords, keys and tokens. |

With only Docker installed:

```bash
npm run ci:docker              # same as: docker build -f Dockerfile.ci .
```

## What each suite covers

| Suite | Tests | Where | What they check |
| --- | --- | --- | --- |
| `ui` components | 67 | `packages/ui/src/components/*.test.tsx` | Roles, labels, keyboard, disabled, loading, error, empty, `—`. |
| `ui` worked example | 5 | `packages/ui/src/examples/` | The worked example works and matches its README listing. |
| `ui` entry point | 2 | `packages/ui/src/index.test.ts` | Every component is exported, and nothing else. |
| `ui` stories | 21 | `packages/ui/src/stories.test.tsx` | Every Storybook story renders. |
| `ui` README | 81 | `packages/ui/src/readme.test.ts` | The library README's links, contents and props tables match the code. |
| `app` | 81 | `packages/app/src/**/*.test.ts(x)` | The display mapping, and all three pages in every state. |
| `api` | 38 | `api/Intrahealth.Api.Tests/` | Every endpoint, search, registration and its validation, not-found, JSON shape, Swagger. |
| End to end | 15 | `e2e/` | Every behaviour in the page spec, and one journey across all three pages. |

Tools: Vitest and Testing Library for `ui` and `app`, xUnit for `api`, and
Playwright end to end. Only the end-to-end failure test fakes the network.

## Writing tests

Put a component's tests beside it, as `<Component>.test.tsx`. Its export,
stories and README section are checked for you; see
[Contributing](../packages/ui/README.md#contributing-extending-the-library).

A behaviour test, simplified from `Button.test.tsx`:

```tsx
it('does not call onClick while loading', async () => {
  const onClick = vi.fn();
  render(<Button loading onClick={onClick}>Save</Button>);

  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(onClick).not.toHaveBeenCalled();
});
```

### Pick the level

Test each behaviour once, at the cheapest level that can see it.

| Level | Use it for |
| --- | --- |
| Unit (`app` mapping) | Pure logic: API data to display values, date formats, validation rules. |
| Behaviour (`ui`, `app`) | What a user sees and does with one component or page. |
| API | Each endpoint's status code and JSON. |
| End to end | Only what needs a real browser and API: routing, Back, the network. Slow; use last. |

### Write it like a user

- **Find things as a user does:** `getByRole`, `getByLabelText`,
  `getByText`. A button with no accessible name can't be found, so this checks
  accessibility too.
- **Act with `userEvent`,** not `fireEvent`, so focus and keyboard bugs show
  up.
- **Assert outcomes:** the handler ran, the error replaced the hint, the row
  opened the patient. Never assert class names, state or snapshots.
- **Wait with `findBy…` or `waitFor`,** never a fixed delay.

### One behaviour per test

- **Name it as a sentence,** such as
  `'shows — for a missing value, never blank or undefined'`, so a failure
  says what broke.
- **Arrange, act, assert,** separated by blank lines.
- **Build data with a helper and override only what matters,** like
  `patient({ phone: null })`.
- **Cover every state:** loading, empty, error, disabled, missing value, not
  found.

### Don't guess the expected answer

Take expected values from the source or the design document. The search
test's guessed ids were wrong twice; it now computes them from the seed data.

### Control what the test doesn't own

- **Fake only the edge:** replace `fetch` or the network, never the module
  under test.
- **Control timing:** hold a faked response until the test has checked the
  loading state (`deferred()` in `PatientListPage.test.tsx`).
- **Share no state.** Each test renders and builds its own data.

### Prove the test works

A test that can't fail is worse than none. Before you commit:

1. Break the behaviour: remove the `disabled`, blank the cell, skip the check.
2. Run the test and confirm it fails with a message that names the problem.
3. Restore the code and confirm it passes.

Then run `npm run typecheck` (Vitest doesn't type-check) and `npm run ci`.
