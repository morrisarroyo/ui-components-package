# Decisions

The choices the brief left open, logged as they were made. `INTERVIEW.md` is
built from this file. Each entry says what was decided, why, what else was
considered, and what would change it.

---

## D-1 — One repository with npm workspaces

**Decided:** 2026-09-25 · **Status:** settled

One repository holds `packages/ui`, `packages/app` and `api/`.

**Why.** The brief requires `app` to use `ui` as a package. With workspaces,
`app` imports `ui` by name like any dependency, and `ui` stays editable in
place. Separate repositories would need publishing, which is not assessed.

**Considered.** Three repositories. A path dependency, rejected because it
invites imports into `ui`'s source, which the brief warns against.

---

## D-2 — npm workspaces rather than pnpm, Yarn or Turborepo

**Decided:** 2026-09-25 · **Status:** settled

**Why.** npm comes with Node, so reviewers install nothing extra. Three
packages do not need a task runner.

---

## D-3 — CSS Modules for styling

**Decided:** 2026-09-25 · **Status:** settled

**Why.** The library's styles must not clash with the app's, and the app must
not have to adopt a styling framework. CSS Modules make class names unique at
build time, with no runtime cost. The app imports one plain stylesheet.

**Considered.** Tailwind (the app must adopt it). CSS-in-JS (runtime cost and
an extra dependency). Global CSS with a naming rule (clashes are inevitable).

---

## D-4 — Tokens as `--ui-` prefixed CSS custom properties

**Decided:** 2026-09-25 · **Status:** settled

Every token-sheet value is a CSS variable in `packages/ui/src/tokens.css`.

**Why.** Each value is defined once and used by name, so new components match
automatically. The prefix avoids the app's own names. An app may redefine a
token to theme the library; overriding a component's styles stays forbidden.

**Considered.** Sass variables (compiled away, so not themeable). A
TypeScript token object (moves styling into code).

---

## D-5 — Class names scoped as `ui-[local]-[hash]`

**Decided:** 2026-09-25 · **Status:** settled

**Why.** The hash prevents clashes; the readable part makes classes easy to
find in browser devtools.

---

## D-6 — Vite for both packages, library mode for `ui`

**Decided:** 2026-09-25 · **Status:** settled

`ui` builds to an ES module, one stylesheet and type declarations, without
React inside.

**Why.** One tool for both packages, with CSS Modules built in. Leaving React
out stops the app loading two copies, which breaks React hooks.

---

## D-7 — `app` consumes the built `dist`, not the source

**Decided:** 2026-09-25 · **Status:** settled

`ui` exports only `dist/`, so it must be built before `app` runs.

**Why.** The brief requires it, and this enforces it: an import into
`ui/src` fails. The root script runs the build first.

---

## D-8 — Vitest and Testing Library

**Decided:** 2026-09-25 · **Status:** settled

**Why.** Vitest reuses the Vite config, so tests build code as the library
does. Testing Library steers tests towards behaviour, as the brief asks:
"tests that check behaviour rather than snapshot everything". There are no
snapshot tests.

---

## D-9 — React Router for the website

**Decided:** 2026-09-25 · **Status:** settled

Two routes: the patient list, and a patient by id.

**Why.** The detail page needs its own address, and Back must work like the
browser's. Hand-writing that is time spent on something not assessed.

**Amended 2026-10-01 (D-23).** A third route, `/patients/new`, holds the
Register patient page.

---

## D-10 — Dev-server proxy instead of a configurable API base URL

**Decided:** 2026-09-25 · **Status:** settled

The website calls `/api/...` on its own address, and the dev server forwards
it to `http://localhost:5080`.

**Why.** The API needs no cross-origin setup, the site needs no settings, and
client code holds no host or port.

---

## D-11 — A small purpose-built payload, not FHIR

**Decided:** 2026-09-25 · **Status:** settled

The shape is in `docs/API-CONTRACT.md`.

**Why.** FHIR (Fast Healthcare Interoperability Resources) is allowed but not assessed, and
its patient record is full of nesting the pages do not need. The payload keeps
what matters in health records: name parts, a structured address, and contact
fields that can be empty. Those give the mapping layer real work.

---

## D-12 — The API returns data, the website composes display strings

**Decided:** 2026-09-25 · **Status:** settled

The API sends name and address parts; the website's mapping module joins
them.

**Why.** The brief assesses whether that mapping is in one place and handles
missing fields. Formatting on the server would move it, and force one
presentation on every API user.

---

## D-13 — Missing values render as `—` in the component, not in the mapping

**Decided:** 2026-09-25 · **Status:** settled

The mapping passes `null` for a missing value, and `DescriptionList` draws
the dash.

**Why.** The component spec already defines the dash, and a second definition
could drift. The mapping decides *whether* a value is missing; the library
decides how missing *looks*.

**Amended 2026-09-29 (T-7.2).** `Table` shows cells as given, so a patient
with no phone had a blank cell. The mapping now writes a missing phone as `—`
in the list row (`toPatientRow`), as the library README advises. It is still
the one place that decides how missing values reach the screen.

