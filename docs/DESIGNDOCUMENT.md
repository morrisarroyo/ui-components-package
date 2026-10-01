# Design Document — UI Components Package

**Status:** authoritative design input for this project
**Last updated:** 2026-09-25

## 0. Provenance and reconciliation

Two copies of the brief were supplied in the repository root:

| File | Role |
| --- | --- |
| `Interview Task 006- Design System Components - Candidate Brief.md` | Authoritative source |
| `EKB-Interview Task 006_ Design System Components - Candidate Brief-260926-001343.pdf` | PDF export of the same brief |

The two were compared word by word. **They are the same document.** Every
difference found was an artefact of extracting text from the PDF (the
extractor splits the letter `b`, so "website" comes out as "we bsite") or
markdown table and bullet syntax that has no equivalent in the PDF's flowed
text. The token values, the five prop tables, the page behaviours, the
deliverables list and the assessment criteria are identical in both. The PDF
contains nothing the markdown does not.

This document is the reconciled, restructured design input that the build
works from. Where the brief left a decision open, the choice is recorded in
`docs/DECISIONS.md` rather than invented here.

## 1. What is being built

A healthcare software company (Intrahealth) builds an EHR system. The frontend
team maintains a React design system that several product teams consume. This
project delivers a small, real slice of that world:

1. **`ui`** — a React + TypeScript component library of five components.
2. **Documentation** inside `ui`, good enough that a developer who has never
   seen the library can build a new page without reading the source.
3. **`app`** — a React + TypeScript website of two pages (patient list,
   patient detail) built *only* from `ui` components and plain layout markup.
4. **`api`** — a C# ASP.NET Core mock API serving invented patient data.

The scope is deliberately small: five components built carefully, documented
well, proven by two pages, backed by an API returning fake data.

### Architecture

A single repository with npm workspaces:

```
/                       root workspace
  packages/ui           the component library (built, then consumed as a package)
  packages/app          the website (depends on `ui` by package name)
  api/                  the ASP.NET Core mock API
  docs/                 project documents (this file, tasks, contract, decisions)
```

The hard constraint from the brief: `app` consumes `ui` **as a package, not as
a folder of source files**. `app` imports from the `ui` entry point only — no
deep imports into `ui/src`, and no overriding of `ui` styles.

## 2. Token sheet

Every value below is defined once, in `packages/ui/src/tokens.css`, as a CSS
custom property, and referenced by name from component stylesheets. No
component hard-codes a colour, a spacing value or a font size.

### Colour

| Token | Value | CSS custom property |
| --- | --- | --- |
| color.primary | `#1F6FEB` | `--ui-color-primary` |
| color.primary.hover | `#185CC4` | `--ui-color-primary-hover` |
| color.danger | `#C93C37` | `--ui-color-danger` |
| color.text | `#1A1A1A` | `--ui-color-text` |
| color.text.muted | `#6B7280` | `--ui-color-text-muted` |
| color.border | `#D1D5DB` | `--ui-color-border` |
| color.focus | `#93C5FD` | `--ui-color-focus` |
| color.surface | `#FFFFFF` | `--ui-color-surface` |
| color.surface.subtle | `#F3F4F6` | `--ui-color-surface-subtle` |
| color.disabled.bg | `#E5E7EB` | `--ui-color-disabled-bg` |
| color.disabled.text | `#9CA3AF` | `--ui-color-disabled-text` |

### Spacing

| Token | Value | CSS custom property |
| --- | --- | --- |
| space.1 | `4px` | `--ui-space-1` |
| space.2 | `8px` | `--ui-space-2` |
| space.3 | `12px` | `--ui-space-3` |
| space.4 | `16px` | `--ui-space-4` |
| space.6 | `24px` | `--ui-space-6` |
| space.8 | `32px` | `--ui-space-8` |

### Radius

| Token | Value | CSS custom property |
| --- | --- | --- |
| radius.sm | `4px` | `--ui-radius-sm` |
| radius.md | `8px` | `--ui-radius-md` |

