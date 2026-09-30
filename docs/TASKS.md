# Tasks

The work order for this project. Tasks are grouped by the phases in
`CLAUDE.md`. Each task is small enough to implement and verify on its own, and
carries:

- **Depends on** — what must be finished first. Nothing else blocks it.
- **Status** — `Not started`, `In progress`, `Blocked` or `Done`.
- **Done when** — the observable done state, not "the code is written".
- **Verify** — the specific check that proves it. Run it before marking Done.

One task, one commit. The commit history and this file must tell the same
story.

**Status summary:** Phases 0–6 complete. Phase 7 (fixes from the review
against the brief) in progress. Phases 5–7 came after the original delivery
(Phase 4). The run log with the evidence for each task is `AutoPhase.md`.

---

## Phase 0 — Repository and toolchain

### T-0.1 Reconcile the brief and write the design document
- **Depends on:** nothing
- **Status:** Done
- **Done when:** the markdown brief and the PDF have been compared, any
  discrepancy is resolved and recorded, and `docs/DESIGNDOCUMENT.md` holds the
  reconciled spec: tokens, five component specs, page specs, deliverables,
  assessment areas and out-of-scope list.
- **Verify:** every token value and every prop row in the design document
  matches the brief; section 0 records the outcome of the comparison.

### T-0.2 Monorepo skeleton
- **Depends on:** nothing
- **Status:** Done
- **Done when:** git is initialised, the root `package.json` declares the
  `packages/ui` and `packages/app` workspaces, `.gitignore` covers Node and
  .NET build output, and `npm install` resolves both workspaces with `ui`
  linked into `app`.
- **Verify:** `npm install` exits 0 and `ls node_modules/ui` resolves to the
  workspace package.

### T-0.3 Library build and test configuration
- **Depends on:** T-0.2
- **Status:** Done
- **Done when:** `packages/ui` has a Vite library build emitting an ES module
  plus a single stylesheet, TypeScript declaration output, CSS Modules with a
  scoped `ui-` class prefix, and Vitest configured against jsdom.
- **Verify:** the config files exist and are internally consistent; proven for
  real by T-1.8.

### T-0.4 Website build configuration
- **Depends on:** T-0.2
- **Status:** Done
- **Done when:** `packages/app` has a Vite React + TypeScript setup, an
  `index.html` entry, and a dev-server proxy forwarding `/api` to the mock API
  so the client needs no environment-specific base URL.
- **Verify:** proven for real by T-3.1 (`npm run dev` serves the app).

### T-0.5 Project documents
- **Depends on:** T-0.1
- **Status:** Done
- **Done when:** `CLAUDE.md`, `docs/TASKS.md`, `docs/API-CONTRACT.md`,
  `docs/DECISIONS.md` and `docs/CONVENTIONS.md` exist, and the deliverable docs
  (`README.md`, `INTERVIEW.md`, `packages/ui/README.md`) exist as skeletons to
  be filled in as the work lands.
- **Verify:** every document referenced from the table in `CLAUDE.md` resolves.

---

## Phase 1 — The component library

### T-1.1 Design tokens
- **Depends on:** T-0.3
- **Status:** Done
- **Done when:** every colour, spacing, radius and typography value from the
  token sheet is defined once in `packages/ui/src/tokens.css` as a `--ui-`
  custom property, plus the shared focus-ring values, and the stylesheet is
  imported by the package entry point.
- **Verify:** each of the 24 token-sheet rows appears exactly once in
  `tokens.css` with the value the design document states.

### T-1.2 Button
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** `variant` and `size` are union-typed; the primary and
  secondary palettes and both size paddings come from tokens; a loading button
  shows a spinner in place of its label **without changing width** and cannot
  be activated; a disabled button uses the disabled palette and cannot be
  activated; focus shows the 2px ring at 2px offset.
- **Verify:** T-1.7 tests cover variants, disabled and loading; check in a
  browser that the width is identical with `loading` on and off.

### T-1.3 TextField
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** the label is programmatically associated with the input; the
  error state triggers on a non-empty `errorMessage`, turns the border
  color.danger and **replaces** the helper text; the helper text shows
  otherwise; disabled uses the disabled palette; focus turns the border
  color.primary and shows the focus ring.
