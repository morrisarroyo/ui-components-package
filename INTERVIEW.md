# Interview Notes

How I built a React component library for healthcare (EHR) screens, an
example website and a mock API: the decisions, the process, and what had to
be corrected. The project README describes the product; this file covers the
exercise.

## Decisions

Each choice, with alternatives, is logged in
[`docs/DECISIONS.md`](./docs/DECISIONS.md).

| # | Choice | Why |
| --- | --- | --- |
| D-1 | One repository, three packages | `app` installs `ui` as a package, with no publishing or `npm link`. |
| D-2 | npm workspaces | Ships with Node; three packages need no task runner. |
| D-3 | CSS Modules | Scoped at build time; no runtime or framework forced on consumers. |
| D-4 | Tokens as `--ui-` CSS custom properties | Defined once, referenced by name, visible in devtools. |
| D-5 | Class names `ui-[local]-[hash]` | No collisions, still readable. |
| D-6 | Vite library build, React external | One toolchain; apps never get two copies of React. |
| D-7 | `app` imports the built `dist` through `exports` | Deep imports fail to resolve, so the rule enforces itself. |
| D-8 | Vitest and Testing Library, no snapshots | Reuses the Vite setup and pushes tests towards behaviour. |
| D-9 | React Router, two routes | Each patient's page has its own address. |
| D-10 | Same-origin `/api`, proxied in development | No CORS and no base URL in client code. |
| D-11 | A small purpose-built payload, not FHIR | FHIR is not assessed; keep only what the pages need. |
| D-12 | The API returns data; the website builds the strings | Keeps the one mapping layer visible. |
| D-13 | The mapping module decides what is missing | DescriptionList draws `—` itself; for Table cells the mapping supplies it. |
| D-14 | Packages named `ui` and `app` | The brief names them. |
| D-15 | Clickable rows keep the native row role | Keyboard use without breaking table navigation for screen readers. |
| D-16 | Birth dates as "2 Mar 1984" | Unambiguous across locales, with no timezone shift. |
| D-17 | Storybook 10 | Every state visible without the API, on the build's own Vite config. |
| D-18 | xUnit against the real API in memory | Tests the JSON on the wire, not the C# record. |
| D-19 | WCAG 2.2 AA; three brief colours swapped for other brief tokens | Three of the brief's pairings fail AA contrast. |

An unknown patient id returns `404` with ASP.NET Core's standard error body,
so the site can tell "not found" from "failed".

## Process

**Tools.** Claude Code in the terminal, on Claude Opus.

**Plan first.** I turned the brief into a design document, conventions, an
API contract and a task list ([`docs/TASKS.md`](./docs/TASKS.md)) before any
code. Each task has its dependencies, a done state and the check that proves
it. Each task is one commit, with its id in the message.

**Harness.** `CLAUDE.md` gives the agent the rules; the skills in
`.claude/skills/` ([explained here](./.claude/README.md)) plan a phase, run
tasks, test and commit. Phases 1–4 and 6 ran in full auto: implement a task,
run its check, commit, move on. That was my decision; I reviewed the work
afterwards against the brief.

**Safety net.** One task per commit, so each reverts cleanly. Where a test
changed, a mutation check: break the code, watch the test fail, restore it.

| Phase | When | What |
| --- | --- | --- |
| 0–4 | 25 Sep | Plan, library, API, website, docs: the submission the brief asks for |
| 5–6 | 28 Sep | Storybook, more tests, worked example, extension guide |
| 7 | 29 Sep | Fixes from a graded review against the brief |
| 8–10 | 29 Sep | Docs site, WCAG 2.2 AA, free hosting on Render |
| 11 | 1 Oct | A README per part, Swagger for the API, a Contributing page |
| 12 | 1 Oct | End-to-end tests of both pages in a real browser |

Phases 5 onwards came after the submission, at my direction.

## What had to be corrected

1. **The toolchain had never type-checked.** Phase 0 was closed because the
   config looked right. The first real compiler run failed three ways. Lesson:
   run the compiler, not just the tests.
2. **The loading Button lost its name.** Hiding the label removed it from
   screen readers. A test caught it; the label is now transparent instead.
3. **Keyboard rows broke the table.** `role="button"` on each row hid the
   table from screen readers. A test caught it (D-15).
4. **`npm test` failed from a clean clone.** The app's tests need the built
   library. The root scripts now build it first.
5. **A test passed but did not type-check.** Vitest skips type checking.
   Lesson 1 again.
6. **A test's expected answer was guessed.** The search test's expected ids
   were worked out by eye, wrongly, twice. They are now computed from the
   seed data.
7. **The docs claimed a check that did not exist.** The README said its props
   tables were tested; nothing tested them. Now a test does.
8. **The review found more (Phase 7).** A blank cell for a missing phone, a
   loading Button that dropped focus, unannounced clickable rows, a fixed API
   port, stale counts. Each was fixed in its own commit.

**Where the history differs from the plan.** The first commit holds all of
Phase 0 and the API contract. A few commits fix defects rather than finish a
task, and two record a pause for a manual browser check.

## Tests

`npm test` and `npm run test:api` run 255 tests across the library, the
website and the API. `npm run test:e2e` runs 14 more: both pages in Chromium
against the real API. What each suite covers: [TESTING.md](./TESTING.md).

## Known gaps

None known against the brief. The four found in review were fixed in T-7.10
to T-7.13.

## With two more hours

1. **Automated accessibility checks** (axe) in the component tests.
2. **A generic Table row type,** so `onRowClick` returns the consumer's own
   type.
3. **Page-level building blocks** (a page title, a status line), which a
   third page would otherwise copy from the app.
