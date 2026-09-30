# Interview Notes

Everything specific to the exercise. The project README is written as if the
project were real; this file is not.

## Decisions

The full log, with alternatives and what would change each answer, is
[`docs/DECISIONS.md`](./docs/DECISIONS.md), written as each choice was made.

| # | Choice | What | Why, in one line |
| --- | --- | --- | --- |
| D-1 | Repository | One repo, three packages | `app` consumes `ui` as an installed package without publishing or `npm link`. |
| D-2 | Workspace tool | npm workspaces | Ships with Node; three packages need no task runner. |
| D-3 | Styling | CSS Modules | Scoped at build time, no runtime, no framework forced on the consumer. |
| D-4 | Tokens | `--ui-` CSS custom properties on `:root` | Defined once, referenced by name, inspectable. |
| D-5 | Class names | `ui-[local]-[hash]` | No collisions; still readable in devtools. |
| D-6 | Build | Vite library mode, React external | One toolchain; the app never gets two copies of React. |
| D-7 | Consumption | `app` imports the built `dist` through `exports` | "No deep imports" is enforced by resolution, not discipline. |
| D-8 | Tests | Vitest + Testing Library, no snapshots | Reuses the Vite pipeline; pushes tests towards behaviour. |
| D-9 | Routing | React Router, two routes | The detail page is addressable by id. |
| D-10 | API access | Same-origin `/api`, proxied by the dev server | No CORS, no base URL in client code. |
| D-11 | API shape | A small purpose-built payload, not FHIR | FHIR is not assessed; keep only what the pages need. |
| — | Endpoints | `GET /api/patients?search=`, `GET /api/patients/{id}` | Search is a filter on the list, not a separate resource; an unknown id is `404` with ASP.NET Core's standard `ProblemDetails`, so the site can tell "not found" from "failed". |
| D-12 | Formatting | The API returns data, the website composes strings | Keeps the one mapping layer visible. |
| D-13 | Missing values | The mapping module decides what is missing and how it reaches the screen | DescriptionList draws `—` itself; for Table cells the mapping spells it out (amended in T-7.2). |
| D-14 | Package names | `ui` and `app` | The brief names them. |
| D-15 | Clickable rows | Native row role, not `role="button"` | Keyboard-operable without breaking table navigation. |
| D-16 | Birth dates | "2 Mar 1984", from the string's parts | Unambiguous across locales, no timezone day-shift. |
| D-17 | Stories | Storybook 10, `@storybook/react-vite` | Every state visible without the API; same Vite config as the build. |
| D-18 | API tests | xUnit, real `Program` in memory via `WebApplicationFactory` | Tests the wire shape, not the C# record. |
| D-19 | Accessibility | WCAG 2.2 AA; three brief colours swapped for other brief tokens | The brief's table header text, input border and focus ring fail AA contrast; the token values stay. |

Smaller choices taken inside tasks are in `AutoPhase.md`: the search is a form,
so Enter also searches; Back goes to `/`, so it works from a directly opened
link; the app's layout CSS uses the library's tokens and never targets a `ui`
class.

## Process and AI usage

**Tools.** Claude Code in the terminal, on Claude Opus.

**Timeline.** Phases 0–4 are the submission the brief asks for. Phases 5–7
came after it, at my direction.

| Phase | When (agent wall clock) | What |
| --- | --- | --- |
| 0–4 | 25 Sep, 17:37–19:16 | Plan, library, API, website, docs, delivery check |
| 5 | 28 Sep, afternoon (two commits, 16:06–16:07) | Storybook; more component tests |
| 6 | 28 Sep, 20:30–21:32, unattended | State screenshots, worked example, scaffold, extension guide, code references, three doc clarity passes, `app` and `api` tests |
| 7 | 29 Sep | Fixes from a review of the whole project against the brief |

**Decomposition.** The brief (a markdown copy and a PDF, reconciled first) was
turned into a design document, conventions, an API contract and a task list,
`docs/TASKS.md`: 8 phases and 44 tasks, each with dependencies, a done state
and the check that proves it. The documents came before the code. The Phase 1
components were drafted together and then verified and committed one task at
a time, which is why those five commits are seconds apart.

**The harness.** `CLAUDE.md` (context and rules, read first), the documents in
`docs/`, `AutoPhase.md` (the run log: what verified each task, decisions taken
alone, where the plan was wrong) and the skills in `.claude/skills/`, explained
in [`.claude/README.md`](./.claude/README.md). `phase-tasks` is the planning
skill (Phases 6 and 7 were planned directly in conversation); `auto-phase`
ran Phases 1–4 and 6 in full auto: implement one task, run
its own check, commit it, move on. The safety net is how it commits: one task
per commit, so each reverts cleanly; a mutation check (break it, watch a named
test fail, restore) where tests are edited; a full pass against a recorded
baseline at the end.