- **Verify:** T-1.7 tests cover the error state and label association; clicking
  the label focuses the input.

### T-1.4 Card
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** surface background, border, radius.md and space.6 padding come
  from tokens; the title renders in font.heading with actions right-aligned on
  the same row and space.4 below it; the header row is omitted entirely when
  neither `title` nor `actions` is given.
- **Verify:** render with title only, actions only, both, and neither.

### T-1.5 Table
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** the header row uses font.label on the subtle surface; body
  cells use the specified padding and bottom border; hover highlighting and the
  pointer cursor appear **only** when `onRowClick` is set; clickable rows are
  reachable and activatable from the keyboard; the empty state centres
  `emptyMessage` (default `"No results"`) with space.8 vertical padding.
- **Verify:** T-1.7 covers the empty state and row click; tab to a row and
  press Enter.

### T-1.6 DescriptionList
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** each row has a 160px fixed-width label in font.label and a
  value in font.body; rows carry a bottom border except the last; a value that
  is empty, `null` or `undefined` renders as an em dash in color.text.muted.
- **Verify:** T-1.7 covers the em-dash path for all three empty kinds.

### T-1.7 Component behaviour tests
- **Depends on:** T-1.2, T-1.3, T-1.4, T-1.5, T-1.6
- **Status:** Done
- **Done when:** Vitest + Testing Library tests cover, at minimum: Button
  variants and disabled state, Button not firing `onClick` while loading,
  TextField error state replacing helper text, TextField label association,
  Table empty state and row click, and DescriptionList rendering `—` for a
  missing value. Tests assert behaviour, not snapshots.
- **Verify:** `npm run test --workspace ui` passes with every listed case
  present.

### T-1.8 Library build
- **Depends on:** T-1.7
- **Status:** Done
- **Done when:** `npm run build --workspace ui` emits `dist/ui.js`,
  `dist/ui.css` and `dist/index.d.ts`; React is external rather than bundled;
  the package `exports` map serves the entry point and `ui/styles.css`.
- **Verify:** `npm run build --workspace ui` exits 0 and all three files exist
  in `packages/ui/dist`; `grep` confirms React is not inlined into `ui.js`.

---

## Phase 2 — The mock API

### T-2.1 API contract
- **Depends on:** T-0.1
- **Status:** Done
- **Done when:** `docs/API-CONTRACT.md` specifies the endpoints, the patient
  payload, the search behaviour, status codes and error shape that `app` and
  `api` are both written against.
- **Verify:** every field the two pages display appears in the contract, and
  every optional field is marked as such.

### T-2.2 ASP.NET Core project
- **Depends on:** T-0.2
- **Status:** Done
- **Done when:** `api/Intrahealth.Api` is an ASP.NET Core project that starts on
  a fixed port matching the website's dev proxy.
- **Verify:** `dotnet run --project api/Intrahealth.Api` starts and responds on
  the health or root route.

### T-2.3 Seed data
- **Depends on:** T-2.2
- **Status:** Done
- **Done when:** an in-memory set of invented patients exists, large enough for
  search to be meaningful, **including at least one patient missing an optional
  field** so the `—` path on Page 2 is exercisable.
- **Verify:** the seed list contains a patient with no email and a patient with
  no address.

### T-2.4 Endpoints
- **Depends on:** T-2.1, T-2.3
- **Status:** Done
- **Done when:** the list endpoint returns all patients and filters by partial
  name match, case-insensitively, when the search parameter is supplied; the
  detail endpoint returns one patient by id and a 404 for an unknown id.
- **Verify:** `curl` each case against the running API — full list, a search
  that matches, a search that matches nothing, a known id, an unknown id.

---

## Phase 3 — The website

### T-3.1 App shell and routing
- **Depends on:** T-0.4, T-1.8
- **Status:** Done
- **Done when:** `app` renders through a router with a route for the patient
  list and one for a patient by id, imports `ui` and `ui/styles.css` by package
  name only, and overrides no `ui` styles.
- **Verify:** `npm run dev` serves both routes; `grep` finds no import from
  `ui/src` or a relative path into the library anywhere in `packages/app/src`.

