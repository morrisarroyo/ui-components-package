# Interview Notes

Everything specific to the exercise lives here. The project README is written
as if the project were real; this file is not.

## Decisions

The full log, with the alternatives considered and what would change each
answer, is [`docs/DECISIONS.md`](./docs/DECISIONS.md). It was written as each
choice was made; this table is assembled from it.

| # | Choice | What | Why, in one line |
| --- | --- | --- | --- |
| D-1 | Repository | One repo, three packages | `app` consumes `ui` as an installed package without publishing or `npm link`. |
| D-2 | Workspace tool | npm workspaces | Ships with Node; three packages have no build graph worth a task runner. |
| D-3 | Styling | CSS Modules | Scoped at build time, no runtime, no framework forced on the consumer. |
| D-4 | Tokens | `--ui-` CSS custom properties on `:root` | Defined once, referenced by name, inspectable, and themeable on purpose. |
| D-5 | Class names | `ui-[local]-[hash]` | The hash prevents collisions; the readable part keeps devtools usable. |
| D-6 | Build | Vite, library mode for `ui`, React external | One toolchain; the app never gets two copies of React. |
| D-7 | Consumption | `app` imports the built `dist`, through `exports` | Makes "no deep imports" enforced by resolution, not by discipline. |
| D-8 | Tests | Vitest + Testing Library, no snapshots | Reuses the Vite pipeline; pushes tests towards behaviour. |
| D-9 | Routing | React Router, two routes | The detail page is addressable by id and Back behaves like history. |
| D-10 | API access | Same-origin `/api`, proxied by the dev server | No CORS, no base URL in client code. |
| D-11 | API shape | A small purpose-built payload, not FHIR | FHIR is not assessed; the payload keeps only the EHR-shaped parts the pages need. |
| D-12 | Formatting | The API returns data, the website composes strings | Keeps the one mapping layer the brief assesses where it can be seen. |
| D-13 | Missing values | Mapping decides *whether*, the component decides *how it looks* | One definition of "missing", one definition of `—`. |
| D-14 | Package names | `ui` and `app` | The brief names them; a real product would scope them. |
| D-15 | Clickable rows | Native row role, not `role="button"` | Keyboard-operable without breaking table navigation for screen readers. |
| D-16 | Birth dates | "2 Mar 1984", read from the string's parts | Unambiguous across locales and immune to timezone day-shifts. |

A few smaller choices were taken inside tasks rather than logged as decisions,
and are recorded in the task log (`AutoPhase.md`): the search is a form so
Enter also searches; Back goes to `/` rather than one step back in history, so
it returns to the list even from a directly opened link; the app's page layout
uses the library's tokens in its own stylesheet and never targets a `ui` class.

## Process and AI usage

**Tools.** Claude Code in the terminal, on Claude Opus.

**How the work was decomposed.** The brief arrived as two files, a markdown
copy and a PDF. They were reconciled first (they turned out to be the same
document; section 0 of `docs/DESIGNDOCUMENT.md`), then turned into a design
document, a set of conventions, an API contract, and a phased task list in
`docs/TASKS.md`: five phases, 26 tasks, each with its dependencies, a done
state, and the specific check that proves it. Those documents were written
before any code, and the commit history follows the task list one task per
commit, so the two can be read side by side.

**The harness.**

| Part | What it does |
| --- | --- |
| `CLAUDE.md` | Working context: what the project is, where the truth lives, the non-negotiable rules, the phases. Read first, every session. |
| `docs/DESIGNDOCUMENT.md` | The reconciled spec. Every token value and prop table, so they are never re-derived from the brief. |
| `docs/TASKS.md` | The work order. Each task has dependencies, a done state and the check that proves it. |
| `docs/CONVENTIONS.md` | House style, so generated code looks like the rest of the repository. |
| `docs/API-CONTRACT.md` | One contract both `app` and `api` are written against. |
| `docs/DECISIONS.md` | Choices recorded as they are made. This file is assembled from it. |
| `AutoPhase.md` | The run log: for every task, what verified it, any decision taken alone, and any place the plan was wrong. |
| `.claude/skills/` | The workflow skills, committed with the project. `auto-phase` drives a phase end to end; it calls `implement-tasks` (take a startable task, stay in scope, write status back), `test-and-fix` (diagnose to root cause, never weaken a test) and `commit-task` (scope the commit to one task, verify it captured what was intended). `commit-gate`, the human diff review, is the step full-auto mode replaces. |

