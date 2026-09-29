# Decisions

A running log of the choices the brief left open, written as they are made.
`INTERVIEW.md` is assembled from this file rather than reconstructed from
memory at the end.

Each entry: what was decided, why, what else was considered, and what would
change the answer.

---

## D-1 — One repository with npm workspaces

**Decided:** 2026-09-25 · **Status:** settled

One repository containing all three packages: `packages/ui`, `packages/app`
and `api/`.

**Why.** The brief calls the choice explicitly unassessed, so the tie-breaker
is the constraint it does care about — `app` must consume `ui` as a package,
not as a folder of source files. Workspaces give that for free: `ui` is
installed into `node_modules` under its package name and imported like any
other dependency, while still being editable in place. Three repositories would
mean publishing to a registry or wiring `npm link`, and the brief says
publishing is not assessed either.

**Considered.** Three separate repositories; one repository with a path
dependency. The path dependency was rejected because it invites deep imports
into source, which is exactly what the brief warns against.

---

## D-2 — npm workspaces rather than pnpm, Yarn or Turborepo

**Decided:** 2026-09-25 · **Status:** settled

**Why.** It ships with the Node toolchain, needs no extra install step on a
reviewer's machine, and the repository has three packages and no build graph
worth orchestrating. A task runner would be weight with nothing to carry.

---

## D-3 — CSS Modules for styling

**Decided:** 2026-09-25 · **Status:** settled

**Why.** The library must ship styles that a consuming app cannot accidentally
target or collide with, and must not require the consumer to adopt a styling
framework. CSS Modules give locally scoped class names at build time with no
runtime and no peer dependency; the build emits one plain stylesheet the
consumer imports once. Combined with D-4, the token layer stays themeable while
component internals stay private.

**Considered.** Tailwind (forces the consumer to adopt the framework or ship a
large stylesheet), CSS-in-JS (runtime cost and an extra peer dependency), plain
global CSS with a naming convention (collides by construction).

---

## D-4 — Tokens as `--ui-` prefixed CSS custom properties

**Decided:** 2026-09-25 · **Status:** settled

Every token-sheet value is a custom property on `:root` in
`packages/ui/src/tokens.css`, imported by the package entry point.

**Why.** One definition per value, referenced by name everywhere, so a new
component matches the existing five by construction — which is what the
documentation's Styling section has to be able to promise. The `--ui-` prefix
keeps the library out of the consumer's namespace. Redefining a token on
`:root` after importing the stylesheet is a deliberate theming escape hatch,
distinct from overriding a component's styles, which stays forbidden.

**Considered.** Sass variables (compiled away, so nothing is themeable and
nothing is inspectable in devtools) and a TypeScript token object (would push
styling into JS and defeat D-3).

---

## D-5 — Class names scoped as `ui-[local]-[hash]`

**Decided:** 2026-09-25 · **Status:** settled

**Why.** The hash is what makes collisions impossible; the readable `local`
part is what makes the DOM debuggable in a reviewer's devtools. A pure hash
would be private but unreadable.

---

## D-6 — Vite for both packages, library mode for `ui`

**Decided:** 2026-09-25 · **Status:** settled

`ui` builds to an ES module plus a single stylesheet, with React marked
external and declarations emitted by `tsc`.

**Why.** One toolchain for both packages, CSS Modules supported natively, and
library mode produces exactly the artefacts a consumer needs. React is external
so the app never ends up with two copies of React — the classic way a workspace
library breaks hooks.

---

## D-7 — `app` consumes the built `dist`, not the source

**Decided:** 2026-09-25 · **Status:** settled

The `ui` package's `exports` map points at `dist/`, and `ui` must be built
before `app` runs.

**Why.** It is the constraint the brief states outright, and it makes the
constraint enforceable rather than a matter of discipline: a deep import into
`ui/src` does not resolve. The cost is a build step before `npm run dev`, which
the root script handles.

---

## D-8 — Vitest and Testing Library

**Decided:** 2026-09-25 · **Status:** settled

**Why.** Vitest reuses the existing Vite config, including the CSS Modules
setup, so tests run against the same transform pipeline as the build. Testing
Library pushes tests towards behaviour and accessible queries, which is what
the brief asks for — "tests that check behaviour rather than snapshot
everything". No snapshot tests will be written.

---

## D-9 — React Router for the website

**Decided:** 2026-09-25 · **Status:** settled

Two routes: the patient list, and a patient by id.

**Why.** The detail page must be reachable by id and the Back button must
behave like browser history. Hand-rolling that is a worse use of the time
budget than a dependency the brief explicitly does not assess.

---

## D-10 — Dev-server proxy instead of a configurable API base URL

**Decided:** 2026-09-25 · **Status:** settled

The website calls same-origin `/api/...`; Vite's dev server forwards `/api` to
`http://localhost:5080`.

**Why.** No CORS configuration in the API, no environment variable to set
before the site works, and no host or port anywhere in the client code. For a
mock API run locally, the proxy is the whole deployment story.

---

## D-11 — A small purpose-built payload, not FHIR

**Decided:** 2026-09-25 · **Status:** settled

See `docs/API-CONTRACT.md` for the shape.

**Why.** FHIR is permitted but explicitly not assessed, and a real FHIR
`Patient` resource would spend the reader's attention on nested arrays of
`HumanName` and `ContactPoint` that the two pages do not need. The payload
keeps the EHR-shaped parts that matter — separate name parts, a structured
address, genuinely nullable contact fields — because they are what gives the
website's mapping layer real work to do.

---

## D-12 — The API returns data, the website composes display strings

