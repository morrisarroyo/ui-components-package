# Tasks

The work order, by the phases in `CLAUDE.md`. Each task stands alone and
has:

- **Depends on** — what must be finished first.
- **Status** — `Not started`, `In progress`, `Blocked` or `Done`.
- **Done when** — what you can see when it is finished.
- **Verify** — the check that proves it. Run it before marking Done.

One task, one commit: the history and this file must tell the same story.

**Status summary:** Phases 0–6 complete. Phase 7 (fixes from the review
against the brief) in progress. Phases 5–7 came after the original delivery
(Phase 4).

---

## Phase 0 — Repository and toolchain

### T-0.1 Reconcile the brief and write the design document
- **Depends on:** nothing
- **Status:** Done
- **Done when:** the markdown and PDF briefs are compared, and
  `docs/DESIGNDOCUMENT.md` holds the reconciled spec.
- **Verify:** every token and prop matches the brief; section 0 records the
  comparison.

### T-0.2 Monorepo skeleton
- **Depends on:** nothing
- **Status:** Done
- **Done when:** git is set up and `npm install` links the `ui` workspace
  into `app`.
- **Verify:** `npm install` exits 0 and `ls node_modules/ui` finds it.

### T-0.3 Library build and test configuration
- **Depends on:** T-0.2
- **Status:** Done
- **Done when:** `packages/ui` has its build (Vite, scoped `ui-` class
  names) and test (Vitest) configuration.
- **Verify:** the config files exist and agree; T-1.8 proves them.

### T-0.4 Website build configuration
- **Depends on:** T-0.2
- **Status:** Done
- **Done when:** `packages/app` is a Vite React app whose dev server
  forwards `/api` to the mock API.
- **Verify:** T-3.1 proves it (`npm run dev` serves the app).

### T-0.5 Project documents
- **Depends on:** T-0.1
- **Status:** Done
- **Done when:** the project documents exist, and the deliverable docs exist
  as skeletons.
- **Verify:** every document in the `CLAUDE.md` table exists.

---

## Phase 1 — The component library

Sizes, colours and spacing for each component are in section 3 of
`docs/DESIGNDOCUMENT.md`; the tasks below name only the behaviour.

### T-1.1 Design tokens
- **Depends on:** T-0.3
- **Status:** Done
- **Done when:** every token-sheet value, plus the focus ring, is defined once
  in `packages/ui/src/tokens.css`.
- **Verify:** each of the 24 token rows appears once, with the right value.

### T-1.2 Button
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** `variant` and `size` take only their listed values. Loading
  shows a spinner **without changing width**. Loading and disabled buttons
  cannot be activated. Focus shows the focus ring.
- **Verify:** T-1.7 tests; in a browser, `loading` leaves the width
  unchanged.

### T-1.3 TextField
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** the label is tied to the input. A non-empty `errorMessage`
  turns the border red and **replaces** the helper text. Disabled and focus
  styles come from tokens.
- **Verify:** T-1.7 tests; clicking the label focuses the input.

### T-1.4 Card
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** the title and right-aligned actions share a header row. With
  neither, there is no header row.
- **Verify:** render with title only, actions only, both, and neither.

### T-1.5 Table
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** rows highlight on hover **only** when `onRowClick` is set,
  and clickable rows work from the keyboard. An empty table shows
  `emptyMessage` (default `"No results"`).
- **Verify:** T-1.7 tests; tab to a row and press Enter.

### T-1.6 DescriptionList
- **Depends on:** T-1.1
- **Status:** Done
- **Done when:** each row shows a fixed-width label and a value. An empty,
  `null` or `undefined` value shows a muted em dash.
- **Verify:** T-1.7 covers all three kinds of empty.

### T-1.7 Component behaviour tests
- **Depends on:** T-1.2, T-1.3, T-1.4, T-1.5, T-1.6
- **Status:** Done
- **Done when:** tests check behaviour, not snapshots. They cover at least
  Button variants, disabled and loading; TextField's error and label; Table's
  empty state and row click; and DescriptionList's `—`.
- **Verify:** `npm run test --workspace ui` passes with every case present.