### T-3.2 API client and display mapping
- **Depends on:** T-2.4, T-3.1
- **Status:** Done
- **Done when:** one module holds the typed calls to both endpoints and the
  single mapping from API payload to display values, including how missing
  fields are represented; no page formats an API field itself.
- **Verify:** the mapping module is the only place in `app` that reads an API
  field name.

### T-3.3 Patient list page
- **Depends on:** T-3.2
- **Status:** Done
- **Done when:** the page is titled "Patients"; a Card holds the search field
  and Search button; a Table shows Name, Gender, Birth date, Phone; "Loading…"
  shows in place of the Table on first load; clicking Search filters the list
  and shows the button's loading state while it runs; no matches shows "No
  patients match your search"; an unreachable API shows a Card titled
  "Something went wrong" instead of the Table; clicking a row opens the detail
  page.
- **Verify:** walk all six states against the running API, stopping the API to
  check the error state.

### T-3.4 Patient detail page
- **Depends on:** T-3.2
- **Status:** Done
- **Done when:** a Back button returns to the list; the page is titled with the
  patient's full name; a Card titled "Demographics" holds a DescriptionList of
  Name, Gender, Birth date, Phone, Email, Address; "Loading…" shows while the
  patient loads; a missing value shows as `—`; an unknown id shows a Card
  titled "Patient not found" with the Back button still present.
- **Verify:** visit a complete patient, the patient missing an email, and a
  made-up id.

### T-3.5 Page test
- **Depends on:** T-3.3
- **Status:** Done
- **Done when:** a test renders the patient list page against a mocked list
  response and asserts the Table shows those patients.
- **Verify:** `npm run test --workspace app` passes.

---

## Phase 4 — Documentation and delivery

### T-4.1 Library documentation
- **Depends on:** T-1.8
- **Status:** Done
- **Done when:** `packages/ui/README.md` has all four required sections —
  getting started, styling, component reference, contributing — with a props
  table, one runnable usage example and a when-to-use note per component.
- **Verify:** every prop in the code appears in a table and every documented
  prop exists in the code; paste each usage example into the app and confirm it
  compiles and renders.

### T-4.2 Project README
- **Depends on:** T-3.4, T-2.4
- **Status:** Done
- **Done when:** `README.md` describes what the project is, how it is laid out
  and how to run each package, written as if the project were real, and links
  to `INTERVIEW.md`.
- **Verify:** follow the README from a clean checkout — `npm install`, run the
  API, run the app — and confirm each documented command works as written.

### T-4.3 Interview notes
- **Depends on:** T-4.2
- **Status:** Done
- **Done when:** `INTERVIEW.md` covers the decisions the spec left open and
  why, the process and AI usage including at least one thing that had to be
  checked or corrected, pointers to these tasks and the harness, and what two
  more hours would buy.
- **Verify:** every open choice recorded in `docs/DECISIONS.md` is represented,
  and the correction described is a real one from the build.

### T-4.4 Delivery check
- **Depends on:** T-4.1, T-4.2, T-4.3
- **Status:** Done
- **Done when:** the commit history reads as a sequence matching these tasks,
  the `.claude` harness is committed rather than ignored, and all three
  packages run from their documented commands on a clean checkout.
- **Verify:** clone into a fresh directory and run every documented command.

---

## Phase 5 — Library additions

### T-5.1 Storybook
- **Depends on:** T-1.8
- **Status:** Done
- **Done when:** `npm run storybook` serves every component in every variant
  and state from one `Name.stories.tsx` beside each component; stories render
  with the same tokens and CSS Modules naming as the published build and are
  excluded from `dist/`; the commands and file layout are documented.
- **Verify:** `npm run build-storybook --workspace ui` completes and its index
  lists a story per variant and state; `npm run build --workspace ui` emits no
  story files; `npm run typecheck` and `npm test` still pass.

### T-5.2 Component library test coverage
- **Depends on:** T-1.7, T-5.1
- **Status:** Done
- **Done when:** every component prop and state without a behaviour test has
  one — Button sizes, form submission and `aria-label`; TextField value,
  placeholder and error announcement; Card heading level and interactive
  actions; Table missing cells, empty state and ignored keys; DescriptionList
  order and node values — plus a test that the entry point exports exactly
  the five components and a test that renders every Storybook story.
