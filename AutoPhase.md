# AutoPhase log

Baseline before this run: 0 tests (none written), no commits — Phase 0 committed as `cecc901` at the start of the run; Phase 1 components drafted but uncommitted and untested.

Run of 2026-09-25, Phase 1, full auto (commits unreviewed). One entry per task, written as it lands.

## T-1.1 Design tokens
- **Verified:** scripted check of all 24 token-sheet rows in `docs/DESIGNDOCUMENT.md` against `packages/ui/src/tokens.css` — each property defined exactly once with the stated value (hex differs only in case); the 15 typography properties read by hand.
- **Note:** committed with a tokens-only `src/index.ts`; each component task adds its own export lines so every commit builds.

## Toolchain fix (T-0.3 / T-0.4 defect, found during T-1.2)
- **What:** `tsc` had never passed. Added `packages/ui/src/vite-env.d.ts` (CSS Module types), relative lib entry in place of `resolve(__dirname, …)`, `defineConfig` from `vitest/config` in both packages, Vitest ^2.1.8 → ^3.2.4 (Vitest 2 nested its own Vite 5 against the project's Vite 6).
- **Verified:** `npx tsc --noEmit` clean in `ui` and `app`; `vite build && tsc -p tsconfig.build.json` emits `ui.js`, `ui.css`, `index.d.ts`; the 36 drafted component tests still pass on Vitest 3.
- **Plan discrepancy:** T-0.3 was marked Done on "config files are internally consistent", a check that never ran the compiler. Committed as a separate fix rather than folded into a component task so it can be reverted on its own.

## T-1.2 Button — committed, left In progress
- **Verified:** `Button.test.tsx` (11 tests — the commit message says 10, a miscount: all four variant × size combinations click through, variants render distinct, Enter activates, default `type="button"`, disabled is `disabled` and swallows clicks, loading swallows clicks, loading keeps its accessible name with `aria-busy`, loading is out of the tab order) — passed; `tsc --noEmit` clean. Full suite not yet run.
- **Fixed during verification:** the loading label used `visibility: hidden`, which removed the button's accessible name; now `opacity: 0`. Literal pixel values (1px border, 14px spinner) now carry the why-no-token comment the conventions require.
- **Parked (manual checkpoint):** "check in a browser that the width is identical with `loading` on and off". Headless Brave hung under three flag sets in this environment, so this was not run. Status left In progress, which also holds T-1.7 and T-1.8 behind it.
- **Plan discrepancy:** T-1.2–T-1.6 name T-1.7's tests as their check while T-1.7 depends on them. Tests were written first, used to verify each component, and committed with their component (the conventions' "three files, one folder"). T-1.7 is left as the task that confirms the full listed set, not the one that adds it.