**How the build ran.** Phases 1 to 4 were driven by the `auto-phase` skill in
full-auto mode: pick the startable task that unblocks the most, implement it,
run that task's own check, commit it, move on. It commits without a human
reviewing each diff, which is a deliberate trade, so the safety net is in how
it commits: one task per commit so any task reverts cleanly, every commit
type-checked and tested on its own, a mutation check (break the behaviour,
watch a named test fail, restore) on the tasks that close out test suites, and
a full end-of-run pass compared against a baseline recorded before the run.
The loop stops only for something the agent cannot settle, and it did stop
once, for a manual browser check (below).

**What was delegated, and what was not.** The agent wrote the code, the tests
and the documentation, ran every check, and committed. Two things came back
to a person:

- **A check tooling could not do.** T-1.2 asks for the Button's width to be
  compared in a real browser with `loading` on and off. The agent's headless
  browser would not run, so the loop parked the task, carried on with
  everything that did not depend on it, and handed over a page that printed
  the eight measurements and what would count as a failure. It was confirmed
  by hand — all eight the same — before T-1.2 was closed. The agent did not
  mark it done on the strength of the CSS looking right.
- **Choosing the trade.** Running in full auto, with review after the fact
  rather than before each commit, was a human decision made in advance.

**What had to be checked or corrected.** Recorded as each one happened, not
reconstructed at the end.

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

Two smaller slips were the agent's own measurement errors rather than defects,
and are recorded in `AutoPhase.md` because they are the kind that produce false
results: an end-to-end check that reported every call failing because its
"is the server up yet" test counted the proxy's error page as up, and a
browser read of the Search button taken in the same tick as the click, before
React had applied the update. Both were re-run properly before anything was
concluded from them.

**Reading the history against the plan.** One commit per task, with the task
id in the subject, with these exceptions, each explained in its own message:

- `cecc901` is all of Phase 0 (T-0.1 to T-0.5) and the API contract (T-2.1).
  That work was done before the repository had any history, and its files
  reference each other, so it could not be split after the fact.
- Three commits fix defects rather than complete a task: `44bbc19` (the
  toolchain that never type-checked), `c7b9c8b` (`npm test` failing while
  `app` had no tests), and the script change inside `0f651a5`, the clean-clone
  failure found while verifying the README.
- `e406dd7` and `196ea9c` record the pause for the manual browser check and its
  result. `9c5342e` (T-1.7) and `d64307b` (T-3.5) close tasks whose tests
  had already landed beside the code they test.

**Where the plan itself was wrong.** Recorded rather than silently patched:
T-0.3 was marked done on a check ("the config is internally consistent") that
never ran the compiler; and the component tasks named T-1.7's tests as their
check while T-1.7 depended on them. The tests were written first, used to
verify each component, and committed beside it, which is also where the
conventions put them.

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

- **The API has no automated tests.** Its behaviour is pinned by the
  contract and was checked with curl and end to end through the website, but
  nothing re-runs that on a change.

## What I would do with two more hours

1. **Give Table the same missing-value rule as DescriptionList,** so a missing
   phone shows `—` on the list page too. It is a small library change, but a
   spec change, so it would go through the design document first.
2. **Turn the browser walks into a test suite.** Every page state was walked
   in a real browser against the real API, but by one-off scripts. Playwright
   running the same walks would make them repeatable, including the loading
   Button's width.
3. **Integration tests for the API** with `WebApplicationFactory`: the search
   rules, the 404 body, and nulls serialised as `null`.
4. **An automated accessibility pass** (axe in the component tests), to back
   the manual reasoning behind D-15 and the label and error wiring with a
   tool.
5. **Keep the search when coming Back** from a patient, by putting the search
   term in the list page's URL.
