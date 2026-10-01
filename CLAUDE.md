# CLAUDE.md — UI Components Package

Working context for agents and humans. Read this first, then the document it
points at for whatever you are about to touch.

## What this project is

A React + TypeScript UI components package for an EHR product suite, proven
by a small website that consumes it and a C# mock API that feeds it. Three packages in one
repository:

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

`docs/DESIGNDOCUMENT.md` is the reconciled design input, derived from the
candidate brief in the repository root (kept on disk, not committed: it is
the employer's document). **The brief is the source of truth for
requirements; do not contradict it.** If the design document and the brief ever
disagree, the brief wins and the design document gets fixed.

## Rules that are not negotiable

These come straight from the brief and are what the work is assessed on.

1. **`app` consumes `ui` as a package.** Imports come from the `ui` entry point
   only. No deep imports into `ui/src`, no relative paths into the library, and
   `app` never overrides a `ui` style.
2. **`ui` components never take a colour or a pixel value as a prop.** The
   consumer picks a variant or a size; the library owns the appearance.
3. **Every value in the token sheet is defined once**, in
   `packages/ui/src/tokens.css`, and referenced by custom property name. No
   hard-coded hex, spacing or font size in a component stylesheet.
4. **States are the component's job**, not the page's: hover, focus, error,
   loading and disabled all live inside the component.
5. **Accessible by default.** Labels are associated with inputs, anything
   clickable works from the keyboard, and disabled things are genuinely
   disabled rather than styled to look it.
6. **The documentation must match the code exactly.** An undocumented prop and
   a documented prop that does not exist are equally wrong. When a prop
   changes, the props table in `packages/ui/README.md` changes in the same
   commit.
7. **One mapping layer.** The translation from API payload to display values
   lives in exactly one module in `app`, and it is what handles missing fields.

## Phases

Work proceeds in phases. Each phase is broken into tasks in `docs/TASKS.md`,
where each task has its own done state and its own verification check.

### Phase 0 — Repository and toolchain

Stand up the monorepo so every later phase has somewhere to land: npm
workspaces at the root, the `ui` and `app` package skeletons with their build
and test configuration, the `api` project, and the project documents.

**Done when:** `npm install` succeeds at the root, each package has a
documented command, and the docs in the table above exist.

### Phase 1 — The component library

Build the five components — Button, TextField, Card, Table, DescriptionList —
against section 3 of the design document. Tokens first, then components, then
behaviour tests, then the library build that `app` will consume.

**Done when:** all five components are exported from the single entry point,
their specified behaviours are implemented rather than only styled, the tests
pass, and `npm run build --workspace ui` produces a consumable package.

### Phase 2 — The mock API

An ASP.NET Core project serving invented patient data from memory, to the
contract in `docs/API-CONTRACT.md`. No database, no authentication.

**Done when:** `dotnet run --project api/Intrahealth.Api` serves every endpoint
in the contract, including the search filter and the not-found case, and the
seed data includes patients with missing fields so the `—` path is exercisable.

### Phase 3 — The website

The patient list and patient detail pages, built only from `ui` components and
plain layout markup, reading from the running API through one mapping layer.

**Done when:** both pages behave exactly as section 5 of the design document
describes — loading, search, empty results, API failure, row navigation,
missing values and patient-not-found — against the real API.

### Phase 4 — Documentation and delivery

The library documentation in `packages/ui/README.md` (the graded Part 2), the
project README, and the interview notes.

**Done when:** a developer could build a third page from `packages/ui/README.md`
alone, every documented prop exists and every existing prop is documented, each
package's documented command has been run and works from a clean checkout, and
`INTERVIEW.md` records the decisions, the process and at least one thing that
had to be corrected.

### Phase 5 — Library additions

Work on `ui` after delivery: Storybook as a browsable set of usage examples,
and behaviour tests that close the gaps in the component test suite.

**Done when:** `npm run storybook` shows every component in every state, the
stories are kept rendering by a test, and each component's props and states
are covered by a behaviour test that fails when the behaviour breaks.

### Phase 6 — Documentation depth, extension and project tests

The library documentation grows from a props reference into something a
developer can build from: what every state looks like, a worked example of a
real screen, an extension guide backed by a component scaffold, a clearer
layout that links into the code by line, and three clarity passes. `app` and
`api` get unit tests of their own.

**Done when:** each state of each component is documented with how it is
triggered and what it looks like, the worked example renders and matches its
listing, a scaffolded component passes every check untouched, every code
reference in the docs resolves, and `npm test` and `npm run test:api` pass.

### Phase 7 — Fixes from the review against the brief

Fixes the owner accepted after a four-area review graded the project against
the brief: concise docs, "—" on Page 1, a loading Button that keeps focus, a
configurable API port, the harness explained, the repository ready to share,
and a process record that matches the repository.

**Done when:** every Phase 7 task in `docs/TASKS.md` is Done or blocked only
on the owner.

### Phase 8 — Component documentation site

Storybook docs pages, one per component plus the design tokens, in the style
of Material UI's component pages and limited to the design requirements.

**Done when:** `npm run build-storybook --workspace ui` produces them as a
static HTML site.

### Phase 9 — Accessibility to WCAG 2.2 AA

The components meet the W3C accessibility standard (WCAG 2.2, level AA), and
the docs say so.

**Done when:** every Phase 9 task in `docs/TASKS.md` is Done.

### Phase 10 — Hosting

The website, the API and the component docs hosted for free at one public
address, so a reviewer can use them without cloning the repository.

**Done when:** the public address serves the website at `/`, the API at
`/api` and the docs at `/docs`.

### Phase 11 — READMEs, Swagger and contributing

A README with a quick start for each part, linked from the project README;
Swagger docs for the API; concise interview notes; and a Contributing page on
the docs site about adding a new component.

**Done when:** every Phase 11 task in `docs/TASKS.md` is Done.

### Phase 13 — Register patient page

A third page: a form that registers a patient through a new
`POST /api/patients`. Tracked as GitHub issues, not in `docs/TASKS.md`: #1
lists the tasks.

**Done when:** issue #1 and its tasks are closed.

## Working agreements

- **Follow `docs/CONVENTIONS.md`** for file layout, naming, styling and tests.
- **One task, one commit.** The commit history is assessed against
  `docs/TASKS.md`, so the two must tell the same story. Commit messages say what
  changed and why, not "wip".
- **Verify before claiming done.** Each task in `docs/TASKS.md` carries a
  verification check; run it. Do not report a task complete on the strength of
  the code looking right.
- **Record decisions as they are made,** in `docs/DECISIONS.md`, while the
  reasoning is fresh. `INTERVIEW.md` is assembled from that log, not
  reconstructed from memory at the end.
- **Record corrections as they happen.** When something generated is wrong and
  gets fixed, that goes in `INTERVIEW.md` — the brief asks for it explicitly.
- **Time-box anything that fights back,** note it in `INTERVIEW.md`, and move
  on. Scope is small on purpose.
- **Do not build what is out of scope.** Section 9 of the design document lists
  what is explicitly not assessed; work spent there is work taken from what is.

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
```

The website's dev server proxies `/api` to the mock API, so both need to be
running to use the site.