## T-1.3 TextField
- **Verified:** `TextField.test.tsx` (8 tests: label association via `getByLabelText`, clicking the label focuses the input, two fields get distinct ids, onChange receives the typed value, helper text is the input's accessible description, a non-empty error replaces the helper text and is announced as an alert with `aria-invalid`, an empty `errorMessage` is not an error, disabled is `disabled` and ignores typing) — passed. Full suite not yet run.

## T-1.4 Card
- **Verified:** `Card.test.tsx` (4 tests: title only, actions only, both, neither — the neither case asserts no header row is rendered) — passed. Full suite not yet run.

## T-1.5 Table
- **Verified:** `Table.test.tsx` (8 tests: headers and cells per column, default "No results", custom emptyMessage, click passes the row, Tab + Enter activates the second row, Space activates, non-clickable rows are not tabbable, clickable rows keep row/cell semantics) — passed. Full suite not yet run.
- **Fixed during verification:** `role="button"` on clickable `<tr>` removed; recorded as D-15. A decision taken alone: an in-cell control was considered and not chosen because it would change the prop surface the brief specifies.

## T-1.6 DescriptionList
- **Verified:** `DescriptionList.test.tsx` (5 tests: labels as terms and values as definitions, em dash for `null`, `undefined` and `''`, and `0` still renders as a value) — passed. Full suite not yet run.

## T-2.2 ASP.NET Core project
- **Verified:** `dotnet run` in `api/Intrahealth.Api` (net10.0, the SDK installed here) started; `curl -i http://localhost:5080/health` → `200 OK`, `text/plain`, body `ok`.
- **Decision taken alone:** the port is pinned in `Program.cs` via `UseUrls` as well as in `launchSettings.json` (template's https profile and browser launch removed), so the proxy target holds however the project is started.

## T-2.3 Seed data
- **Verified:** `dotnet build` clean (0 warnings); `SeedData.cs` read back — p-0003 has `Email: null`, p-0005 has `Address: null`. Twelve patients; two share the "Ok" prefix (Okonkwo, Okafor) so a partial search returns more than one and fewer than all. The served JSON is checked in T-2.4.
- **Beyond the minimum, deliberately:** p-0007 no phone, p-0009 partial address, p-0011 an address whose parts are all null — the contract's "treated as missing" rule needs a record to exercise it. Genders cover all four contract values.

## T-2.4 Endpoints
- **Verified** with `dotnet run --project api/Intrahealth.Api` and curl: full list → 200, 12 patients, `email: null` / `address: null` serialised as JSON null; `search=oko`, `OKO`, `amara oko`, `mara okon` → `[p-0001]`; `search=ok` → Okonkwo and Okafor; whitespace-only search → all 12; `search=zzz` → 200 `[]`; `p-0011` → 200 with an all-null address object; `p-9999` → 404 `application/problem+json` with the exact type, title, status and detail the contract shows.

## End of run — full pass
- `npm run test --workspace ui`: 5 files, **36 passed** (baseline 0). `npm run typecheck`: clean in `ui` and `app`. `npm run build --workspace ui`: `ui.js`, `ui.css`, `index.d.ts` emitted; `ui.js` imports `react` and `react/jsx-runtime` rather than inlining them. `dotnet build api/Intrahealth.Api`: 0 warnings, 0 errors.
- Every commit from `44bbc19` to `5af19f5` was also checked out on its own and passes `tsc` and its tests (11 → 19 → 23 → 31 → 36).

## Stopped — waiting on the user
- **Blocker:** T-1.2's manual check, "the width is identical with `loading` on and off", in a real browser. T-1.7 depends on T-1.2, T-1.8 on T-1.7, and every Phase 3 and 4 task on T-1.8, so nothing is startable until it is confirmed.
- **Prediction to confirm:** identical widths and heights for all 8 pairs (primary/secondary × sm/md × short/long label). Loading only changes the label's `opacity` and adds an absolutely positioned spinner, neither of which takes part in layout.
- **Once confirmed:** mark T-1.2 Done. T-1.7 is then verification only — its listed cases are already committed, so run `npm run test --workspace ui` and check each case is present. T-1.8 follows (build and React-external check already pass, see above).

## T-1.2 Button — manual checkpoint closed by the user
- **Verified by the user:** `width.html` opened in Brave; all 8 idle/loading pairs (primary/secondary × sm/md × short/long label) reported `SAME` width and height, as predicted. T-1.2 marked Done; T-1.7 is now startable.

---

# Run 2 — 2026-09-25, resumed after T-1.2's checkpoint

Baseline before this run: 36 ui tests passing (5 files), app 0 tests, workspace clean at `c7b9c8b`.

## T-1.7 Component behaviour tests
- **Verified:** `npx --workspace ui vitest run --reporter=verbose` — 36 passed, and each case T-1.7 lists is present by name: Button variants (4 variant×size + distinct), Button disabled, Button no onClick while loading, TextField error replaces helper text, TextField label association, Table empty state and row click (mouse, Enter, Space), DescriptionList `—` for null/undefined/''. No snapshots.
- **Mutation check:** made `loading` no longer disable the Button and narrowed DescriptionList's empty test to `null` only → 4 named tests failed (`does not call onClick while loading`, `cannot be reached with Tab while loading`, em dash for `undefined`, em dash for `''`); restored, 36 pass.
- **Note:** no new files — the tests were committed with their components (see T-1.2's plan discrepancy), so this commit carries only the status and this record.

## T-1.8 Library build
- **Verified:** `npm run build --workspace ui` from an emptied `dist/` exits 0 and emits `ui.js`, `ui.css`, `index.d.ts` (plus per-component declarations). `ui.js` imports only `react` and `react/jsx-runtime`, with no React internals inlined. `ui.css` carries the tokens. From `packages/app`: `import('ui')` yields the five components, `ui/styles.css` resolves to `dist/ui.css`, a deep import of `ui/src/...` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`, and a throwaway consumer file importing `Button`, `ButtonVariant`, `TableRow` type-checks (deleted afterwards).
- **Note:** no source change was needed; the build fix that made declarations emit landed in `44bbc19`.

## T-3.1 App shell and routing
- **Verified:** `npm run dev` (builds ui, starts Vite on :5173): `GET /` and `GET /patients/p-0001` → 200 `index.html` with `#root`; `/src/main.tsx` and the page modules → 200 compiled JS. `npm run build --workspace app` (tsc + vite build) succeeds against the built `ui`. `grep` over `packages/app/src` finds no `ui/src` or relative import into the library; the only `ui` import is `ui/styles.css` in `main.tsx`.
- **Not verified:** the rendered DOM in a browser. The task's check is "serves both routes", which is met; what the pages render is checked by T-3.3 and T-3.4.
- **Files beyond the plan:** page stubs `pages/PatientListPage.tsx` and `pages/PatientDetailPage.tsx` (filled in by T-3.3 and T-3.4), and `src/vite-env.d.ts`.

## T-3.2 API client and display mapping
- **Verified:** `src/api/patients.test.ts`, 15 tests (complete mapping, null phone/email/address, blank as missing, partial address, all-null address, unknown gender passes through, 1 Jan does not shift, unreadable date passes through; list success, trimmed/encoded search, non-2xx and network failure as error; detail success, 404 as not-found, other failure as error) — passed. **End to end** through the real dev proxy against the running API (temporary script, not committed): 12 patients; `ok` → Amara Okonkwo, Samuel Okafor; `zzz` → ok with `[]`; p-0003 email null, p-0005 address null, p-0007 phone null, p-0009 "Ottawa, ON", p-0011 all-null address → null; p-9999 → not-found; API stopped → error. `grep` finds no API field name outside `src/api/`.
- **Note on the check:** the display model reuses some wire names (`phone`, `email`, `birthDate`), so after the pages land a grep cannot distinguish them. The durable guarantee is the type system: pages only receive `PatientDisplay`.
- **Decision taken alone:** D-16, birth dates as "2 Mar 1984".
- **Environment slip, not a defect:** the first end-to-end run reported every call as an error because my wait loop treated the proxy's 502 during the API's compile as "up". The re-run after a real health check passed.
- **Files beyond the plan:** `src/test-setup.ts`, which the app's Vitest config already named but which did not exist.

## T-3.3 Patient list page
- **Verified in a real browser** (headless Brave driven over the DevTools protocol, dev server + running API): title "Patients"; with 1.5 s added latency "Loading…" shows and no table, then the table replaces it; headers Name, Gender, Birth date, Phone; 12 rows, first "Amara Okonkwo · Female · 2 Mar 1984 · +1 416 555 0133"; search "oko" → button disabled, `aria-busy`, spinner, width unchanged at 81.125px while in flight, then one row; "zzz" → "No patients match your search"; clicking row 3 → `/patients/p-0003`; focusing row 1 + Enter → `/patients/p-0001`; API stopped → Card "Something went wrong", no table, no "Loading…", search still present.
- **Also:** `src/pages/PatientListPage.test.tsx`, 7 jsdom tests of the same states against mocked responses (MemoryRouter — a data router's Request breaks under jsdom). App suite 22 passed.
- **Measurement slip, not a defect:** the first browser read of the button's loading state came back idle because it read the DOM in the same tick as the click; React commits a discrete update in a microtask. Re-read 100ms later: loading.
- **Known gap, recorded in INTERVIEW.md:** a null phone renders as a blank Table cell; the fix belongs in the library's Table spec.
- **Decisions taken alone:** the search sits in a `<form role="search">` so Enter also searches (the brief does not require it, nor forbid it); an app layout stylesheet (`pages/Page.module.css`) uses only library tokens and styles only app elements; stale responses are dropped by request counter.

## T-3.4 Patient detail page
- **Verified in a real browser** against the running API: with 1.5 s latency, "Loading…" and no list; p-0001 complete — h1 "Amara Okonkwo", Card "Demographics", all six rows filled; p-0003 Email "—", p-0005 Address "—", p-0007 Phone "—", p-0011 all-null address "—", each dash computed in `rgb(107, 114, 128)` (color.text.muted); p-9999 → Card "Patient not found", no h1, Back present; Back from a patient opened via the list → `/`, Back from not-found → `/`; API stopped → Card "Something went wrong" with Back.
- **Also:** `src/pages/PatientDetailPage.test.tsx`, 5 jsdom tests (loading, full demographics with `—` for email, not-found, error, Back). App suite 27 passed.
- **Decisions taken alone:** Back navigates to `/` rather than history −1, so it "returns to Page 1" even when the detail URL was opened directly; the Back button is present in every state; a transport failure shows "Something went wrong", distinct from not-found, per the contract's error table.

## T-3.5 Page test
- **Verified:** `npm run test --workspace app` — 3 files, 27 passed, including `PatientListPage > renders the table from the list response` (mocked list of two patients; asserts headers and each row's cells).
- **Mutation check:** fed the Table `patient.id` instead of `patient.name` → 4 named list-page tests failed, including the page test; restored, 27 pass.
- **Also:** removed the app's `passWithNoTests`, added in `c7b9c8b` only until this test existed.
- **Note:** the test itself was committed with T-3.3, beside the page it tests (same pattern as T-1.7).

## T-4.2 Project README
- **Verified from a clean clone** (fresh `git clone` in the scratchpad plus this task's three changed files, no `node_modules` in any ancestor): `npm install` → 188 packages; `npm test` → exit 0, ui 36 passed, app 27 passed; `npm run typecheck` → exit 0; `npm run build --workspace app` → built; `npm run api` + `npm run dev` → `/health` ok, `/api/patients` via proxy 200, site loaded in headless Brave: "Patients, 12 rows"; `dotnet run --project api/Intrahealth.Api` from the clone → `/health` ok.
- **Defect found and fixed in this task:** from a clean clone, `npm test` failed the two app page test files (`Failed to resolve entry for package "ui"`): `ui/dist` does not exist until built. The root `test` and `typecheck` scripts now build ui first; README and CLAUDE.md say so. Recorded as INTERVIEW correction 4.
- **Contaminated first attempt:** the first clean check passed typecheck falsely because `scratchpad/node_modules` (a symlink I left from the T-1.2 width check) let tsc resolve `ui` to the original repo's `dist/`. Removed; the second check ruled out ancestor `node_modules`.
- **Files beyond the plan:** `package.json` (root scripts), `CLAUDE.md` (commands).

## T-4.1 Library documentation
- **Verified mechanically, both directions:** a script parsed every props table in `packages/ui/README.md` against each `<Component>Props` interface — 23 props across the five components; no documented prop missing from the code, no code prop missing from the docs; every default matches the destructuring default and every required/optional flag matches the `?`.
- **Examples:** all seven `tsx` blocks outside Contributing pasted verbatim into `packages/app/src` (temporary): `tsc --noEmit` clean under the app's strict config, including the `main.tsx` root; all six example components rendered in jsdom with real text and no "undefined" (the DescriptionList example shows `—`). The Contributing Badge template (tsx, css, test) was written into `packages/ui/src/components`, type-checked and its test passed. All temporary files were removed.
- **Install path:** `npm pack --workspace ui` → tarball installed into a fresh project with React 19; `import { DescriptionList } from 'ui'` rendered, `ui/styles.css` and `dist/index.d.ts` resolved.
- **Documented honestly rather than papered over:** Table renders null cells empty (the known gap from T-3.3); `dev --workspace ui` does not rebuild declarations.

## T-4.3 Interview notes
- **Verified:** each of D-1 to D-16 in `docs/DECISIONS.md` has a row in INTERVIEW.md's decisions table (scripted check, none missing). The four corrections are real and each traces to a commit: toolchain never type-checked (`44bbc19`), loading Button lost its accessible name (`3df9020`), `role="button"` rows broke the table (`5bb7a5c`), `npm test` failed from a clean clone (`0f651a5`). No TODO remains.
- **Covers:** decisions and why, the process and the harness, how the full-auto run worked and what came back to a person (the T-1.2 browser check, the choice of full auto), corrections, plan errors, known gaps, and what two more hours would buy.
- **Stated as a fact in the notes, so checked in T-4.4:** that every commit type-checks and tests on its own. Run 1's commits were checked in isolation; run 2's are checked at the end of this run.

## T-4.4 Delivery check
- **History against the plan:** every task maps to a commit that names it, except T-2.1 (the API contract), which landed in the Phase 0 commit `cecc901` without being named in its message. That exception, the three fix commits and the two status-record commits are now explained under "Reading the history against the plan" in INTERVIEW.md.
- **Harness:** `.claude/skills/` now holds the five workflow skills this was built with (auto-phase, implement-tasks, test-and-fix, commit-task, commit-gate), copied unchanged from the user-level skills after a scan for paths, emails and secrets; `git check-ignore` confirms none is ignored. **Decision taken alone, flagged for the user:** which skills to include, and committing personal skills into this repository at all. The brief requires the `.claude` folder, so this was the safe assumption; revert the one commit to undo it.
- **Every commit in isolation:** run 2's thirteen commits each checked out in a fresh worktree with its own install: ui build, both type-checks and both suites green at every commit (ui 36; app 15 → 22 → 27 once it had tests). The app's empty test run exited 1 at `e406dd7` and `196ea9c`, the known defect fixed in `c7b9c8b`. Run 1's commits were checked the same way earlier.
- **Clean checkout:** fresh clone, no ancestor `node_modules`: `npm install`, `npm test` (36 + 27), `npm run typecheck`, `npm run build`, `npm run build/test/typecheck --workspace ui`, `npm run build/test --workspace app` all exit 0; `npm run api` + `npm run dev` and, separately, `npm run dev --workspace app` each served the site, and a browser walk from the list to Priya Raman showed her missing email as `—`; `dotnet run --project api/Intrahealth.Api` answered `/health`.

## End of run 2 — full pass
- Baseline 36 ui / 0 app. End: **36 ui + 27 app = 63 tests, all passing**, both type-checks clean, library and site builds clean, API builds and serves; the same from a fresh clone.
- **Stopped because the phase plan is complete:** all 26 tasks Done. The plan's close-out is T-4.4 itself (documents current, clean-checkout run, harness committed).

---

# Run 3 — Phase 6, full auto

Baseline before this run: 76 ui + 27 app = 103 tests passing, api 0 tests; typecheck clean; workspace clean at `4ab9ce8` (untracked `.idea/`, `Summary.md` are the user's and stay out of every commit).

Run of 2026-09-28, Phase 6, full auto (commits unreviewed — the user is asleep and said not to ask). Order: T-6.3 first (it unblocks T-6.4 → T-6.5 → T-6.6), then T-6.1, T-6.2, T-6.4, T-6.7, T-6.5, T-6.6. All the documentation tasks edit `packages/ui/README.md`, so they run strictly one after another.

## T-6.3 Component scaffold
- **What:** `packages/ui/scripts/new-component.mjs` behind `npm run new-component --workspace ui -- <Name>` writes the component, its token-only stylesheet, a behaviour test and a story, and appends the export to `src/index.ts`. `index.test.ts` and `stories.test.tsx` now discover components and story files with `import.meta.glob` instead of listing them.
- **Verified:** scaffolded `Scratch`; with it present `npm run typecheck`, `npm test` (80 ui + 27 app), `npm run build --workspace ui` and `build-storybook` (Scratch in the index) all passed. The script refused a duplicate, `badge` and a missing name. `Scratch` removed; `npm test` 78 ui + 27 app, typecheck clean.
- **Mutation check (both rewritten tests edit existing assertions):** with `Scratch` on disk but its export removed, `exports every component … and nothing else` failed; with Card throwing on a title, the WithTitle and WithTitleAndActions story tests failed. Both restored.
- **Slip, caught:** restoring after a first, too-weak mutation (`<Story />` → `<div />`, which still passes because the container is not empty) used `git checkout` on the test file and silently reverted it to the committed, listed version. Caught by reading `git status`; the discovery version was rewritten and re-verified, and the weak mutation replaced with the Card one.
- **Decision taken alone:** the template is a minimal `children`-only component, not a variant example, so it passes every check untouched; the README's Contributing Badge stays the worked example of variants.
- **Plan discrepancy:** also touched `README.md` (the command table) — the task did not list it, but every command must be documented.

## T-6.1 Component state reference
- **What:** a `#### States` table in every component section of `packages/ui/README.md` — how each state is triggered, what it looks like in token names, the story that shows it, and a screenshot. 22 screenshots in `packages/ui/docs/states/`, captured by `npm run capture-states --workspace ui` (`scripts/capture-states.mjs`: serves the built Storybook, applies hover/Tab where the state is an interaction, crops to the component).
- **Time-box:** Brave hung headless in run 1, so Playwright's own Chromium was installed instead (`playwright` dev dependency, `npx playwright install chromium`). It worked first time apart from one locator matching Storybook's hidden error button — scoped to `#storybook-root`.
- **Verified:** scripted check — all 22 image paths exist; all 22 story references match a (component, story name) pair in the built Storybook index; every `--ui-*` token named in the README is defined in `tokens.css` (the one non-match is the pre-existing `--ui-focus-ring-*` wildcard). Each row was written from the component's `.module.css` and `.tsx`, and eight screenshots were opened and looked at (primary/secondary hover, focus rings on button, text field and table row, loading, error) to confirm they show the state they are labelled with.
- **Fixed while writing:** the missing-value row first said "`false`-like content still shows"; React renders `false` as nothing, so the claim was wrong and now reads "`0` is a value and shows as `0`".
- **Plan discrepancy:** also touched `README.md` (command table) and `package.json`/lockfile (Playwright).

## T-6.2 Worked example: a real screen
- **What:** `packages/ui/src/examples/PatientLookup.tsx` — search form in a Card (TextField + submit Button, validation error for under two characters), results Table with clickable rows and an empty message, a failure Card with Try again, and the selected record in a DescriptionList with a Close action. Story `Examples/Patient lookup`. A new README section, second in the contents, prints the full listing, says what to notice, and shows a screenshot. `src/examples` is excluded from the declaration build.
- **Verified:** `PatientLookup.test.tsx` (5 tests: README listing equals the source with `'../index'` → `'ui'`, via Vite `?raw` imports; validation error; search → row → record with `—` for the missing health card; empty; failure with retry) and the story test pass; `tsc --noEmit` clean. The README listing, extracted by script into `packages/app/src` and compiled with the app's `tsc --noEmit` against the built `ui`: exit 0 (first read was `head`'s exit code, re-run without the pipe). Built Storybook driven in Chromium — typed `lo`, searched, clicked Ada Lovelace — screenshot checked and committed as `docs/examples/patient-lookup.png`.
- **Mutation check:** changing one string in the README listing fails the identity test; restored.
- **Decision taken alone:** the example lives in `ui` as a story, not as a third page in `app`, because the brief fixes the site at two pages. It imports from the entry point, so it uses only the public API.

## T-6.4 Extending the library
- **What:** the library README's Contributing section became "Contributing: extending the library" (kept the word Contributing, since the design document names that section as required). It starts from the scaffold command, walks the generated files into a real `Badge` in eight steps (component, tokens-only styles, accessibility, tests, stories, type exports, documentation including capture-states, checks), and ends with "Why adding a component is this short": nine architectural choices, each with what it saves and a line-numbered link to the code. `docs/CONVENTIONS.md` points at the scaffold.
- **Verified — followed literally:** ran `new-component -- Badge`, then a script extracted every listing in the section by its `// src/...` path comment and wrote it to that path (index.ts: the listing replaced the scaffold's two lines). With Badge present: ui typecheck clean, 88 ui tests passed (83 + 2 Badge tests + 2 Badge stories + the example story), library build and build-storybook passed with `components-badge--neutral` and `--danger` in the index. Badge removed, `index.ts` restored: 83 ui tests pass.
- **References:** each of the 15 `file:line` links printed with its target line and read. One was wrong (`new-component.mjs:25` is the duplicate-name check, not the PascalCase one) and was moved to 24.

## T-6.7 Unit tests for `app` and `api`
- **Correction to the T-6.4 entry:** after Badge was removed the ui count is **84**, not 83 (76 + 2 from T-6.3 + 5 example tests + 1 example story).
- **What:** `app` — 20 more tests in `patients.test.ts` (every contract gender capitalised, name join, blank phone, present values kept untrimmed, blank address parts skipped, four unreadable birth dates, December, the payload is not mutated; `fetchPatients`: non-JSON body, empty list is ok not error, 404 on the list is an error; `fetchPatient`: id encoded into the path, network failure, non-JSON body). `api` — new xUnit project `api/Intrahealth.Api.Tests` (23 tests: list, field names and order, blank search, six matching cases including joined name, case, padding and `é`, the full match set for "an", reversed name does not match, no match is 200 `[]`; by id, 404 ProblemDetails with content type and detail, id is case-sensitive, `/health`; seed nulls sent explicitly for p-0003/5/7, partial and all-null addresses, every patient inside the contract). `npm run test:api`; `Program.cs` gains `public partial class Program;`. Recorded as D-18.
- **Verified:** `npm run test --workspace app` 47 passed, app `tsc` clean; `npm run test:api` 23 passed; `npm run api` still serves `/health` and a search.
- **Mutation checks:** joined-name match made case-sensitive → the `"amara oko"` case fails; `presentOrNull` without `trim()` → two mapping tests fail. Both restored.
- **Correction (in INTERVIEW.md, #6):** the "an" test's expected ids were guessed by eye twice and wrong twice (missing Jordan, then Morgan); the API was right both times. The set was then derived by script from `SeedData.cs`.