**What came back to a person.** The loop stops only for what it cannot settle:
- Button's width with `loading` on and off had to be compared in a real
  browser, and the headless browser would not run. The task was parked, the
  eight measurements confirmed by hand (all equal), then closed.
- Running in full auto, reviewed after the fact rather than before each
  commit, was my decision. Phase 6 ran while I was asleep; it was then
  reviewed against the brief (four areas, graded), and the fixes are Phase 7.

**What had to be checked or corrected.**

1. **The toolchain had never type-checked.** Phase 0 was marked done because
   the config looked consistent. The first real `tsc` run failed three ways,
   underneath which Vitest 2 had nested its own Vite 5 against the build's
   Vite 6. Fixed at the root (Vite import types, `defineConfig` from
   `vitest/config`, Vitest 3). Lesson: run the compiler.
2. **The loading Button lost its accessible name.** `visibility: hidden` kept
   the width but removed the label from the accessibility tree. A test
   querying the button by name while loading caught it; the label is now
   `opacity: 0`.
3. **Keyboard rows broke the table.** `role="button"` on each `<tr>` stripped
   the row role, so screen readers lost the table. A test caught it; rows keep
   their native role (D-15).
4. **`npm test` failed from a clean clone.** The app's tests import `ui` from
   `dist/`, which a fresh clone lacks, and a stray `node_modules` symlink above
   the first "clean" clone hid it. The root scripts now build `ui` first.
5. **A test passed and did not type-check.** Vitest strips types, so the
   story test ran green while `tsc` rejected it. Lesson 1 again.
6. **A test's expected answer was guessed, twice.** The API search test's
   expected ids were worked out by eye from the seed data and were wrong
   twice; the API was right. The set is now computed from `SeedData.cs`.
7. **The docs claimed a check that did not exist.** The library README said
   its props tables were checked against the code; no test did it. The claim
   was made true: `src/readme.test.ts` now compares every props table with
   its interface and defaults.
8. **The review found more (Phase 7).** A missing phone showed as a blank cell
   on the list; a loading Button dropped keyboard focus; clickable rows were
   never announced as clickable; the API port could not be overridden;
   process documents (this one included) had stale counts. Each is fixed in
   its own Phase 7 commit.

**Reading the history against the plan.** One commit per task, with the task
id in the subject, except:
- `cecc901` holds all of Phase 0 and the API contract (T-2.1), though its
  message names only T-0.1 to T-0.5. That work predates the repository.
- `44bbc19`, `c7b9c8b`, `f504ef8` and the script change in `0f651a5` fix
  defects rather than complete a task.
- `e406dd7` and `196ea9c` record the pause for the manual browser check.
- `4ab9ce8` and `36afea8` plan Phases 6 and 7; Phase 5's two tasks were added
  in their first commit.

**Where the plan was wrong.** T-0.3 was closed on a check that never ran the
compiler, and the component tasks named T-1.7's tests as their check while
T-1.7 depended on them.

**Tests** (`npm test`, `npm run test:api`):

| Suite | Tests | What they are |
| --- | --- | --- |
| `ui` components | 64 | Behaviour: roles, labels, keyboard, disabled, loading, error, empty, `—` |
| `ui` worked example | 5 | 4 behaviour, 1 keeps the README listing identical to the source |
| `ui` entry point | 2 | Every component is exported, nothing else |
| `ui` stories | 19 | Smoke: every story renders |
| `ui` README | 81 | Documentation checks: code links, contents, props tables |
| `app` | 54 | The mapping module, both pages in every state, and moving between them |
| `api` | 23 | Every endpoint, search rules, 404 body, wire shape |

## Known gaps

The review's four gaps (rows not announced as clickable, the empty message
before any search, the tab title, Back losing the search) were fixed in
T-7.10 to T-7.13. None is known to remain against the brief.

## What I would do with two more hours

1. **Turn the browser walks into Playwright tests.** Every page state has been
   walked in Chromium against the real API, but by one-off scripts.
2. **An automated accessibility pass** (axe in the component tests).
3. **A generic Table row type,** so `onRowClick` returns the consumer's own
   row type and the id needs no runtime check.
4. **Page-level building blocks** (a page title and a status line): the app
   styles its `<h1>` and "Loading…" itself, and a third page would copy that.
