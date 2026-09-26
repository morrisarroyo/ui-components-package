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
