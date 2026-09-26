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
