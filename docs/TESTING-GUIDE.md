# Writing effective tests

How to write unit and behaviour tests that catch real breakage in the `ui`
components, the example website and the API. Developers building healthcare
apps rely on these components, so a test should fail when a user would notice
something wrong, and pass otherwise. How to run the suites is in
[TESTING.md](../TESTING.md).

## Quick start

A behaviour test for a component, simplified from
`packages/ui/src/components/Button.test.tsx`:

```tsx
it('does not call onClick while loading', async () => {
  const onClick = vi.fn();
  render(<Button loading onClick={onClick}>Save</Button>);

  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(onClick).not.toHaveBeenCalled();
});
```

Run it with `npx vitest run src/components/Button` from `packages/ui`. Then
break the code on purpose and check that the test fails (see
[Prove the test works](#prove-the-test-works)).

## Pick the level

Test each behaviour once, at the cheapest level that can see it.

| Level | Use it for | Where |
| --- | --- | --- |
| Unit | Pure logic: the mapping from API data to display values, date formats, validation rules. | `packages/app/src/api/*.test.ts` |
| Behaviour | What a user sees and does with one component or page: clicks, typing, keyboard, states. | `*.test.tsx` beside the code |
| API | Each endpoint's status code and JSON, through the real app in memory. | `api/Intrahealth.Api.Tests/` |
| End to end | What needs a real browser and the real API: routing, Back, the network. | `e2e/` |

End-to-end tests are slow, so keep them for behaviour the other levels can't
reach.

## Write it like a user

- **Find things the way a user does:** `getByRole`, `getByLabelText`,
  `getByText`. A role query also checks accessibility: if the button has no
  accessible name, the test can't find it.
- **Act with `userEvent`,** not `fireEvent`. It types, tabs and clicks as a
  browser does, so focus and keyboard bugs show up.
- **Assert outcomes,** not internals: the handler was called, the error text
  replaced the hint, the row opened the patient. Don't assert class names,
  state variables or snapshots; they break on harmless refactors and miss
  real bugs.
- **Wait for async results** with `findBy…` or `waitFor`, never a fixed
  delay.

## One behaviour per test

- **Name the test as a sentence about the behaviour:**
  `'shows — for a missing value, never blank or undefined'`. A failure then
  says what broke.
- **Arrange, act, assert,** separated by blank lines.
- **Build data with a helper and override only what matters,** like
  `patient({ phone: null })` in the page tests. The reader sees which field
  the test is about.
- **Cover every state,** not only the happy path: loading, empty, error,
  disabled, missing value, not found.

## Don't guess the expected answer

Work out expected values from the source, not by eye. The API's search test
was once wrong twice because its expected ids were guessed; it now computes
them from the seed data. Where a value is fixed by the design document (a
date format, a message), copy it from there.

## Control what the test doesn't own

- **Stub at the edge:** replace `fetch` or the network, never the module
  under test.
- **Control timing:** release a stubbed response when the test is ready, so
  it can check the loading state first (`deferred()` in
  `PatientListPage.test.tsx`).
- **No shared state between tests.** Each test renders its own tree and
  creates its own data.

## Prove the test works

A test that can't fail is worse than none. Before you commit:

1. Break the behaviour in the code: remove the `disabled`, blank the cell,
   skip the check.
2. Run the test and confirm it fails, with a message that names the problem.
3. Restore the code and confirm it passes.

Also run `npm run typecheck`: Vitest doesn't type-check, so a test can pass
while the compiler rejects it.

## Checklist

- [ ] At the cheapest level that can see the behaviour.
- [ ] Queries by role, label or text; acts with `userEvent`.
- [ ] Asserts what the user sees or what the caller gets.
- [ ] One behaviour, named as a sentence.
- [ ] Every state covered, not only success.
- [ ] Expected values come from the source or the spec.
- [ ] Fails when the behaviour is broken; passes `npm run ci`.