### Typography

Each role is a size, a line height and a weight. Weight is 400 unless the
token sheet states otherwise.

| Token | Value | CSS custom properties |
| --- | --- | --- |
| font.body | 14px / 20px | `--ui-font-body-size`, `--ui-font-body-line`, `--ui-font-body-weight` |
| font.label | 12px / 16px | `--ui-font-label-size`, `--ui-font-label-line`, `--ui-font-label-weight` |
| font.button | 14px / 20px, weight 600 | `--ui-font-button-size`, `--ui-font-button-line`, `--ui-font-button-weight` |
| font.heading | 20px / 28px, weight 600 | `--ui-font-heading-size`, `--ui-font-heading-line`, `--ui-font-heading-weight` |
| font.title | 24px / 32px, weight 600 | `--ui-font-title-size`, `--ui-font-title-line`, `--ui-font-title-weight` |

The focus ring is specified identically for every focusable component — 2px
outline in color.focus, 2px offset — so it is also a token
(`--ui-focus-ring-width`, `--ui-focus-ring-offset`).

## 3. Component specifications

Five components, each exported from the `ui` package entry point.

### 3.1 Button

A clickable button that triggers an action. Two visual styles (primary for the
main action on a screen, secondary for everything else), two sizes, and can
show that it is busy or unavailable.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary"` | No | `"primary"` |
| `size` | `"sm" \| "md"` | No | `"md"` |
| `loading` | `boolean` | No | `false` |
| `disabled` | `boolean` | No | `false` |
| `onClick` | `() => void` | No | — |
| `children` | `ReactNode` | Yes | — |

Behaviour:

- **Primary:** color.primary background, white text, color.primary.hover on hover.
- **Secondary:** color.surface background, color.border border, color.text text,
  color.surface.subtle on hover.
- **Sizes:** `sm` — space.1 vertical padding, space.3 horizontal. `md` — space.2
  vertical, space.4 horizontal. Both radius.sm, font.button.
- **Loading:** a spinner replaces the label, the button is non-interactive, and
  **the width does not change**.
- **Disabled:** color.disabled.bg background, color.disabled.text text,
  non-interactive.
- **Focus:** 2px outline in color.focus, 2px offset.

"Non-interactive" means genuinely disabled — not clickable, not activatable
from the keyboard — not merely styled to look unavailable.

### 3.2 TextField

A single-line text input with a label above it. It can show a short hint below
the input, or an error message when the value is invalid.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `string` | Yes | — |
| `value` | `string` | Yes | — |
| `onChange` | `(value: string) => void` | Yes | — |
| `placeholder` | `string` | No | — |
| `helperText` | `string` | No | — |
| `errorMessage` | `string` | No | — |
| `disabled` | `boolean` | No | `false` |

Behaviour:

- Label above the input in font.label, color.text.muted, space.1 gap.
- Input: space.2 vertical padding, space.3 horizontal, color.border border,
  radius.sm, font.body.
- **Focus:** border becomes color.primary, 2px outline in color.focus.
- Helper text below the input in font.label, color.text.muted, space.1 gap.
- **Error state:** the field is in error state when `errorMessage` is provided
  and not empty. The border becomes color.danger and the message is shown below
  the input in color.danger, **replacing** the helper text. Otherwise the field
  is not in error state and the helper text, if provided, shows.
- **Disabled:** color.disabled.bg background, color.disabled.text text.
- The label **must** be associated with the input.

### 3.3 Card

A bordered container that groups related content on a page. Optional title at
the top and an optional slot on the same row for buttons; whatever is placed
inside becomes the body.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `string` | No | — |
| `actions` | `ReactNode` | No | — |
| `children` | `ReactNode` | Yes | — |

Behaviour:

- color.surface background, color.border border, radius.md, space.6 padding.
- Title in font.heading at the top, actions right-aligned on the same row,
  space.4 gap below the row.

### 3.4 Table