### T-1.8 Library build
- **Depends on:** T-1.7
- **Status:** Done
- **Done when:** `npm run build --workspace ui` emits `dist/ui.js`,
  `dist/ui.css` and `dist/index.d.ts`, without bundling React. The package
  exports the entry point and `ui/styles.css`.
- **Verify:** the build exits 0, the three files exist, and `grep` shows no
  React inside `ui.js`.

---

## Phase 2 — The mock API

### T-2.1 API contract
- **Depends on:** T-0.1
- **Status:** Done
- **Done when:** `docs/API-CONTRACT.md` sets out the API that `app` and `api`
  both follow.
- **Verify:** every field the pages show is in it, and optional fields are
  marked.

### T-2.2 ASP.NET Core project
- **Depends on:** T-0.2
- **Status:** Done
- **Done when:** `api/Intrahealth.Api` starts on the port the website's dev
  proxy expects.
- **Verify:** `dotnet run --project api/Intrahealth.Api` starts and answers.

### T-2.3 Seed data
- **Depends on:** T-2.2
- **Status:** Done
- **Done when:** enough invented patients for search to matter are held in
  memory, **some with optional fields missing** so Page 2 can show `—`.
- **Verify:** there is a patient with no email and one with no address.

### T-2.4 Endpoints
- **Depends on:** T-2.1, T-2.3
- **Status:** Done
- **Done when:** the list endpoint returns all patients, or those whose name
  contains the search term in any case. The detail endpoint returns a patient
  by id, or 404.
- **Verify:** `curl` the full list, a matching search, a search with no
  matches, a known id and an unknown id.

---

## Phase 3 — The website

### T-3.1 App shell and routing
- **Depends on:** T-0.4, T-1.8
- **Status:** Done
- **Done when:** `app` routes to the patient list and to a patient by id. It
  imports `ui` and `ui/styles.css` by package name only and overrides no `ui`
  styles.
- **Verify:** `npm run dev` serves both routes; `grep` finds no import into
  the library's source in `packages/app/src`.

### T-3.2 API client and display mapping
- **Depends on:** T-2.4, T-3.1
- **Status:** Done
- **Done when:** one module holds the API calls and the only mapping from API
  data to display values, missing fields included.
- **Verify:** no other file in `app` reads an API field name.

### T-3.3 Patient list page
- **Depends on:** T-3.2
- **Status:** Done
- **Done when:** the "Patients" page has a search Card and a Table of Name,
  Gender, Birth date and Phone. It shows "Loading…" on first load and the
  Search button's loading state while searching. No matches shows "No
  patients match your search". If the API is down, a "Something went wrong"
  Card replaces the Table. Clicking a row opens the patient.
- **Verify:** walk every state against the running API, stopping it to see
  the error.

### T-3.4 Patient detail page
- **Depends on:** T-3.2
- **Status:** Done
- **Done when:** the page is titled with the patient's name and has a Back
  button. A "Demographics" Card lists Name, Gender, Birth date, Phone, Email
  and Address, with `—` for a missing value. It shows "Loading…" while
  loading. An unknown id shows "Patient not found", still with Back.
- **Verify:** open a complete patient, one with no email, and a made-up id.

### T-3.5 Page test
- **Depends on:** T-3.3
- **Status:** Done
- **Done when:** a test renders the list page with a mocked response and
  checks the Table shows those patients.
- **Verify:** `npm run test --workspace app` passes.

---

## Phase 4 — Documentation and delivery

### T-4.1 Library documentation
- **Depends on:** T-1.8
- **Status:** Done
- **Done when:** `packages/ui/README.md` has the brief's four sections. Each
  component has a props table, an example and when to use it.
- **Verify:** props tables match the code both ways; each example compiles
  and renders in the app.

### T-4.2 Project README
- **Depends on:** T-3.4, T-2.4
- **Status:** Done
- **Done when:** `README.md` explains the project and how to run each
  package, and links to `INTERVIEW.md`.
- **Verify:** from a clean checkout, every documented command works as
  written.

### T-4.3 Interview notes
- **Depends on:** T-4.2
- **Status:** Done
- **Done when:** `INTERVIEW.md` covers the open decisions and why, and the
  process and AI use, with at least one real correction. It points to the
  tasks and harness, and says what two more hours would buy.
- **Verify:** every open choice in `docs/DECISIONS.md` appears, and the
  correction is real.

