# Interview Notes

> **Status: in progress.** Written as the work happens, not reconstructed at
> the end (task T-4.3 in `docs/TASKS.md`). Sections marked TODO are not yet
> written.

Everything specific to the exercise lives here. The project README is written
as if the project were real; this file is not.

## Decisions

The full log, with alternatives and reasoning, is in
[`docs/DECISIONS.md`](./docs/DECISIONS.md). The headlines:

| Choice | What | Why, in one line |
| --- | --- | --- |
| Repository | One repo, npm workspaces | `app` consumes `ui` as an installed package without publishing or `npm link`. |
| Styling | CSS Modules + CSS custom properties for tokens | Scoped by build, no runtime, no framework forced on the consumer; tokens stay themeable and inspectable. |
| Build | Vite, library mode for `ui`, React external | One toolchain for both packages; no risk of two copies of React. |
| Tests | Vitest + Testing Library | Reuses the Vite config; pushes tests towards behaviour and accessible queries. |
| Routing | React Router, two routes | The detail page is addressable by id and Back behaves like history. |
| API shape | A small purpose-built payload, not FHIR | FHIR conformance is not assessed; the payload keeps only the EHR-shaped parts the pages need. |
| API access | Same-origin `/api`, proxied by the dev server | No CORS, no base URL in client code. |
| Missing values | Mapping decides *whether*, the component decides *what it looks like* | One definition of "missing", one definition of `—`. |

TODO — expand once the build is finished, and add anything decided along the
way that is not yet in the log.

## Process and AI usage

**Tools.** Claude Code (Opus) in the terminal.

**How the work was decomposed.** The brief arrived as two files — a markdown
copy and a PDF. Both were reconciled first (they turned out to be the same
document; see section 0 of `docs/DESIGNDOCUMENT.md`), then turned into a design
document, a set of conventions, an API contract, and a phased task list with a
done state and a verification check per task. Those documents are the harness:
they are what the agent reads before touching anything, so the specification
does not have to be re-explained each session.

**The harness.**

| File | What it does |
| --- | --- |
| `CLAUDE.md` | Working context: what the project is, where the truth lives, the non-negotiable rules, the phases. Read first, every session. |
| `docs/DESIGNDOCUMENT.md` | The reconciled spec. Every token value and prop table, so they are never re-derived from the brief. |
| `docs/TASKS.md` | The work order. Each task has dependencies, a done state and the check that proves it. |
| `docs/CONVENTIONS.md` | House style, so generated code looks like the rest of the repo. |
| `docs/API-CONTRACT.md` | One contract both `app` and `api` are written against. |
| `docs/DECISIONS.md` | Choices recorded as they are made, which this file is assembled from. |
| `.claude/` | TODO — agent configuration and any skills, committed rather than ignored. |

**What was delegated, and what was not.** TODO.

**What had to be checked or corrected.** Recorded as each one happened.

1. **The generated toolchain had never type-checked.** The Phase 0 config
   was written and marked done on the strength of looking right. The first
   real `tsc` run failed three ways: no type declaration for `*.module.css`
   imports (so the library's declaration build could not emit), a
   `vite.config.ts` using `__dirname` with no Node types installed, and a
   `test` block Vite's own `defineConfig` does not know about. Underneath the
   last one, Vitest 2 had pulled in its own nested Vite 5 while the build ran
   on Vite 6, so the two plugin types could never agree. Fixed at the root:
   a `vite-env.d.ts` for Vite's import types, a relative library entry,
   `defineConfig` from `vitest/config`, and Vitest bumped to 3, which targets
   Vite 6. Lesson: "config exists and is internally consistent" was not a
   check; running the compiler is.
2. **The loading Button lost its accessible name.** The generated Button hid
   its label with `visibility: hidden` while loading, to keep the width
   while showing the spinner. The width part was right, but
   `visibility: hidden` also drops the text from the accessibility tree, so
   a screen reader met a busy button with no name. A behaviour test querying
   `getByRole('button', { name: 'Save' })` on a loading button caught it. The
   label is now `opacity: 0`, which keeps both the width and the name.
3. **Keyboard-accessible rows broke the table.** The generated Table made
   clickable rows keyboard-operable, as the spec asks, but did it with
   `role="button"` on each `<tr>`. That strips the row role, so assistive
   technology no longer saw a table of rows and cells at all. A test asserting
   the table still exposes its rows and cells caught it. The rows now keep
   their native role (decision D-15).
4. **`npm test` passed in the working tree and failed from a clean clone.**
   The app's page tests import `ui` through its built `dist/`, which a fresh
   clone does not have until something builds it. It went unnoticed because
   the working tree always had a `dist/` left over, and the first "clean"
   check was not clean either: a stray `node_modules` symlink above the clone
   let TypeScript quietly resolve `ui` to the original repository's build. Only
   removing it exposed the failure. The root `test` and `typecheck` scripts now
   build `ui` first, as `dev` already did. Lesson: a clean-checkout check has
   to rule out everything above the checkout, not only inside it.

## Time-boxes and known gaps

- **A missing phone is a blank cell on the patient list.** The `—` rule is
  specified for `DescriptionList` only, and D-13 keeps the dash out of the
  mapping layer, so a Table cell whose value is `null` renders empty
  (Samuel Okafor, p-0007). The right fix is in the library — Table rendering
  a missing cell the way DescriptionList does — which is a spec change, not a
  page patch, so it is left as a known gap rather than papered over in `app`.
- **Headless browser checks.** Driving Brave with `--dump-dom` hung in the
  agent's sandbox, so the first in-browser check (Button width while
  loading) went to a human. Driving the same browser over the DevTools
  protocol worked, and the page walks after that were run that way against
  the real API.

## What I would do with two more hours

TODO.
