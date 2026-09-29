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

**Status summary:** All five phases complete; every task Done and verified by
its own check. The run log with the evidence for each is `AutoPhase.md`.

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