- **Verify:** `npm test` and `npm run typecheck` pass; a deliberate break in a
  component (Button always `type="submit"` and always busy) makes the new
  tests fail, and reverting it makes them pass.

---

## Phase 6 — Documentation depth, extension and project tests

Raised after the Phase 5 review: the library documentation says what each
component's props are, but not what each state looks like, how the components
are used together in a real screen, or how to extend the library. It also has
to read more clearly and point into the code. The project's `app` and `api`
need unit tests of their own.

### T-6.1 Component state reference
- **Depends on:** T-5.1
- **Status:** Done
- **Done when:** `packages/ui/README.md` has, for every component, a table of
  its states — default, hover, focus, error, loading, disabled, empty, as they
  apply — saying how each is triggered (prop or interaction), what it looks
  like in terms of the tokens it uses, and which Storybook story shows it;
  plus a screenshot per state captured from the built Storybook and stored
  in `packages/ui/docs/states/` (time-boxed: if a headless browser fights,
  record it and ship the tables without images).
- **Verify:** every state in each table maps to a behaviour in the component
  source and a story that exists in the built Storybook index; every token
  named exists in `tokens.css`; every image path resolves.

### T-6.2 Worked example: a real screen
- **Depends on:** T-5.1
- **Status:** Done
- **Done when:** a "Patient lookup" example that uses all five components
  together the way a product screen would (search in a Card, results in a
  Table, the selected record in a DescriptionList, loading, error and empty
  handled) exists as a Storybook story under `Examples/`, and appears near
  the top of `packages/ui/README.md` as a complete code listing identical to
  the story apart from the import line.
- **Verify:** the story renders in the story test and in the built
  Storybook; the README listing is diffed against the story source and
  differs only in the import; the listing compiles when pasted into `app`.

### T-6.3 Component scaffold
- **Depends on:** T-5.2
- **Status:** Done
- **Done when:** `npm run new-component --workspace ui -- <Name>` creates the
  four files of a new component (component, styles from tokens, behaviour
  test, stories) and adds its export to `src/index.ts`; the story test and
  the entry-point test discover components rather than listing them, so a
  scaffolded component is covered without editing any test.
- **Verify:** scaffold a throwaway component, then `npm run typecheck`,
  `npm test`, `npm run build --workspace ui` and `build-storybook` all pass
  with it present; remove it and they still pass; the script refuses a name
  that already exists or is not PascalCase.

### T-6.4 Extending the library
- **Depends on:** T-6.3
- **Status:** Done
- **Done when:** `packages/ui/README.md` has an "Extending the library"
  section that starts from the scaffold command, walks through adding a
  component end to end, and explains which architectural choices make that
  cheap — tokens defined once, CSS Modules scoping, the single entry point,
  co-located files, discovered tests and stories — each pointing at the code
  that implements it.
- **Verify:** follow the section literally to add a throwaway component and
  confirm every step works as written; then remove it.

### T-6.5 Documentation layout and code references
- **Depends on:** T-6.1, T-6.2, T-6.4
- **Status:** Done
- **Done when:** `packages/ui/README.md` is reorganised into clearly
  separated sections with a contents list that matches its headings, and
  every claim about how the library works links to the code with a line
  number (`src/components/Button.tsx:26`-style links); a test checks that
  every such reference points at an existing file and a line that exists.
- **Verify:** the reference test passes, and fails when a referenced line is
  moved out of range; the contents list matches the headings exactly.

### T-6.6 Three clarity passes
- **Depends on:** T-6.5
- **Status:** Done
- **Done when:** the library documentation has had three rounds of review by
  a fresh reader told to treat it as unclear and find everything that is,
  each round's findings applied and logged in `AutoPhase.md`; the props
  tables still match the code exactly.
- **Verify:** each round's findings list and what changed is recorded; the
  reference test and full suite pass after the final round; every prop in
  the code appears in a table and every documented prop exists.

### T-6.7 Unit tests for `app` and `api`
- **Depends on:** T-3.5, T-2.4
- **Status:** Done
- **Done when:** the `app` mapping and API client have unit tests for every
  field rule and failure path not already covered, and `api` has an xUnit
  test project covering every endpoint in `docs/API-CONTRACT.md`, the search
  filter, the not-found case and the seed patients with missing fields;
  `npm run test:api` runs it and the project README documents it.
