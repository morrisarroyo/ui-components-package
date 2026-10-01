# Design Document — UI Components Package

**Status:** authoritative design input for this project
**Last updated:** 2026-09-25

## 0. Provenance and reconciliation

The spec for the build, reconciled from the brief in the repository root.
The brief comes in two copies:

| File | Role |
| --- | --- |
| `Interview Task 006- Design System Components - Candidate Brief.md` | Authoritative source |
| `EKB-Interview Task 006_ Design System Components - Candidate Brief-260926-001343.pdf` | PDF export of the same brief |

Compared word by word, **they are the same document**. The only differences
are PDF text-extraction errors ("website" becomes "we bsite") and Markdown
formatting. Choices the brief leaves open are in `docs/DECISIONS.md`.

## 1. What is being built

Intrahealth builds an electronic health record (EHR) system. Its frontend team
maintains a React design system that several product teams use. This project
is a small slice of it:

1. **`ui`**: a React + TypeScript library of five components.
2. **Documentation** in `ui` that lets a newcomer build a page without reading
   the source.
3. **`app`**: a React + TypeScript website of two pages (patient list, patient
   detail), built *only* from `ui` components and plain layout markup.
4. **`api`**: a mock API in ASP.NET Core (the C# web framework) serving
   invented patient data.

Scope is small on purpose: depth over breadth.

### Architecture

One repository with npm workspaces:

```
/                       root workspace
  packages/ui           the component library (built, then consumed as a package)
  packages/app          the website (depends on `ui` by package name)
  api/                  the ASP.NET Core mock API
  docs/                 project documents (this file, tasks, contract, decisions)
```

Hard rule: `app` uses `ui` **as a package, not as a folder of source files**.
It imports only from the `ui` entry point and never overrides `ui` styles.

## 2. Token sheet

Each value is defined once, as a CSS custom property in
`packages/ui/src/tokens.css`. Components use it by name, never a hard-coded
colour, spacing or font size.

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

Each role has a size, line height and weight. Weight is 400 unless stated.

| Token | Value | CSS custom properties |
| --- | --- | --- |
| font.body | 14px / 20px | `--ui-font-body-size`, `--ui-font-body-line`, `--ui-font-body-weight` |
| font.label | 12px / 16px | `--ui-font-label-size`, `--ui-font-label-line`, `--ui-font-label-weight` |
| font.button | 14px / 20px, weight 600 | `--ui-font-button-size`, `--ui-font-button-line`, `--ui-font-button-weight` |
| font.heading | 20px / 28px, weight 600 | `--ui-font-heading-size`, `--ui-font-heading-line`, `--ui-font-heading-weight` |
| font.title | 24px / 32px, weight 600 | `--ui-font-title-size`, `--ui-font-title-line`, `--ui-font-title-weight` |

The focus ring (2px outline in color.focus, 2px offset) is shared by every
focusable component, so it is a token too: `--ui-focus-ring-width`,
`--ui-focus-ring-offset`.

## 3. Component specifications

Five components, each exported from the `ui` entry point.

### 3.1 Button

Triggers an action. Primary for a screen's main action, secondary for the
rest.

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
- **Secondary:** color.surface background, color.border border, color.text
  text, color.surface.subtle on hover.
- **Sizes:** `sm` has space.1 vertical and space.3 horizontal padding; `md` has
  space.2 and space.4. Both use radius.sm and font.button.
- **Loading:** a spinner replaces the label, the button is non-interactive, and
  **the width does not change**.
- **Disabled:** color.disabled.bg background, color.disabled.text text,
  non-interactive.
- **Focus:** 2px outline in color.focus, 2px offset.

"Non-interactive" means truly disabled: no click and no keyboard activation,
not only a disabled look.

### 3.2 TextField

A single-line input with a label above and a hint or error below.

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

- Label above the input: font.label, color.text.muted, space.1 gap.
- Input: space.2 vertical and space.3 horizontal padding, color.border border,
  radius.sm, font.body.
- **Focus:** border turns color.primary; 2px outline in color.focus.
- Helper text below the input: font.label, color.text.muted, space.1 gap.
- **Error state:** when `errorMessage` is non-empty, the border turns
  color.danger and the message shows below in color.danger, **replacing** the
  helper text. Otherwise the helper text shows, if given.
- **Disabled:** color.disabled.bg background, color.disabled.text text.
- The label **must** be associated with the input.

### 3.3 Card

A bordered container for related content: optional title, optional buttons on
the title row, and its children as the body.

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

A header row and one row per record. Rows can be clickable; a message shows
when there are none.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `columns` | `{ key: string; header: string }[]` | Yes | — |
| `rows` | `Record<string, ReactNode>[]` | Yes | — |
| `onRowClick` | `(row) => void` | No | — |
| `emptyMessage` | `string` | No | `"No results"` |

Behaviour:

- Header row: font.label, color.text.muted, color.surface.subtle background.
- Body rows: font.body, space.3 vertical and space.4 horizontal padding,
  color.border bottom border.
- Row hover, **only when `onRowClick` is set**: color.surface.subtle
  background, pointer cursor.
- Empty state: `emptyMessage` centred in color.text.muted, space.8 vertical
  padding.

A clickable row must also work from the keyboard; mouse-only fails the brief's
"accessible by default" bar.

### 3.5 DescriptionList

Label/value pairs, one per row, showing one record's details: the read-only
counterpart to a form.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `{ label: string; value: ReactNode }[]` | Yes | — |

Behaviour:

- One row per item: label in font.label, color.text.muted, **fixed width
  160px**; value to its right in font.body, color.text.
- space.3 vertical gap between rows; color.border bottom border on every row
  **except the last**.
- An empty, `null` or `undefined` value renders as `—` (em dash) in
  color.text.muted.

## 4. Documentation requirements (graded as carefully as the code)

The documentation lives **in the `ui` package**. A newcomer must be able to
build a page from it without the source or help. Required sections:

1. **Getting started:** how to install and use `ui` from another package or
   repo.
2. **Styling:** how tokens are defined and used, so new components match.
3. **Component reference:** for each component, a props table (name, type,
   default, description), one usage example, and when to use it and when not.
4. **Contributing:** how to add a sixth component that fits (file layout,
   export, styling, tests).

**Undocumented props** and **documented props that do not exist** both count
against the work. Usage examples must run as written. Storybook is optional
and counts as usage examples, not documentation.

## 5. Page specifications

`app` uses only `ui` components and plain layout markup. It imports from the
`ui` entry point and never overrides `ui` styles.

### 5.1 Page 1 — Patient List

Clinic staff open the site and see a list of patients.

- Page title: **"Patients"**.
- At the top, a `Card` with one search field and a Search button.
- Below it, a `Table` of patients with columns **Name, Gender, Birth date,
  Phone**.
- On open, the list loads from the API, with **"Loading…"** in place of the
  Table until it arrives.
- Typing part of a name and clicking Search shows only matching patients. The
  Search button shows its loading state meanwhile.
- **Search runs on the button click.** Enter need not search.
- No matches: the Table shows **"No patients match your search"**.
- API unreachable: a `Card` titled **"Something went wrong"** shows in place
  of the Table.
- Clicking a patient row opens Page 2 for that patient.

### 5.2 Page 2 — Patient Detail

- A **Back** button returns to Page 1. The page title is the patient's full
  name.
- A `Card` titled **"Demographics"** holds a `DescriptionList` with **Name,
  Gender, Birth date, Phone, Email, Address**.
- While the patient loads, **"Loading…"** shows.
- A missing value (say, no email) shows as **`—`**, never blank or
  "undefined".
- Patient does not exist: a `Card` titled **"Patient not found"**, plus the
  Back button.

### 5.3 Page 3 — Register patient

Not in the brief; added after delivery at the owner's request. It exercises
TextField's error and helper states and Button's loading state.

- Opened from a **"Register patient"** button on Page 1. Route
  `/patients/new`, titled **"Register patient"**.
- Two `Card`s of `TextField`s:
  - **Patient:** given name, family name, gender, birth date.
  - **Contact** (all optional): phone, email, street address, city, province
    or state, postal code.
- **Register** and **Cancel** buttons.
- Register validates first: each invalid field shows its error and nothing is
  sent. Editing a field clears its error.
- While saving, Register shows its loading state and keeps focus.
- Success opens Page 2 for the new patient.
- An API failure shows a `Card` titled **"Something went wrong"** and keeps
  what was typed.
- Cancel returns to Page 1.

Layout, routing and how pages call the API are open choices; see
`docs/DECISIONS.md`.

## 6. The mock API

An ASP.NET Core project serving invented patient data from memory: no
database, no authentication. Endpoint design is open. FHIR (Fast Healthcare
Interoperability Resources, the healthcare data standard) is allowed but not
assessed.

Endpoints, payload and errors are in `docs/API-CONTRACT.md`, the contract both
`app` and `api` follow.

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

- **Deliverable 2:** commit the `.claude` folder, skills and agent
  configuration; don't git-ignore them.
- **Deliverable 6:** include **at least one real thing in the AI's output that
  had to be checked or corrected**, recorded when it happened.

## 8. Assessment areas

Depth beats breadth. Four areas are assessed:

1. **Documentation and communication.**
   - Could a developer build a *third* page from the docs alone?
   - Do the docs match the code exactly?
   - Do the usage examples run as written?
2. **Library design.**
   - Union types, not `string`, for `variant` and `size`.
   - Token values used where the spec says.
   - Label, focus, disabled and loading behaviours work, not only look
     right.
   - One clean entry point.
3. **Consumption and integration.**
   - `app` uses only the `ui` entry point: no style overrides, no deep imports.
   - Pages reuse components as specified, not one-off markup.
   - The API-to-display mapping is **in one place** and handles missing
     fields.
   - Search, navigation, loading and errors work as specified against the
     running API.
4. **Process, testing and repo hygiene.**
   - The process record shows how and in what order the work was split, **and
     matches the commit history**.
   - Tests check behaviour rather than snapshotting everything.
   - The commit history is readable.
   - Each package runs with its documented command.

Suggested tests, from the brief:

- Button variants and disabled state
- TextField error state
- Table empty state
- DescriptionList rendering `—` for a missing value
- Page 1 rendering the Table from a mocked list response

## 9. Explicitly out of scope

**Not** assessed, per the brief; time spent here is taken from what is:

- Visual polish beyond the spec
- Animation or transitions
- Responsive or mobile layout
- One repo or several, or which styling library, router or workspace tool
- FHIR conformance or FHIR knowledge
- Publishing the library to a registry

Anything the spec doesn't mention is not required; any reasonable choice is
fine.

## 10. Constraints and budget

- The library and website **must** be React and TypeScript.
- The API **must** be C# on ASP.NET Core.
- Everything else is open: styling approach, test runner, build tooling,
  routing, .NET version, minimal API or controllers.
- Time budget: about 4 hours of building, plus a 15–20 minute recording.
- Anything that fights back gets time-boxed, with a note in `INTERVIEW.md`.