### T-4.4 Delivery check
- **Depends on:** T-4.1, T-4.2, T-4.3
- **Status:** Done
- **Done when:** the history follows these tasks, the `.claude` harness is
  committed, and all three packages run from their documented commands.
- **Verify:** clone into a fresh folder and run every documented command.

---

## Phase 5 — Library additions

### T-5.1 Storybook
- **Depends on:** T-1.8
- **Status:** Done
- **Done when:** `npm run storybook` shows every component in every variant
  and state, styled as in the build. Stories stay out of `dist/`.
- **Verify:** the built Storybook lists a story per variant and state; the
  library build has no story files; `npm run typecheck` and `npm test` pass.

### T-5.2 Component library test coverage
- **Depends on:** T-1.7, T-5.1
- **Status:** Done
- **Done when:** every untested prop and state of the five components has a
  behaviour test. Two more tests check that the entry point exports exactly
  the five, and that every story renders.
- **Verify:** `npm test` and `npm run typecheck` pass. Breaking Button on
  purpose fails the new tests; undoing it passes them.

---

## Phase 6 — Documentation depth, extension and project tests

The Phase 5 review found the library docs listed props but not how states
look, how components combine, or how to add one. `app` and `api` also needed
their own tests.

### T-6.1 Component state reference
- **Depends on:** T-5.1
- **Status:** Done
- **Done when:** `packages/ui/README.md` has a state table per component.
  Each state says how it is triggered, which tokens it uses and which story
  shows it, with a screenshot in `packages/ui/docs/states/`. Time-boxed: if
  screenshots fight back, ship the tables alone.
- **Verify:** every state matches the code and a real story; every token and
  image exists.

### T-6.2 Worked example: a real screen
- **Depends on:** T-5.1
- **Status:** Done
- **Done when:** a "Patient lookup" story under `Examples/` uses all five
  components together, with loading, error and empty handled. The library
  README shows its full code near the top.
- **Verify:** the story renders; the README code differs from it only in the
  import and compiles in `app`.

### T-6.3 Component scaffold
- **Depends on:** T-5.2
- **Status:** Done
- **Done when:** `npm run new-component --workspace ui -- <Name>` creates a
  component's four files and exports it. The tests find new components
  themselves, so none needs editing.
- **Verify:** with a throwaway component added, then removed, typecheck,
  tests, the library build and the Storybook build pass. The script refuses
  an existing or non-PascalCase name.

### T-6.4 Extending the library
- **Depends on:** T-6.3
- **Status:** Done
- **Done when:** `packages/ui/README.md` has an "Extending the library"
  section. It walks through adding a component from the scaffold, and links
  to the code behind each design choice that makes this easy.
- **Verify:** follow it word for word to add a throwaway component, then
  remove it.

### T-6.5 Documentation layout and code references
- **Depends on:** T-6.1, T-6.2, T-6.4
- **Status:** Done
- **Done when:** `packages/ui/README.md` has a contents list matching its
  headings. Claims about how the library works link to a line of code
  (`src/components/Button.tsx:26`), and a test checks each link.
- **Verify:** the test passes, and fails on an out-of-range line; the
  contents list matches the headings.

### T-6.6 Three clarity passes
- **Depends on:** T-6.5
- **Status:** Done
- **Done when:** a fresh reader has reviewed the library docs three times for
  anything unclear. Each round's findings are applied and logged in
  `AutoPhase.md`.
- **Verify:** each round is recorded; afterwards all tests pass and the props
  tables match the code.

### T-6.7 Unit tests for `app` and `api`
- **Depends on:** T-3.5, T-2.4
- **Status:** Done
- **Done when:** `app`'s mapping and API client have tests for every field
  rule and failure. `api` has an xUnit test project for every endpoint,
  search, not-found and missing fields, run by `npm run test:api` and
  documented.
- **Verify:** `npm test` and `npm run test:api` pass. Breaking the search, or
  the mapping, fails a test.

---

## Phase 7 — Fixes from the review against the brief

A review graded the project against the brief, and the owner accepted these
fixes (grilling round 1, Q1–Q11).

### T-7.1 Concise documentation
- **Depends on:** T-6.6
- **Status:** Done
- **Done when:** the library and project READMEs are much shorter but lose
  no fact, example or tested table.