A data table: a header row of column names and one body row per record. Rows
can optionally be clickable, and it shows a message when there are no rows.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `columns` | `{ key: string; header: string }[]` | Yes | — |
| `rows` | `Record<string, ReactNode>[]` | Yes | — |
| `onRowClick` | `(row) => void` | No | — |
| `emptyMessage` | `string` | No | `"No results"` |

Behaviour:

- Header row: font.label, color.text.muted, color.surface.subtle background.
- Body rows: font.body, space.3 vertical padding, space.4 horizontal,
  color.border bottom border.
- Row hover **when `onRowClick` is set**: color.surface.subtle background,
  pointer cursor.
- Empty state: `emptyMessage` centred in color.text.muted with space.8 vertical
  padding.

A clickable row must also be operable from the keyboard; a row that only
responds to a mouse fails the "accessible by default" bar the brief sets.

### 3.5 DescriptionList

A read-only list of label/value pairs, one per row, for showing the details of
a single record. The read-only counterpart to a form.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `{ label: string; value: ReactNode }[]` | Yes | — |

Behaviour:

- One row per item: label in font.label, color.text.muted, **fixed width
  160px**; value in font.body, color.text, to its right.
- space.3 vertical gap between rows, color.border bottom border on each row
  **except the last**.
- An item whose value is empty, `null`, or `undefined` renders the value as
  `—` (em dash) in color.text.muted.

## 4. Documentation requirements (graded as carefully as the code)

The documentation lives **in the `ui` package**. It must let a developer who
has never seen the library build a new page without reading the source or
asking anyone. Required sections:

1. **Getting started** — how to install and consume `ui` from another package
   or repo.
2. **Styling** — how the token sheet values are defined and used, so a new
   component can match the existing ones.
3. **Component reference** — for each component: a props table (name, type,
   default, description), one usage example, and a short note on when to use it
   and when not to.
4. **Contributing** — how to add a sixth component so it fits with the existing
   five (file layout, export, styling, tests).

Two failure modes are called out explicitly and both count against the work:
**undocumented props**, and **documented props that do not exist**. Usage
examples must be runnable as written.

Storybook or similar is optional and counts as usage examples, not as
documentation on its own.

## 5. Page specifications

`app` is built only from `ui` components and plain layout markup. It imports
from the `ui` entry point, does not override `ui` styles, and does not import
from inside the `ui` package.

### 5.1 Page 1 — Patient List

A clinic staff member opens the site and sees a list of patients.

- Page title: **"Patients"**.
- At the top, a `Card` containing a single search field and a Search button.
- Below it, a `Table` of patients with columns **Name, Gender, Birth date,
  Phone**.
- On open, the list loads from the API. While it loads the user sees
  **"Loading…"** instead of the Table.
- The user types part of a name and clicks Search; the Table updates to show
  only matching patients. While the search runs, the Search button shows its
  loading state. **Search runs on the button click**; pressing Enter in the
  field is not required.
- No matches: the Table shows **"No patients match your search"**.
- API unreachable: the user sees a `Card` titled **"Something went wrong"**
  instead of the Table.
- Clicking a patient row opens Page 2 for that patient.

### 5.2 Page 2 — Patient Detail

- A **Back** button returns to Page 1. The page is titled with the patient's
  full name.
- A `Card` titled **"Demographics"** shows a `DescriptionList` with **Name,
  Gender, Birth date, Phone, Email, Address**.
- While the patient loads, the user sees **"Loading…"**.
- A missing value (for example a patient with no email) displays as **`—`**,
  not blank and not "undefined".
- Patient does not exist: a `Card` titled **"Patient not found"** and the Back
  button.

### 5.3 Page 3 — Register patient

Added after delivery at the owner's request; not in the brief. It exercises
TextField's error and helper states and Button's loading state, which the
first two pages barely use.

- Opened from a **"Register patient"** button on Page 1. Route
  `/patients/new`, titled **"Register patient"**.
