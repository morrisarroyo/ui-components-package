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
- **Verified:** `Button.test.tsx` (10 tests: all four variant × size combinations click through, variants render distinct, Enter activates, default `type="button"`, disabled is `disabled` and swallows clicks, loading swallows clicks, loading keeps its accessible name with `aria-busy`, loading is out of the tab order) — passed; `tsc --noEmit` clean. Full suite not yet run.
- **Fixed during verification:** the loading label used `visibility: hidden`, which removed the button's accessible name; now `opacity: 0`. Literal pixel values (1px border, 14px spinner) now carry the why-no-token comment the conventions require.
- **Parked (manual checkpoint):** "check in a browser that the width is identical with `loading` on and off". Headless Brave hung under three flag sets in this environment, so this was not run. Status left In progress, which also holds T-1.7 and T-1.8 behind it.
- **Plan discrepancy:** T-1.2–T-1.6 name T-1.7's tests as their check while T-1.7 depends on them. Tests were written first, used to verify each component, and committed with their component (the conventions' "three files, one folder"). T-1.7 is left as the task that confirms the full listed set, not the one that adds it.

## T-1.3 TextField
- **Verified:** `TextField.test.tsx` (8 tests: label association via `getByLabelText`, clicking the label focuses the input, two fields get distinct ids, onChange receives the typed value, helper text is the input's accessible description, a non-empty error replaces the helper text and is announced as an alert with `aria-invalid`, an empty `errorMessage` is not an error, disabled is `disabled` and ignores typing) — passed. Full suite not yet run.