- **Verify:** word counts before and after; `npm test` passes.

### T-7.2 Page 1 shows "—" for a missing value
- **Depends on:** T-3.3
- **Status:** Done
- **Done when:** a patient with no phone shows `—` in the list, set in `app`'s
  mapping. INTERVIEW.md and D-13 agree.
- **Verify:** a page test that fails without the mapping.

### T-7.3 A loading Button keeps keyboard focus
- **Depends on:** T-1.2
- **Status:** Done
- **Done when:** a loading Button stays focusable (`aria-disabled`) but
  ignores activation; `disabled` stays truly disabled. The README says so.
- **Verify:** a test that focus stays and clicks and Enter are ignored;
  existing Button tests pass.

### T-7.4 API port from configuration
- **Depends on:** T-2.2
- **Status:** Done
- **Done when:** the port comes from configuration (default 5080), so
  `--urls` and `ASPNETCORE_URLS` work.
- **Verify:** `npm run api` serves on 5080; `dotnet run --project
  api/Intrahealth.Api --urls http://localhost:5099` serves on 5099; API tests
  pass.

### T-7.5 The harness explained
- **Depends on:** T-4.4
- **Status:** Done
- **Done when:** `.claude/skills/` includes `phase-tasks`, which the others
  call. `.claude/README.md` explains the skills are reusable and maps their
  terms to this repository.
- **Verify:** every skill a committed skill names is committed.

### T-7.6 Repository ready to share
- **Depends on:** —
- **Status:** Done
- **Done when:** `.idea/`, `Summary.md` and both copies of the brief are
  ignored and untracked, but the brief stays on disk.
- **Verify:** `git status` is clean; `git ls-files` lists no brief.

### T-7.7 Process record matches the repository
- **Depends on:** T-7.1 … T-7.6
- **Status:** Done
- **Done when:** INTERVIEW.md gives the real phase, task and test counts. It
  marks Phases 5–7 as later work the owner asked for, with the time taken. It
  says Phase 1 was drafted before being committed task by task, corrects the
  `cecc901` note, and lists the review's deferred items.
- **Verify:** every count matches a command run on the final tree.

### T-7.8 What I reviewed myself
- **Depends on:** T-7.7
- **Status:** Blocked — needs the owner's own account
- **Done when:** INTERVIEW.md has a first-person section listing only what the
  owner personally checked.
- **Verify:** the owner confirms every sentence.

### T-7.10 Clickable rows announce themselves
- **Depends on:** T-1.5
- **Status:** Done
- **Done when:** a clickable row's first cell is a real `<button>`, so screen
  readers announce it. The whole row stays clickable and `onRowClick` fires
  once. No prop changes; D-15 and the README are updated.
- **Verify:** Table tests for keyboard and mouse (each fires once) and for no
  buttons when rows are not clickable; mutation check.

### T-7.11 The empty message only follows a search
- **Depends on:** T-3.3
- **Status:** Done
- **Done when:** "No patients match your search" shows only after a search;
  an empty list otherwise says "No patients yet".
- **Verify:** page tests for both.

### T-7.12 The detail page titles the browser tab
- **Depends on:** T-3.4
- **Status:** Done
- **Done when:** the tab reads the patient's name on Page 2 and "Patients" on
  Page 1.
- **Verify:** page tests on `document.title`.

### T-7.13 Back keeps the search
- **Depends on:** T-3.4
- **Status:** Done
- **Done when:** the search lives in the URL (`/?search=…`), so Back from a
  patient returns to it. Back from a patient opened directly goes to `/`.
- **Verify:** tests for both.

### T-7.14 Walkthrough outline
- **Depends on:** T-7.13
- **Status:** Done
- **Done when:** the owner has a timed, one-page outline for the 15–20 minute
  recording, drawn from INTERVIEW.md.
- **Verify:** every claim in it is in INTERVIEW.md or the code.

### T-7.9 Submit
- **Depends on:** T-7.1 … T-7.8, T-7.10 … T-7.14
- **Status:** Blocked — needs the owner's go-ahead
- **Done when:** the repository is in a private GitHub repository shared with
  the reviewers.
- **Verify:** a fresh clone passes the documented commands.

---

