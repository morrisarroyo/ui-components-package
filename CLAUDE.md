# CLAUDE.md — UI Components Package

Working context for building React components that developers use to build
healthcare apps: the screens of an Electronic Health Record (EHR) system.

## What this project is

| Package | Path | What it is |
| --- | --- | --- |
| `ui` | `packages/ui` | The component library. Five components, one entry point. |
| `app` | `packages/app` | The website. Three pages, built only from `ui`. |
| `api` | `api/` | ASP.NET Core mock API serving invented patient data. |

## Where the truth lives

| Question | Document |
| --- | --- |
| What am I building, and to what spec? | `docs/DESIGNDOCUMENT.md` |
| What is the next piece of work? | `docs/TASKS.md` |
| What shape are the API and its payloads? | `docs/API-CONTRACT.md` |
| Why was it done this way? | `docs/DECISIONS.md` |
| How do I write code that fits here? | `docs/CONVENTIONS.md` |
| How does a consumer use the library? | `packages/ui/README.md` |

**The brief is the source of truth.** It is the employer's document, kept in
the repository root but not committed. If the design document disagrees with
it, fix the design document.

## Rules that are not negotiable

From the brief; the work is assessed on them.

1. **`app` consumes `ui` as a package.** It imports from the `ui` entry point
   only, never from `ui/src`, and never overrides a `ui` style.
2. **`ui` components never take a colour or a pixel value as a prop.** The
   consumer picks a variant or a size; the library owns the look.
3. **Every value in the token sheet is defined once**, in
   `packages/ui/src/tokens.css`. Component styles use the token names, never a
   raw colour, spacing or font size.
4. **States are the component's job**, not the page's: hover, focus, error,
   loading and disabled.
5. **Accessible by default.** Labels belong to their inputs, anything
   clickable works from the keyboard, and disabled means disabled, not only
   greyed out.
6. **The documentation must match the code exactly.** No undocumented props,
   no documented props that don't exist. A prop change updates the props table
   in `packages/ui/README.md` in the same commit.
7. **One mapping layer.** One module in `app` turns API data into display
   values, and it handles missing fields.

## Phases

Each phase is split into tasks in `docs/TASKS.md`, each with its own check.

### Phase 0 — Repository and toolchain

npm workspaces, the three package skeletons, and the project documents.

**Done when:** `npm install` succeeds at the root, each package has a
documented command, and the docs in the table above exist.

### Phase 1 — The component library

Button, TextField, Card, Table and DescriptionList, to section 3 of the design
document.

**Done when:** all five components are exported from the single entry point.
Their behaviours work, not only their styles. The tests pass, and
`npm run build --workspace ui` produces a consumable package.

### Phase 2 — The mock API

Invented patient data from memory, to `docs/API-CONTRACT.md`. No database, no
login.

**Done when:** `dotnet run --project api/Intrahealth.Api` serves every endpoint
in the contract, including search and not-found. Some seed patients have
missing fields, so the `—` path can be tested.

### Phase 3 — The website

Patient list and detail pages, built only from `ui`.

**Done when:** against the real API, both pages behave as section 5 of the
design document says. That covers loading, search, no results, API failure,
row navigation, missing values and patient not found.

### Phase 4 — Documentation and delivery

The library docs (graded Part 2), the project README and the interview notes.

**Done when:**

- a developer could build a third page from `packages/ui/README.md` alone;
- every documented prop exists and every prop is documented;
- each package's documented command works from a clean checkout;
- `INTERVIEW.md` records the decisions, the process and at least one
  correction.

### Phase 5 — Library additions

Storybook examples and more behaviour tests.

**Done when:** `npm run storybook` shows every component in every state. A test
keeps the stories rendering. A behaviour test covers each prop and state, and
fails when the behaviour breaks.

### Phase 6 — Documentation depth, extension and project tests

Deeper library docs, an extension guide with a component scaffold, and tests
for `app` and `api`.

**Done when:**

- each state of each component says how it is triggered and what it looks
  like;
- the worked example renders and matches its listing;
- a scaffolded component passes every check untouched;
- every code reference in the docs resolves;
- `npm test` and `npm run test:api` pass.

### Phase 7 — Fixes from the review against the brief

Fixes from a graded review against the brief, such as "—" on Page 1 and a
loading Button that keeps focus.

**Done when:** every Phase 7 task in `docs/TASKS.md` is Done or blocked only
on the owner.

### Phase 8 — Component documentation site

A Storybook page per component plus the tokens, styled after Material UI.

**Done when:** `npm run build-storybook --workspace ui` produces them as a
static HTML site.

### Phase 9 — Accessibility to WCAG 2.2 AA

The components meet the Web Content Accessibility Guidelines (WCAG) 2.2 at
level AA.

**Done when:** every Phase 9 task in `docs/TASKS.md` is Done.

### Phase 10 — Hosting

Website, API and docs hosted free at one public address.

**Done when:** the public address serves the website at `/`, the API at
`/api` and the docs at `/docs`.

### Phase 11 — READMEs, Swagger and contributing

A README per part, Swagger docs for the API, and a Contributing page.

**Done when:** every Phase 11 task in `docs/TASKS.md` is Done.

### Phase 12 — End-to-end tests

Both pages tested in a real browser against the running API.

**Done when:** every Phase 12 task in `docs/TASKS.md` is Done.

### Phase 13 — Register patient page

A form that registers a patient through `POST /api/patients`. Tracked in
GitHub issue #1, not `docs/TASKS.md`.

**Done when:** issue #1 and its tasks are closed.

### Phase 14 — CI, secrets, testing guide and clean-up

Continuous integration (CI) in Docker, a secrets scan, a testing guide, and a
tidy repository.

**Done when:** every Phase 14 task in `docs/TASKS.md` is Done.

## Working agreements

- **Follow `docs/CONVENTIONS.md`** for code, and the repository layout in
  `README.md` for where files go.
- **One task, one commit,** saying what changed and why. Reviewers compare
  the history with `docs/TASKS.md`.
- **Verify before claiming done.** Run the task's check.
- **Record decisions as you make them** in `docs/DECISIONS.md`.
- **Record corrections as they happen** in `INTERVIEW.md`; the brief asks for
  them.
- **Time-box anything that fights back,** note it in `INTERVIEW.md`, and move
  on.
- **Stay in scope.** Section 9 of the design document lists what is not
  assessed.

## Commands

```bash
npm install                          # once, at the root — installs both workspaces
npm run build --workspace ui         # build the library
npm test                             # build ui, then every workspace's tests
npm run test  --workspace ui         # library tests only
npm run dev                          # build ui, then start the website on :5173
npm run api                          # start the mock API on :5080 (Swagger at /api/swagger)
npm run storybook                    # browse the ui components on :6006
npm run test:api                     # the mock API's xUnit tests
npm run lint                         # ESLint, Stylelint and dotnet format
npm run test:e2e                     # both pages in Chromium against the real API
npm run ci                           # every check and build, as CI runs it
npm run ci:docker                    # the same, inside Docker (Dockerfile.ci)
```

The website forwards `/api` to the mock API, so both must run.