---

## D-14 — Package names `ui` and `app`

**Decided:** 2026-09-25 · **Status:** settled

**Why.** The brief names them, so the docs' imports match what the reviewer
expects. A real product would use a scoped name like `@intrahealth/ui`.

---

## D-15 — Clickable Table rows keep the native row role

**Decided:** 2026-09-25 · **Status:** settled

A clickable row keeps its native row role rather than becoming a
`role="button"`. (First built as a focusable `<tr>` answering Enter and Space;
since T-7.10 a button in the first cell does that. See the amendment below.)

**Why.** Making a row a button stops screen readers moving through the table
by row and column. The row still works from the keyboard, as the spec
requires.

**Considered.** `role="button"` on the row (the first draft). A button in the
first cell (keeps both, but the consumer would have to say which cell).

**What would change it.** A need for screen readers to announce the row as
clickable.

**Amended 2026-09-29 (T-7.10).** That need arrived: a review found the row
was never announced as clickable. The first cell is now a real `<button>`,
and the whole row stays clickable. No prop was added: the button is always
in the first column, and the README says to put the record's name there.

---

## D-16 — Birth dates display as "2 Mar 1984"

**Decided:** 2026-09-25 · **Status:** settled

The mapping builds day, short month and year from the `YYYY-MM-DD` string.
Anything else passes through unchanged.

**Why.** A numeric date such as `02/03/1984` reads differently in Canada and
the US. A misread birth date is a safety risk. Reading the string's parts,
rather than converting to a date object, means the time zone can never shift
the day.

**Considered.** The raw `YYYY-MM-DD` string (clear, but reads as data). The
browser's date formatter (follows the locale, but brings back the time-zone
risk).

**What would change it.** A product locale setting, which would mean the
browser's formatter, pinned to one time zone.

---

## D-17 — Storybook for the component library

**Decided:** 2026-09-28 · **Status:** settled

Storybook 10, used only by `ui`, with a story file beside each component and
a story per variant and state. Stories never ship in `dist/`.

**Why.** It shows every state without running the API and site, styled
exactly as in an app. The design document counts it as usage examples;
`packages/ui/README.md` stays the reference.

**Considered.** Ladle (lighter, less familiar). A demo page in `app` (mixes
library states into the website).

**What would change it.** Interaction or visual tests in CI, which would
reuse the stories.

---

## D-18 — The API is tested in memory, through its real pipeline

**Decided:** 2026-09-28 · **Status:** settled

An xUnit project, `api/Intrahealth.Api.Tests`, starts the real API in memory
and sends it requests. Tests read the raw JSON.

**Why.** The contract is the JSON: its field names, nulls left in, and the 404
body. Converting back into the API's own types would hide mistakes in those.
In memory, the tests run the real routing with no port needed.

**Considered.** Testing only the search logic (misses routing and JSON). A
running server (needs a free port, adds nothing).

**What would change it.** A real database, which the tests would swap for a
test one.

---

## D-19 — Three colours depart from the brief to meet WCAG 2.2 AA