## Phase 8 — Component documentation site

### T-8.1 Storybook docs pages for the components
- **Depends on:** T-5.1
- **Status:** Done
- **Done when:** Storybook has a docs page per component and one for the
  tokens, laid out like Material UI's: intro, live demos with code, props.
  They cover only the design requirements. `npm run build-storybook
  --workspace ui` builds them as a static site.
- **Verify:** every page is listed and renders; tokens match the token sheet
  and props match the code.

### T-8.2 The docs site as a local website
- **Depends on:** T-8.1
- **Status:** Done
- **Done when:** one command builds the docs and serves them locally. The
  READMEs say how to open the site and share the built copy.
- **Verify:** every page loads from that address, and from another static
  server.

### T-8.3 Docs site styled like Material UI's
- **Depends on:** T-8.2
- **Status:** Done
- **Done when:** the pages look like the owner's reference, Material UI's
  Checkbox page. That means dark, a big title and lead, pill links, and demos
  in a rounded panel above their code. Content stays within the design
  requirements.
- **Verify:** screenshots match the reference; no console errors; `npm test`
  passes.

### T-8.4 Docs pages only in the sidebar
- **Depends on:** T-8.3
- **Status:** Done
- **Done when:** the sidebar lists only docs pages, each demo lives on its
  component's page, and the worked example has its own. The README's state
  tables link to docs pages, not stories.
- **Verify:** the built sidebar shows only docs pages; the example works;
  screenshots still capture; `npm test` passes.

### T-8.5 No WAI references on the docs pages
- **Depends on:** T-8.3
- **Status:** Done
- **Done when:** at the owner's request, the pages have no links to the W3C's
  Web Accessibility Initiative (WAI).
- **Verify:** the built pages contain no "WAI".

### T-8.6 Rename to "UI Components Package"
- **Depends on:** —
- **Status:** Done
- **Done when:** "EHR Design System" becomes "UI Components Package"
  everywhere it named the project, and the root npm package becomes
  `ui-components-package`.
- **Verify:** the old name survives only in quoted brief text and file names;
  the built docs show the new one; `npm test` passes.

### T-8.7 Lead with the components
- **Depends on:** T-8.6
- **Status:** Done
- **Done when:** the docs Overview and library README open with the brief's
  purpose. These are UI components for building healthcare apps, such as
  electronic health record (EHR) screens.
- **Verify:** the served Overview shows it; `npm test` passes.

---

## Phase 9 — Accessibility to WCAG 2.2 AA

The owner asked for the components to meet the Web Content Accessibility
Guidelines (WCAG) 2.2 at level AA, and for the docs to say so.

### T-9.1 Screen-reader fixes
- **Depends on:** —
- **Status:** Done
- **Done when:** DescriptionList's dash is read as "Not provided", and a
  titled Card is a region named by its title. In the app, "Loading…" is a
  status message and failure Cards are alerts.
- **Verify:** tests for each; mutation checks.

### T-9.2 Colour contrast
- **Depends on:** T-9.1
- **Status:** Done (owner chose option (a), grilling Q16; D-19)
- **Done when:** the table header, input border and focus ring meet WCAG AA
  contrast, or are documented exceptions.
- **Verify:** a contrast check of every colour pair the components use.

### T-9.3 Accessibility in the docs
- **Depends on:** T-9.2
- **Status:** Done
- **Done when:** the library README and docs site state the standard met and
  what each component does for it.
- **Verify:** every claim matches a test or a measured contrast ratio.

---

## Phase 10 — Hosting

### T-10.1 One container serves the site, the API and the docs
- **Depends on:** —
- **Status:** Done
- **Done when:** a `Dockerfile` builds one image in which the API serves the
  website at `/`, itself at `/api` and the docs at `/docs`, on the host's
  `PORT`. `render.yaml` describes it as one free Render service.
- **Verify:** assemble the image's layout by hand (no local Docker). Patients
  list and open, deep links load, unknown `/api` paths return 404, and docs
  render. `npm run test:api` passes.

### T-10.2 Deployed on Render
- **Depends on:** T-10.1
- **Status:** Done
- **Done when:** the public address serves all three, and the project README
  links them.
- **Verify:** the T-10.1 checks pass at the public address.