**Decided:** 2026-09-25 · **Status:** settled

No `name` or `displayAddress` field on the wire; the website joins name parts
and address parts in one mapping module.

**Why.** The brief assesses whether the API-to-display mapping is in one place
and handles missing fields. Formatting on the server would move that logic out
of the place being assessed and bake one presentation into an API that other
consumers would have to live with.

---

## D-13 — Missing values render as `—` in the component, not in the mapping

**Decided:** 2026-09-25 · **Status:** settled

The mapping layer passes `null` for a missing value; `DescriptionList` renders
the em dash.

**Why.** The component spec already defines the em dash, so putting it in the
mapping too would create two definitions of "missing" that could drift. The
mapping's job is to decide *whether* a value is missing; the library's job is
to decide what missing *looks like*.

**Amended 2026-09-29 (T-7.2).** That split holds for `DescriptionList`, which
draws the dash itself. `Table` renders cells exactly as given, so the list page
showed a blank Phone cell for a patient with no phone. The mapping module now
also builds the list row (`toPatientRow`) and spells a missing phone as `—`,
as the library README tells Table consumers to. The mapping module is still
the one place that decides how a missing value reaches the screen.

---

## D-14 — Package names `ui` and `app`

**Decided:** 2026-09-25 · **Status:** settled

**Why.** The brief names them. Unscoped bare names are unusual for a real
product — a real one would be `@intrahealth/ui` — but matching the brief keeps
every import in the documentation identical to the import the reviewer expects
to read. Noted here so the choice reads as deliberate rather than naive.

---

## D-15 — Clickable Table rows keep the native row role

**Decided:** 2026-09-25 · **Status:** settled

A clickable row is a `<tr>` with `tabIndex={0}` and Enter/Space handlers.
It does not take `role="button"`.

**Why.** `role="button"` on a `<tr>` replaces its row role, so its cells stop
being cells and a screen reader can no longer move through the table by row
and column. That trades the whole table's accessibility for one row's. With
the native role kept, the row is still reachable by Tab and activatable from
the keyboard, which is what the spec requires.

**Considered.** `role="button"` on the row (the first draft; breaks table
navigation), and a link or button inside the first cell (keeps both
semantics but changes the Table API, since the consumer would have to say
which cell holds it).

**What would change it.** A requirement for screen readers to announce the
row as actionable, which would favour the in-cell control.

**Amended 2026-09-29 (T-7.10).** That requirement arrived: a review against
the brief found the focusable `<tr>` was never announced as clickable. The
first cell of a clickable row is now a real `<button>` named by its content,
and the row keeps its native role and stays clickable as a whole. The API
objection above is met by convention rather than a prop: the button is always
in the first column, and the README tells consumers to put the column that
names the record first.

---

## D-16 — Birth dates display as "2 Mar 1984"

**Decided:** 2026-09-25 · **Status:** settled

Day, short month name, four-digit year, built from the parts of the
`YYYY-MM-DD` string in the mapping module. A value that is not a valid
`YYYY-MM-DD` passes through unchanged.

**Why.** The contract says "formatted for display" and leaves the format
open. A numeric form is ambiguous between the Canadian, American and ISO
readings of `02/03/1984`, and a clinician misreading a birth date is a real
safety problem. Reading the string's parts, rather than going through
`Date`, means the date can never shift by a day with the viewer's
timezone.

**Considered.** Showing the ISO string as-is (unambiguous but reads as data,
not as a date), and `Intl.DateTimeFormat` (locale-aware, but needs a `Date`,
which brings the timezone problem back unless every call is pinned to UTC).

**What would change it.** A product locale setting, at which point this
becomes `Intl.DateTimeFormat` with `timeZone: 'UTC'`.

---

## D-17 — Storybook for the component library

**Decided:** 2026-09-28 · **Status:** settled

Storybook 10 with the `@storybook/react-vite` framework, installed as a dev
dependency of `ui` only. One `Name.stories.tsx` beside each component, one
story per variant and state. Stories are excluded from the declaration build
and never reach `dist/`.

**Why.** It gives a place to see every state — hover, focus, error, loading,
disabled — without running the API and the site. The Vite framework reuses
`vite.config.ts`, so stories render with the same CSS Modules naming and the
same `tokens.css` a consumer gets. The design document counts Storybook as
usage examples, not documentation, so `packages/ui/README.md` stays the
reference.

**Considered.** Ladle (lighter, but a second, less familiar tool), and a demo
page in `app` (would mix library states into the website).

**What would change it.** Interaction or visual-regression tests in CI, at
which point the stories become the test fixtures via the Storybook Vitest
addon.

---

## D-18 — The API is tested in memory, through its real pipeline

**Decided:** 2026-09-28 · **Status:** settled

An xUnit project, `api/Intrahealth.Api.Tests`, hosts the real `Program` with
`WebApplicationFactory` and sends HTTP requests to it in memory. Tests read
the raw JSON rather than deserialising into `Patient`.

**Why.** The contract is the wire shape — camelCase names, nulls present
rather than omitted, the 404 ProblemDetails body — and deserialising into
the record the API serialised from would hide exactly those. In-memory
hosting runs the same routing and serialisation as `dotnet run` with no port
to allocate. The only change to the API is a `public partial class Program`
so the factory can see the entry point.

**Considered.** Unit-testing the search predicate alone (misses routing,
query binding and serialisation), and tests against a running server on
:5080 (needs orchestration and a free port, for no extra coverage).

**What would change it.** A real database, at which point the factory would
swap the data source for a test one.