**Decided:** 2026-09-29 · **Status:** settled (owner's choice, grilling Q16)

The owner asked for the components to meet the Web Content Accessibility
Guidelines (WCAG) 2.2 at level AA. Three of the brief's colour pairings fail
its contrast rules, so those parts use other colours from the brief. The
token values are unchanged.

| Part | Brief | Measured | Now | Measured |
| --- | --- | --- | --- | --- |
| Table header text | color.text.muted on color.surface.subtle | 4.39:1 (text needs 4.5) | color.text | 15.8:1 |
| Text input border | color.border on white | 1.47:1 (needs 3) | color.text.muted | 4.83:1 |
| Focus ring (Button, table rows) | 2px color.focus, 2px offset | 1.80:1 (needs 3) | the same ring, plus a 2px color.primary ring outside it | 4.63:1 |

**Why.** It meets the standard without changing the brief's token sheet, and
each change is small.

**Considered.** Changing the token values (rewrites the brief's most exact
table). Listing the three as exceptions (fails the standard).

**What would change it.** A revised token sheet whose values pass.

---

## D-20 — Hosted as one container on Render's free tier

**Decided:** 2026-09-29 · **Status:** settled

One Docker image, run as a free Render web service (`render.yaml`). The API
serves the website at `/`, itself at `/api` and the docs at `/docs`.

**Why.** The owner asked for free hosting for all three. One address needs
no cross-origin setup or client change. Free static hosts cannot run the .NET
API; Render runs Docker for free.

**Considered.** A static host for the site and docs plus a separate API (two
services). Azure (more setup, and billing). Fly.io and Railway (no longer
free).

**What would change it.** Needing the API always awake. The free service
sleeps after 15 idle minutes and takes about a minute to wake.

---

## D-21 — Swagger docs for the API, under `/api/swagger`

**Decided:** 2026-10-01 · **Status:** settled

The API serves a Swagger page at `/api/swagger` to read and try each
endpoint, and its OpenAPI document at `/api/swagger/v1/swagger.json`. It is
on everywhere, hosting included.

**Why.** The owner asked for it. Under `/api` it works through the dev proxy
and the hosted container with no new routes. The data is invented, so there
is nothing to hide.

**Considered.** The OpenAPI document alone (no page to try endpoints).
`/swagger` (outside the proxied path, and caught by the hosted site).

**What would change it.** Real patient data, where it would run in
development only.

## D-22 — End-to-end tests with Playwright, against the real API

**Decided:** 2026-10-01 · **Status:** settled

Playwright drives both pages in a real browser against the real API and seed
data. Only the failure test fakes the network. Run with `npm run test:e2e`,
not `npm test`.

**Why.** The owner asked for behaviour tests of the pages. The `app` tests
use fake responses in a simulated browser; these add real routing, requests
and browser. They stay out of `npm test` because they need .NET and a browser
download.

**Considered.** Cypress (a second test runner). Vitest browser mode (cannot
start the API).

**What would change it.** A CI pipeline, which would run them on every push.

**Amended 2026-10-01 (D-24).** That pipeline exists: `npm run ci` ends with
them, and CI runs it on every push.

## D-23 — A third page: Register patient, tracked as GitHub issues

**Decided:** 2026-10-01 · **Status:** settled

A form at `/patients/new` that posts to a new `POST /api/patients`. It was
tracked as GitHub issues #1–#5 with the `github-task` skill, not in
`docs/TASKS.md`.

**Why.** The owner asked for a third page tracked as issues. A form uses the
states the other pages lack: TextField's error and helper text, and Button's
loading. The website checks the form for instant errors, and the API checks
again so it still refuses bad input.

**Gender is a TextField** checked against four values, because `ui` has no
select. Adding one is a sixth component, its own piece of work.

**New patients live in memory** and vanish on restart. On the public host,
anyone can add one.

**Considered.** An appointments list (no new component states). A summary
dashboard (only Cards).

**What would change it.** A select component in `ui`, which gender would
then use.

---

## D-24 — CI as Docker builds on GitHub Actions, one command locally

**Decided:** 2026-10-01 · **Status:** settled

`npm run ci` runs every check, test and build, end-to-end tests included.
`npm run ci:docker` runs it inside a Docker build (`Dockerfile.ci`), so it is
the whole continuous integration (CI) on any machine with Docker. GitHub
Actions runs that on every push and pull request to `main`. It also builds
the hosted image and scans the history for secrets with gitleaks.

**Why.** The owner asked for CI in Docker, run by one command. The build fails
when a check fails, so CI needs no scripts of its own. The same image runs
locally and on GitHub. A separate file keeps tests out of the hosted image.

**Considered.** Installing the tools with GitHub's setup actions (faster, but
differs from a local run). A test stage in the hosted `Dockerfile` (Render
would build it every deploy).

**What would change it.** CI becoming too slow, which would mean splitting it
into parallel jobs.

## D-25 — Lint that enforces the project's own rules

**Decided:** 2026-10-01 · **Status:** settled

`npm run lint` runs ESLint on the TypeScript, Stylelint on the CSS and
`dotnet format` on the API, and `npm run ci` runs it first. Warnings fail it.

**Why.** The owner asked for lint that makes sense here, so it enforces the
brief's rules, not a style guide:

- a hard-coded colour, spacing or font size fails Stylelint (rule 3);
- a deep import from `app` into `ui` fails ESLint (rule 1);
- jsx-a11y catches the accessibility mistakes a reviewer would (rule 5).

The rest is the recommended bug-finding sets. Only the C#, where
`dotnet format` is the standard tool, has its formatting checked.

**Considered.** Stylistic presets such as `stylelint-config-standard`
(dozens of findings about naming and ordering that no rule asks for), and
Prettier (a whole-repository reformat for no reviewer benefit). ESLint 10
(`eslint-plugin-jsx-a11y` does not support it yet, so ESLint 9).

**What would change it.** jsx-a11y supporting ESLint 10, or a rule the team
keeps disabling, which would mean the rule is wrong for this code.

## D-26 — CI deploys to Render once every check passes

**Decided:** 2026-10-01 · **Status:** settled

A Deploy job in `ci.yml` runs after the three checks, on pushes to `main`
only. It calls the service's Render deploy hook, kept in the GitHub secret
`RENDER_DEPLOY_HOOK_URL`. `render.yaml` turns Render's own deploy on push off.

**Why.** The owner asked for deploying in CI. Before, Render deployed every
push, even one that failed CI. Now a broken commit never goes live.

**Considered.** Render's `checksPass` trigger (same result, but the deploy is
not visible in CI). The Render API with an API key (can wait for the deploy to
finish, but needs a broader secret).

**What would change it.** Needing CI to fail when a deploy fails, which would
mean the Render API.