### T-10.3 Live links on the docs Overview
- **Depends on:** T-10.2
- **Status:** Done
- **Done when:** the docs Overview links to the live website and API.
- **Verify:** both links show in the built and the hosted Overview.

---

## Phase 11 — READMEs, Swagger and contributing

The owner asked for a README with a quick start per part, Swagger docs for
the API, shorter interview notes, and a docs page on adding a component.

### T-11.1 Swagger docs for the API
- **Depends on:** —
- **Status:** Done
- **Done when:** the API serves a Swagger page at `/api/swagger` and its
  OpenAPI document at `/api/swagger/v1/swagger.json`, covering both endpoints
  and the 404 (D-21).
- **Verify:** `npm run test:api` passes, and a test fails with Swagger off.

### T-11.2 Contributing page on the docs site
- **Depends on:** —
- **Status:** Done
- **Done when:** a Contributing page covers adding a component, linking to
  the library README's walkthrough.
- **Verify:** the page is last in the sidebar and renders without console
  errors.

### T-11.3 A README per part, linked from the project README
- **Depends on:** T-11.1, T-11.2
- **Status:** Done
- **Done when:** the components, docs site, website, API and tests each have
  a README starting with a Quick start, all linked from the project README.
- **Verify:** every README has a Quick start; every link resolves; `npm test`
  passes.

### T-11.4 Concise interview notes
- **Depends on:** T-11.3
- **Status:** Done
- **Done when:** `INTERVIEW.md` is shorter and current through Phase 11.
- **Verify:** the document checker shows fewer words; the test total matches
  `npm test` and `npm run test:api`.

---

## Phase 12 — End-to-end tests

### T-12.1 Behaviour tests of both pages in a real browser
- **Depends on:** —
- **Status:** Done
- **Done when:** `npm run test:e2e` runs Playwright against the running API
  for every page behaviour in section 5 of the design document (D-22).
- **Verify:** the tests pass. Blanking the missing phone, or making Back drop
  the search, fails the matching test.

---

## Phase 14 — CI, secrets, testing guide and clean-up

The owner asked for continuous integration (CI) in Docker run by one
command, no secrets on the remote, a guide to better tests, a clean
repository, and lint.

### T-14.1 Continuous integration in Docker, one command
- **Depends on:** —
- **Status:** Done
- **Done when:** `npm run ci` runs every check and build. `npm run ci:docker`
  runs it inside a Docker build. GitHub Actions runs that, and builds the
  hosted image, on every push and pull request to `main` (D-24). `TESTING.md`
  explains it.
- **Verify:** `npm run ci` passes locally and on GitHub.

### T-14.2 No secrets on the remote
- **Depends on:** T-14.1
- **Status:** Done
- **Done when:** a scan of every commit finds no passwords, keys or tokens,
  and CI scans every push with gitleaks.
- **Verify:** the history scan and CI secrets job are clean. By the owner's
  choice, the brief stays in the history from before T-7.6.

### T-14.3 A guide to effective tests
- **Depends on:** —
- **Status:** Done
- **Done when:** `docs/TESTING-GUIDE.md` shows how to write tests that catch
  real breakage, using this repository's tests. `TESTING.md`, the project
  README and the conventions link to it.
- **Verify:** every example matches a real test; the document checker passes.

### T-14.4 Clean up the repository
- **Depends on:** T-14.1, T-14.3
- **Status:** Done
- **Done when:** no tracked file is unused or generated, the conventions'
  layout matches the repository, and no doc silently points at a removed
  file.
- **Verify:** every tracked screenshot and script is used; the layout lists
  every top-level item; `npm run ci` passes.

### T-14.5 Lint that enforces the project's rules
- **Depends on:** T-14.1
- **Status:** Done
- **Done when:** `npm run lint` runs ESLint, Stylelint and `dotnet format`,
  and `npm run ci` runs it first (D-25). It fails on a hard-coded colour,
  spacing or font size outside `tokens.css`, a deep import from `app` into
  `ui`, and an accessibility mistake jsx-a11y can see. A scaffolded component
  lints clean. `docs/TESTING.md` says what each linter checks, and the
  `test-and-fix` skill runs lint as part of verification.
- **Verify:** plant each of those violations and see lint fail; `npm run ci`
  passes.
