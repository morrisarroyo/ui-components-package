# Interview Notes

How I built React components for healthcare apps, an example website and a
mock API. Covers the decisions, the process, and what had to be corrected. The
[project README](./README.md) describes the product.

## Decisions

Alternatives for each are in [`docs/DECISIONS.md`](./docs/DECISIONS.md).

| # | Choice | Why |
| --- | --- | --- |
| D-1 | One repository, three packages | `app` installs `ui` without publishing. |
| D-2 | npm workspaces | Ships with Node; no task runner needed. |
| D-3 | CSS Modules | Scoped styles, nothing forced on consumers. |
| D-4 | Tokens as `--ui-` CSS custom properties | Defined once, used by name. |
| D-5 | Class names `ui-[local]-[hash]` | No collisions, still readable. |
| D-6 | Vite library build, React external | Apps never get two copies of React. |
| D-7 | `app` imports the built `dist` through `exports` | Deep imports fail, so the rule enforces itself. |
| D-8 | Vitest and Testing Library, no snapshots | Pushes tests towards behaviour. |
| D-9 | React Router | Each page and patient has its own address. |
| D-10 | Same-origin `/api`, proxied in development | No cross-origin setup, no base URL in code. |
| D-11 | A small payload, not FHIR (the health-data standard) | FHIR is not assessed. |
| D-12 | The API returns data; the website builds the strings | Keeps the one mapping layer visible. |
| D-13 | The mapping module decides what is missing | It supplies `—` for Table cells; DescriptionList draws its own. |
| D-14 | Packages named `ui` and `app` | The brief names them. |
| D-15 | Clickable rows keep the native row role | Keyboard use without breaking screen-reader table navigation. |
| D-16 | Birth dates as "2 Mar 1984" | Clear in any locale, no timezone shift. |
| D-17 | Storybook 10 | Every state visible without the API. |
| D-18 | xUnit against the real API in memory | Tests the JSON the client receives. |
| D-19 | WCAG 2.2 AA accessibility; three brief colours swapped | Three of the brief's colour pairs fail AA contrast. |
| D-20 | One container on Render's free tier | Free static hosts can't run the API. |
| D-21 | Swagger under `/api/swagger` | Works through the existing proxy; mock data has nothing to hide. |
| D-22 | Playwright end-to-end tests against the real API | Real routing, fetches and browser. |
| D-23 | A Register patient page, tracked as GitHub issues | Shows the TextField error and Button loading states. |
| D-24 | CI as Docker builds on GitHub Actions | A failing check fails the build; the same image runs locally. |
| D-25 | Lint that enforces the brief's rules | Raw colours, deep imports and accessibility mistakes fail the build. |

## Process

- **Tools.** Claude Code in the terminal, on Claude Opus.
- **Plan first.** Before any code, I turned the brief into a design document,
  conventions, an API contract and a task list
  ([`docs/TASKS.md`](./docs/TASKS.md)). Each task has a check and is one
  commit.
- **Harness.** `CLAUDE.md` holds the rules; [skills](./.claude/README.md)
  plan, implement, test and commit. I chose to run phases 1–4 and 6 unattended,
  then reviewed the work against the brief.
- **Safety net.** One task per commit, so each reverts cleanly. When a test
  changed, I broke the code to watch it fail.

| Phase | When | What |
| --- | --- | --- |
| 0–4 | 25 Sep | Plan, library, API, website, docs: the brief's submission |
| 5–6 | 28 Sep | Storybook, more tests, worked example, extension guide |
| 7 | 29 Sep | Fixes from a graded review against the brief |
| 8–10 | 29 Sep | Docs site, WCAG 2.2 AA, free hosting on Render |
| 11 | 1 Oct | A README per part, Swagger, a Contributing page |
| 12 | 1 Oct | End-to-end tests in a real browser |
| 13 | 1 Oct | A Register patient page, tracked as GitHub issues |
| 14 | 1 Oct | CI in Docker, a secrets scan, a testing guide, clean-up, lint |

Phases 5 onwards came after submission, at my direction.

## What had to be corrected

1. **The toolchain had never type-checked.** Phase 0 closed because the config
   looked right; the first compiler run failed three ways. Lesson: run the
   compiler too.
2. **The loading Button lost its name.** Hiding the label hid it from screen
   readers. A test caught it; the label is now transparent instead.
3. **Keyboard rows broke the table.** `role="button"` on each row hid the
   table from screen readers. A test caught it (D-15).
4. **`npm test` failed from a clean clone.** The app's tests need the built
   library; the root scripts now build it first.
5. **A test passed but did not type-check.** Vitest skips type checking.
   Lesson 1 again.
6. **A test's expected answer was guessed.** The search test's expected ids
   were wrong twice. They are now computed from the seed data.
7. **The docs claimed a check that did not exist.** The README said its props
   tables were tested; nothing tested them. Now a test does.
8. **The review found more (Phase 7):** a blank cell for a missing phone, a
   loading Button that dropped focus, unannounced clickable rows, a fixed API
   port, stale counts. Each got its own commit.
9. **Docs drifted while several sessions worked at once (1 Oct).** A sanity
   check of every doc against the code found about twenty mismatches. Among
   them: two pages counted where there are three, the wrong primary Button
   border, and a focus ring claimed for TextField that only Button and table
   rows draw. All were fixed in one commit (`774abf6`). Lesson: check the docs
   against the code after parallel work, not only the tests.
10. **A commit script emptied a file.** Staging `docs/TASKS.md` by hand failed
    silently, so `22fb7ba` committed it empty and `90fa843` restored it. Both
    were already pushed, so the history keeps them. Lesson: check each
    commit's diff before pushing.

**Where history differs from the plan.** The first commit holds all of Phase 0
and the API contract. A few commits fix defects instead of finishing a task.
Two record a pause for a manual browser check. Phase 13 commits name GitHub
issues (#2–#6) instead of task ids.

## Tests

`npm run ci` runs every suite. Counts and coverage:
[docs/TESTING.md](./docs/TESTING.md).

## Known gaps

None against the brief. The four found in review were fixed in T-7.10 to
T-7.13. Two small ones remain beyond it:

- The Register form checks "birth date not in the future" against the
  browser's date, the API against Coordinated Universal Time (UTC). Early in the day east of UTC, the API
  refuses today's date; the form shows that error on the field.
- The end-to-end tests open the Register page but don't fill it in; the
  website's tests cover its states with fake responses.

## With two more hours

1. **Automated accessibility checks** (axe) in the component tests.
2. **A generic Table row type,** so `onRowClick` returns the consumer's type.
3. **Page-level building blocks** (page title, status line), which each page
   now builds itself.