- **Verify:** `npm test` and `npm run test:api` pass; a deliberate break in
  the search filter and in the mapping each fail a test.

---

## Phase 7 — Fixes from the review against the brief

A four-area review graded the project against the candidate brief. The owner
accepted these fixes (grilling round 1, Q1–Q11).

### T-7.1 Concise documentation
- **Depends on:** T-6.6
- **Status:** Done
- **Done when:** the library README and the project README say the same things
  in substantially fewer words, with no fact, example or test-checked table lost.
- **Verify:** word counts before and after; `npm test` passes, including the
  README tests.

### T-7.2 Page 1 shows "—" for a missing value
- **Depends on:** T-3.3
- **Status:** Done
- **Done when:** a patient with no phone shows `—` in the list's Phone column,
  mapped in `app` as the library README tells consumers to; INTERVIEW.md no
  longer lists the blank cell as a gap, and D-13 agrees.
- **Verify:** a page test for a patient with a missing phone; the test fails
  when the mapping is removed.

### T-7.3 A loading Button keeps keyboard focus
- **Depends on:** T-1.2
- **Status:** Done
- **Done when:** while `loading`, Button stays focusable (`aria-disabled`) and
  ignores activation; `disabled` stays native `disabled`; the README says so.
- **Verify:** a test that a focused Button keeps focus when it starts loading
  and still ignores clicks and Enter; the existing Button tests pass.

### T-7.4 API port from configuration
- **Depends on:** T-2.2
- **Status:** Done
- **Done when:** the API's port comes from configuration (default 5080) rather
  than a hard-coded `UseUrls`, so `--urls` and `ASPNETCORE_URLS` work.
- **Verify:** `npm run api` serves on 5080; `dotnet run --project
  api/Intrahealth.Api --urls http://localhost:5099` serves on 5099; API tests
  pass.

### T-7.5 The harness explained
- **Depends on:** T-4.4
- **Status:** Done
- **Done when:** `.claude/skills/` includes the `phase-tasks` skill the others
  call, and `.claude/README.md` says these are reusable skills written for
  other projects and maps their terms to this repository.
- **Verify:** every skill named inside a committed skill is itself committed.

### T-7.6 Repository ready to share
- **Depends on:** —
- **Status:** Done
- **Done when:** `.idea/`, `Summary.md` and the two copies of the brief are
  ignored and untracked; the brief stays on disk for local work.
- **Verify:** `git status` is clean; `git ls-files` lists no brief file.

### T-7.7 Process record matches the repository
- **Depends on:** T-7.1 … T-7.6
- **Status:** Done
- **Done when:** INTERVIEW.md states the real phase and task counts, labels
  Phases 5–7 as post-delivery work directed by the owner with the time it
  took, discloses that Phase 1 was drafted before being committed task by
  task, reports test counts split into behaviour and documentation tests,
  corrects the `cecc901` note, and lists the review's deferred items under
  "two more hours".
- **Verify:** every count in INTERVIEW.md matches a command run on the final
  tree.

### T-7.8 What I reviewed myself
- **Depends on:** T-7.7
- **Status:** Blocked — needs the owner's own account
- **Done when:** INTERVIEW.md has a first-person section listing only what the
  owner personally reviewed or verified.
- **Verify:** the owner confirms every sentence is true.

### T-7.10 Clickable rows announce themselves
- **Depends on:** T-1.5
- **Status:** Done
- **Done when:** in a clickable Table, the first cell of each row is a real
  `<button>` named by that cell's content, so a screen reader announces the row
  as actionable; the whole row stays clickable; `onRowClick` fires once per
  activation; no prop changes; D-15 and the README updated.
- **Verify:** Table tests for Tab to the button, Enter, Space, a click on the
  button and a click elsewhere in the row (each fires once), and no buttons
  when not clickable; mutation check.

### T-7.11 The empty message only follows a search
- **Depends on:** T-3.3
- **Status:** Done
- **Done when:** the list says "No patients match your search" only when a
  search has run; an empty unfiltered list says "No patients yet".
- **Verify:** page tests for both.

### T-7.12 The detail page titles the browser tab
- **Depends on:** T-3.4
- **Status:** Done
- **Done when:** the tab reads the patient's full name on Page 2 and "Patients"
  on Page 1.