- Two `Card`s of `TextField`s: **Patient** (given name, family name, gender,
  birth date) and **Contact** (phone, email, street address, city, province
  or state, postal code — all optional). **Register** and **Cancel** buttons.
- Register checks the form first. Each invalid field shows its own error and
  nothing is sent. Editing a field clears its error.
- While saving, Register shows its loading state and keeps focus.
- Success opens Page 2 for the new patient. An API failure shows a `Card`
  titled **"Something went wrong"** and keeps what was typed.
- Cancel returns to Page 1.

Layout, routing, and how the pages talk to the API are open choices — see
`docs/DECISIONS.md`.

## 6. The mock API

A C# ASP.NET Core project serving the patient data the website needs.
In-memory invented data, no database, no authentication. Endpoint design is
open; FHIR is permitted but FHIR conformance is explicitly not assessed.

The endpoints, the patient payload and the error behaviour are specified in
`docs/API-CONTRACT.md`, which is the single contract both `app` and `api`
are written against.

## 7. Deliverables

| # | Deliverable | Where it lives |
| --- | --- | --- |
| 1 | The code: library, website, API, each runnable with a documented command | this repo |
| 2 | Process record: the tickets written up front, and the AI harness | `docs/TASKS.md`, `CLAUDE.md`, `.claude/` |
| 3 | Tests, if written | alongside the code in each package |
| 4 | Library documentation | `packages/ui/README.md` |
| 5 | Project README, written as if the project were real | `README.md` |
| 6 | Interview notes: decisions, process and AI usage, what two more hours would buy | `INTERVIEW.md` |
| 7 | Pre-recorded walkthrough, 15–20 minutes | recorded separately, not in the repo |

Deliverable 2 asks for the `.claude` folder, skills and agent configuration to
be pushed up. They are not to be git-ignored.

Deliverable 6 must include **at least one thing that had to be checked or
corrected** in the AI tooling's output — a genuine one, recorded when it
happens rather than reconstructed at the end.

## 8. Assessment areas

Depth matters more than breadth. The work is assessed in four areas:

1. **Documentation and communication.** Could a developer build a *third* page
   from the documentation alone? Does the documentation match the code exactly?
   Are the usage examples runnable as written?
2. **Library design.** Union types rather than `string` for `variant` and
   `size`. Token sheet values used where the spec says. Label, focus, disabled
   and loading behaviours actually implemented, not only styled. A single clean
   entry point.
3. **Consumption and integration.** `app` uses only the `ui` entry point, with
   no style overrides and no deep imports. The pages reuse the components as
   specified rather than introducing one-off markup that should have been a
   component. The API-to-display mapping is **in one place** and handles missing
   fields. Search, navigation, loading and error handling work as specified
   against the running API.
4. **Process, testing and repo hygiene.** The process record shows how the work
   was broken down and in what order, **and matches what the commit history
   shows**. Tests check behaviour rather than snapshotting everything. The
   commit history is readable. Each package runs with its documented command.

Suggested test coverage, from the brief: Button variants and disabled state,
TextField error state, Table empty state, DescriptionList rendering `—` for a
missing value, and Page 1 rendering the Table from a mocked list response.

## 9. Explicitly out of scope

The brief states these are **not** evaluated, and time spent on them is time
taken from what is:

- Visual polish beyond what the spec describes
- Animation or transitions
- Responsive or mobile layout
- One repo or several, or which styling library, router or workspace tool
- FHIR conformance or FHIR knowledge
- Publishing the library to a registry

Anything the spec does not mention is not required, and any reasonable choice
is fine.

## 10. Constraints and budget

- The library and the website **must** be React and TypeScript.
- The API **must** be C# on ASP.NET Core.
- Everything else — styling approach, test runner, build tooling, routing,
  .NET version, minimal API or controllers — is an open choice.
- Time budget: roughly 4 hours of build time, plus a 15–20 minute recording.
- Anything that fights back gets time-boxed, with a note in `INTERVIEW.md`.