- **Verify:** page tests on `document.title`.

### T-7.13 Back keeps the search
- **Depends on:** T-3.4
- **Status:** Done
- **Done when:** the list page keeps its search in the URL (`/?search=…`),
  runs it on load, and the detail page's Back returns to it; Back from a
  directly opened patient still goes to `/`.
- **Verify:** a test that searches, opens a patient, presses Back and sees the
  search and its results; a test for Back from a direct link.

### T-7.14 Walkthrough outline
- **Depends on:** T-7.13
- **Status:** Done
- **Done when:** a timed, one-page outline for the 15–20 minute recording
  exists for the owner, drawn from INTERVIEW.md.
- **Verify:** every claim in it is in INTERVIEW.md or the code.

### T-7.9 Submit
- **Depends on:** T-7.1 … T-7.8, T-7.10 … T-7.14
- **Status:** Blocked — needs the owner's go-ahead
- **Done when:** the repository is pushed to a private GitHub repository shared
  with the reviewers.
- **Verify:** a fresh clone from GitHub passes the documented commands.

---

## Phase 8 — Component documentation site

### T-8.1 Storybook docs pages for the components
- **Depends on:** T-5.1
- **Status:** Done
- **Done when:** Storybook has a documentation page per component and one
  for the design tokens, in the style of Material UI's component pages (a
  short introduction, live demos with their code, then the props API). The
  content is limited to the design requirements: props, token-level
  appearance, states and accessibility. `npm run build-storybook --workspace
  ui` produces them as a static HTML site.
- **Verify:** the built index lists a docs page for each component and for
  the tokens; each page renders in a browser with its demos; every token and
  value on the pages matches the token sheet; the props tables match the code.

### T-8.2 The docs site as a local website
- **Depends on:** T-8.1
- **Status:** Done
- **Done when:** one command builds the Storybook docs as a static site and
  serves it at a fixed local address; the project and library READMEs say how
  to open it and how to hand the built site to another developer.
- **Verify:** from the root, the command serves the site; every docs page loads
  from that address; the built folder also works under a different static
  server.

### T-8.3 Docs site styled like Material UI's
- **Depends on:** T-8.2
- **Status:** Done
- **Done when:** the docs pages follow the owner's reference (the Material UI
  Checkbox page): a dark page, a large bold title and a larger lead paragraph,
  a row of pill links under it, demos in a rounded panel with their code shown
  beneath, and large section headings. The content stays limited to the design
  requirements.
- **Verify:** screenshots of each page compared with the reference; no console
  errors; `npm test` passes.

### T-8.4 Docs pages only in the sidebar
- **Depends on:** T-8.3
- **Status:** Done
- **Done when:** the Storybook sidebar lists docs pages only; every demo is on
  its component's docs page; the worked example has a docs page; the library
  README's state tables point at docs page sections instead of stories.
- **Verify:** the sidebar in the built site lists only docs pages; the example
  works from its page; the state screenshots still capture; `npm test` passes.

### T-8.5 No WAI references on the docs pages
- **Depends on:** T-8.3
- **Status:** Done
- **Done when:** the docs pages carry no WAI links (the owner's request):
  the WAI-ARIA pills on Button and Table and the WAI forms pill on TextField
  are removed, leaving Design tokens and API.
- **Verify:** the built pages contain no "WAI" text.

### T-8.6 Rename to "UI Components Package"
- **Depends on:** —
- **Status:** Done
- **Done when:** the project is called "UI Components Package" wherever it was
  called "EHR Design System": the READMEs, CLAUDE.md, the design document's
  title, the Storybook brand and Overview page, the `ui` package description
  and the root npm package name (`ui-components-package`).
- **Verify:** no "EHR Design System" left outside quoted brief text and file
  names; the built docs show the new name; `npm test` passes.

### T-8.7 Lead with the components
- **Depends on:** T-8.6
- **Status:** Done
- **Done when:** the Overview page and the library README open with the
  project's purpose as the brief frames it: UI components that developers use
  to build applications for the healthcare setting (the screens of an EHR
  system), assembled by product teams into their own apps.
- **Verify:** the served Overview page shows the new lead; `npm test` passes.
