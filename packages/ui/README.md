# `ui`

## Summary

React UI components that developers use to build applications for the
healthcare setting: the screens of an Electronic Health Record (EHR) system,
such as a clinic's patient list and a patient's record. Product teams assemble
them into their own apps, so every screen looks and behaves the same and is
accessible by default. You pick a component and a variant; the library owns
how it looks and behaves.

## Quick start

In this repository, build the library once:

```bash
npm install                    # at the root
npm run build --workspace ui   # builds packages/ui/dist
```

Then, in an app that depends on `ui`, import the stylesheet once at the root
and use the components:

```tsx
import 'ui/styles.css';
import { Button } from 'ui';

<Button onClick={() => console.log('saved')}>Save</Button>
```

To add `ui` to a new app, or to use it from another repository, see
[Install](#install). To browse every component with live demos, open the
[docs site](https://ui-components-package.onrender.com/docs/).

| Component | Use it for |
| --- | --- |
| [Button](#button) | Triggering an action. |
| [TextField](#textfield) | One line of text, with a label, a hint and an error. |
| [Card](#card) | Grouping related content under an optional title. |
| [Table](#table) | Many records as rows, optionally clickable. |
| [DescriptionList](#descriptionlist) | One record's details as label/value pairs. |

Read this file in the repository: its pictures, `src/` links and Storybook
commands don't work from the installed package.

For a browsable version, run `npm run docs` at the repository root and open
<http://localhost:6007>: one page per component with live demos and its
props, plus the design tokens. The [docs site README](./src/docs/README.md)
says how to share it.

## Tech stack

| Area | Built with |
| --- | --- |
| Components | React 19 (a peer dependency, not bundled) and TypeScript |
| Styling | CSS Modules; every value comes from a [token](#tokens) (a CSS custom property) |
| Build | Vite in library mode, plus `tsc` for the type declarations |
| Tests | Vitest and Testing Library |
| Docs | Storybook 10 |

## Contents

1. [Getting started](#getting-started)
   - [Install](#install)
   - [Use](#use)
2. [A real screen: patient lookup](#a-real-screen-patient-lookup)
3. [Styling](#styling)
   - [The contract](#the-contract)
   - [Tokens](#tokens)
4. [Accessibility](#accessibility)
5. [Component reference](#component-reference)
   - [Missing values: who draws the dash](#missing-values-who-draws-the-dash)
   - [Button](#button)
   - [TextField](#textfield)
   - [Card](#card)
   - [Table](#table)
   - [DescriptionList](#descriptionlist)
6. [Contributing: extending the library](#contributing-extending-the-library)
   - [Scaffold](#scaffold)
   - [Steps](#steps)
   - [Why it's short](#why-its-short)

---

## Getting started

### Install

Requires React 19 and React DOM 19 (peer dependencies; React is not bundled)
and a bundler that understands package `exports` and CSS imports, such as Vite.

The package is not on npm. `ui` resolves to the built files in `dist/`, so
build it before your app uses it.

**In this repository:** add your package's folder to `workspaces` in the root
`package.json` (otherwise npm fetches an unrelated public package called
`ui`), then depend on it:

```jsonc
// packages/your-app/package.json
"dependencies": {
  "ui": "*"
}
```

```bash
npm install                      # at the root; links the workspace
npm run build --workspace ui     # builds packages/ui/dist
```

**In another repository:** install a tarball.

```bash
npm run build --workspace ui
npm pack --workspace ui          # writes ui-0.1.0.tgz to this repository's root
# then, in your app:
npm install /absolute/path/to/this-repo/ui-0.1.0.tgz
```

After changing the library, rebuild it. `npm run dev --workspace ui` rebuilds
the JavaScript and CSS on save but not the type declarations; run the full
build when a prop or type changes.

### Use

Import the stylesheet once at your app's root, and components from `ui`:

```tsx
// main.tsx — your app's root
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'ui/styles.css';
import { App } from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```tsx
// App.tsx
import { useState } from 'react';
import { Button, Card, TextField } from 'ui';

export function App() {
  const [name, setName] = useState('');

  return (
    <Card title="Find a patient">
      <div style={{ display: 'grid', gap: 'var(--ui-space-3)', justifyItems: 'start' }}>
        <TextField label="Name" value={name} onChange={setName} />
        <Button onClick={() => console.log('search for', name)}>Search</Button>
      </div>
    </Card>
  );
}
```

- **Import only `'ui'` and `'ui/styles.css'`.** The `exports` map rejects other
  `ui/...` paths; never use a relative path into the library either.
- **The stylesheet holds component styles and [tokens](#tokens) only.** It
  doesn't style `body`, so set `font-family: var(--ui-font-family)` and
  `color: var(--ui-color-text)` on your page. Without it, components render as
  plain HTML.
- **Prop types are exported** (`ButtonProps` and so on); each Props section
  lists them.

---

## A real screen: patient lookup

All five components in one screen: search in a `Card`, results in a `Table`,
the chosen record in a `DescriptionList`. Run `npm run docs` at the
repository root and open **Examples / Patient lookup**. Search `lo` for
results, `zz` for none, `error` for a failure, or one letter for the
validation error; then click a row.

<img src="docs/examples/patient-lookup.png" alt="Patient lookup after searching &quot;lo&quot; and clicking Ada Lovelace: search card, results table, and her record in a description list" width="560">

- **The screen passes state; components render it.** `loading`,
  `errorMessage` and `emptyMessage` are all the screen sets.
- **One `primary` button.** Try again and Close are `secondary`, `sm`.
- **Missing values:** DescriptionList draws `—` itself; Table doesn't, so the
  screen maps a missing health card to `'—'`
  ([why](#missing-values-who-draws-the-dash)).
- **Layout is the screen's:** plain elements spaced with tokens. The `<div>`
  around Search stops it stretching across the grid.

A test keeps this listing identical to the story's source.

<!-- example:PatientLookup -->
```tsx
import { useState, type FormEvent } from 'react';
import { Button, Card, DescriptionList, Table, TextField, type TableRow } from 'ui';

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  healthCardNumber?: string;
  phone?: string;
}

const PATIENTS: Patient[] = [
  { id: 'p1', name: 'Ada Lovelace', dateOfBirth: '10 Dec 1985', healthCardNumber: '1234-567-890', phone: '555-0101' },
  { id: 'p2', name: 'Alan Turing', dateOfBirth: '23 Jun 1972', phone: '555-0102' },
  { id: 'p3', name: 'Grace Hopper', dateOfBirth: '9 Dec 1966', healthCardNumber: '9876-543-210' },
];

/** Stands in for a real API call: answers after a short delay, and fails for "error". */
function searchPatients(query: string): Promise<Patient[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (query.toLowerCase() === 'error') {
        reject(new Error('Search failed'));
      } else {
        resolve(PATIENTS.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase())));
      }
    }, 300);
  });
}

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'dateOfBirth', header: 'Date of birth' },
  { key: 'healthCardNumber', header: 'Health card' },
];

export function PatientLookup() {
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [results, setResults] = useState<Patient[] | null>(null);
  const [selected, setSelected] = useState<Patient | null>(null);

  async function search(event?: FormEvent) {
    event?.preventDefault();
    if (query.trim().length < 2) {
      setQueryError('Enter at least two characters.');
      return;
    }
    setQueryError('');
    setLoading(true);
    setFailed(false);
    setSelected(null);
    try {
      setResults(await searchPatients(query.trim()));
    } catch {
      setResults(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  // Table cells show exactly what they are given, so the screen decides how a
  // missing value reads. DescriptionList does this itself.
  const rows: TableRow[] = (results ?? []).map((patient) => ({
    id: patient.id,
    name: patient.name,
    dateOfBirth: patient.dateOfBirth,
    healthCardNumber: patient.healthCardNumber ?? '—',
  }));

  return (
    // Layout is the screen's job: plain elements, spaced with tokens. Widths
    // have no token; how wide a page is, is the page's decision.
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)', maxWidth: 720 }}>
      <Card title="Find a patient">
        <form onSubmit={search} style={{ display: 'grid', gap: 'var(--ui-space-3)' }}>
          <TextField
            label="Name"
            value={query}
            onChange={setQuery}
            placeholder="At least two letters, e.g. Lo"
            errorMessage={queryError}
          />
          <div>
            <Button type="submit" loading={loading}>
              Search
            </Button>
          </div>
        </form>
      </Card>

      {failed ? (
        <Card title="Results" actions={<Button variant="secondary" size="sm" onClick={() => search()}>Try again</Button>}>
          <p>The search failed. Try again, and if it keeps failing, check your connection.</p>
        </Card>
      ) : null}

      {results ? (
        <Card title="Results">
          <Table
            columns={columns}
            rows={rows}
            emptyMessage="No patients match that name"
            onRowClick={(row) => setSelected(results.find((patient) => patient.id === row.id) ?? null)}
          />
        </Card>
      ) : null}

      {selected ? (
        <Card
          title={selected.name}
          actions={<Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button>}
        >
          <DescriptionList
            items={[
              { label: 'Date of birth', value: selected.dateOfBirth },
              { label: 'Health card', value: selected.healthCardNumber },
              { label: 'Phone', value: selected.phone },
            ]}
          />
        </Card>
      ) : null}
    </div>
  );
}
```

---

## Styling

### The contract

- **You choose a variant or size; the library owns the appearance.** No
  component takes a colour, pixel value, `className` or `style` prop.
- **Spacing between components is yours.** Components have no outer margin;
  space them with tokens, such as `display: flex; gap: var(--ui-space-2)`.
- **Widths follow the container.** Table fills it; TextField, Card and Button
  stretch in a grid or flex column. Use `justifyItems: 'start'` or a wrapping
  `<div>` to keep natural width.
- **Internals are private.** Generated class names (`ui-button-BiD3F`) can
  change in any release; never target them.
- **Tokens are public.** Use them in your own CSS so pages share the
  components' scale.
- **Theme globally only:** redefine tokens on `:root` after `ui/styles.css`.
  Redefining them on a wrapper to recolour part of a page is not supported.

```css
/* Your app's own layout: tokens, not literals. */
.page {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-6);
  padding: var(--ui-space-8) var(--ui-space-4);
  font-family: var(--ui-font-family);
  color: var(--ui-color-text);
}
```

### Tokens

Every value is a CSS custom property on `:root`, defined once in
`src/tokens.css`. Use the custom property; the spec name is the design
document's name for it and is not valid CSS.

| Custom property | Spec name | Value | Used for |
| --- | --- | --- | --- |
| `--ui-color-primary` | color.primary | `#1F6FEB` | Primary button, focused input border, outer focus ring |
| `--ui-color-primary-hover` | color.primary.hover | `#185CC4` | Primary button hover |
| `--ui-color-danger` | color.danger | `#C93C37` | Error border and message |
| `--ui-color-text` | color.text | `#1A1A1A` | Body text, table header text |
| `--ui-color-text-muted` | color.text.muted | `#6B7280` | Labels, hints, placeholders, empty values, text input border |
| `--ui-color-border` | color.border | `#D1D5DB` | Borders, row dividers |
| `--ui-color-focus` | color.focus | `#93C5FD` | Focus ring |
| `--ui-color-surface` | color.surface | `#FFFFFF` | Card, input and secondary button background; primary button label |
| `--ui-color-surface-subtle` | color.surface.subtle | `#F3F4F6` | Table header, hovered rows, secondary button hover |
| `--ui-color-disabled-bg` | color.disabled.bg | `#E5E7EB` | Disabled background |
| `--ui-color-disabled-text` | color.disabled.text | `#9CA3AF` | Disabled text |
| `--ui-space-1` … `-8` | space.1 … space.8 | `4` `8` `12` `16` `24` `32px` (1, 2, 3, 4, 6, 8) | Padding and gaps |
| `--ui-radius-sm`, `-md` | radius.sm, radius.md | `4px`, `8px` | Buttons and inputs; cards |

Typography: each role has `-size`, `-line` and `-weight`, such as
`--ui-font-body-size`. The family is `--ui-font-family` (system UI).

| Role | Size / line | Weight | Used for |
| --- | --- | --- | --- |
| `--ui-font-body-*` | 14px / 20px | 400 | Input text, cells, values |
| `--ui-font-label-*` | 12px / 16px | 400 | Labels, hints, table headers |
| `--ui-font-button-*` | 14px / 20px | 600 | Button labels |
| `--ui-font-heading-*` | 20px / 28px | 600 | Card titles |
| `--ui-font-title-*` | 24px / 32px | 600 | Your page's `<h1>` |

Focus ring: a 2px ring in `--ui-color-focus`, with a 2px ring in
`--ui-color-primary` outside it, drawn `--ui-focus-ring-offset` (2px) out from
Button and a table row's button. TextField shows focus with a
`--ui-color-primary` border and a `--ui-color-focus` ring flush with it.

---

## Accessibility

The components meet the Web Content Accessibility Guidelines (WCAG) 2.2 at
level AA, the W3C's accessibility standard.

| Need | What the components do |
| --- | --- |
| Keyboard | Everything clickable works with Tab, Enter and Space. |
| Visible focus | Keyboard focus shows a light-blue ring with a blue ring outside it. |
| Contrast | Text is at least 4.5:1 against its background; borders and focus rings at least 3:1. |
| Labels | A TextField's label is tied to its input. An error is announced and marks the input invalid. |
| Screen readers | A loading Button is announced as busy and keeps focus. A clickable Table row is announced as a button. A missing value is read as "Not provided". A titled Card is a named region. |
| Disabled | Disabled controls are natively disabled: they can't be focused or used. |

Three colours differ from the design brief, to meet the contrast rule:

- table header text uses `--ui-color-text`;
- the text input border uses `--ui-color-text-muted`;
- focus adds the outer `--ui-color-primary` ring.

Your part, on each page:

- Give the page one `<h1>`, and place Cards under it.
- Announce loading and errors: `role="status"` on a loading message and
  `role="alert"` around an error, as the patient pages do.
- Don't show meaning by colour alone.

---

## Component reference

Each component has: When to use it, Example, Props, Behaviour, States, Source.
Examples run as written in an app that imports `ui/styles.css`; a test checks
each props table against the code. To see a state live, run `npm run docs`
and open the component's page; the Demo column names the section that shows
it (hover or tab to it for hover and focus states). Links
like `src/components/Button.tsx:38` point at the line that does what the
sentence says.

### Missing values: who draws the dash

| Component | Missing means | Shows | You do |
| --- | --- | --- | --- |
| `DescriptionList` | `null`, `undefined`, `''` | A muted `—` | Pass the value as it is. |
| `Table` | Nothing; cells render as given | An empty cell | Map missing values to `'—'` when building `rows`. |

`0` is shown in both. `false`, whitespace and `[]` render blank in both, so
convert booleans to text and trim strings first.

### Button

Triggers an action. Two variants, two sizes, built-in loading and disabled
states.

#### When to use it

For an action: save, search, submit, open a dialog. One `primary` per screen
or section; the rest `secondary`. Use `loading` during async work instead of
your own spinner.

**When not to:** to link out to another page (use `<a>`; an in-app Back
button is fine), or for an on/off setting (no toggle exists yet).

#### Example

```tsx
import { useState } from 'react';
import { Button } from 'ui';

export function SaveOrCancel() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    // Stand-in for a real request.
    setTimeout(() => setSaving(false), 1500);
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--ui-space-2)' }}>
      <Button variant="secondary" disabled={saving} onClick={() => console.log('cancelled')}>
        Cancel
      </Button>
      <Button loading={saving} onClick={save}>
        Save
      </Button>
    </div>
  );
}
```

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary'` | no | `'primary'` | Visual weight: `primary` for the main action, `secondary` for the rest. |
| `size` | `'sm' \| 'md'` | no | `'md'` | `sm` for dense places such as a card's title row. |
| `loading` | `boolean` | no | `false` | Spinner replaces the label; non-interactive; width unchanged. |
| `disabled` | `boolean` | no | `false` | Non-interactive, disabled colours. |
| `onClick` | `() => void` | no | — | Called on click, Enter or Space; never while `loading` or `disabled`. |
| `children` | `ReactNode` | yes | — | The label. |
| `type` | `'button' \| 'submit' \| 'reset'` | no | `'button'` | Native type. `'submit'` submits the surrounding form. |
| `aria-label` | `string` | no | — | Accessible name when the label alone is ambiguous (several "Edit" buttons). |

Types: `ButtonProps`, `ButtonVariant`, `ButtonSize`.

#### Behaviour

- `disabled` sets native `disabled`
  ([`src/components/Button.tsx:59`](src/components/Button.tsx#L59 "disabled={disabled}")): no click,
  no Tab, no keyboard activation.
- `loading` keeps the button focusable
  ([`src/components/Button.tsx:60`](src/components/Button.tsx#L60 "aria-disabled={loading || undefined}")) but
  ignores every activation, including submitting its form, so a keyboard user
  who pressed it keeps their place. It keeps the variant colours and
  accessible name and sets `aria-busy`
  ([`src/components/Button.tsx:61`](src/components/Button.tsx#L61 "aria-busy={loading || undefined}")).

#### States

| State | How | Looks like | Demo | Picture |
| --- | --- | --- | --- | --- |
| Primary | default | Blue fill, white label | Basic button | <img src="docs/states/button-primary.png" alt="Primary button" height="40"> |
| Primary, hover | pointer over it | Darker blue | Basic button (hover it) | <img src="docs/states/button-primary-hover.png" alt="Primary button, hovered" height="40"> |
| Focus | Tab to it | Light-blue ring with a blue ring outside it; not on mouse click | Basic button (tab to it) | <img src="docs/states/button-primary-focus.png" alt="Primary button with focus ring" height="40"> |
| Secondary | `variant="secondary"` | White, grey border, dark label | Variants | <img src="docs/states/button-secondary.png" alt="Secondary button" height="40"> |
| Secondary, hover | pointer over it | Light-grey fill | Variants (hover Cancel) | <img src="docs/states/button-secondary-hover.png" alt="Secondary button, hovered" height="40"> |
| Small | `size="sm"` | Less padding | Sizes | <img src="docs/states/button-small.png" alt="Small button" height="40"> |
| Loading | `loading` | Spinner, same width and colours | Loading | <img src="docs/states/button-loading.png" alt="Loading button with spinner" height="40"> |
| Disabled | `disabled` | Grey fill, grey label, no hover | Disabled | <img src="docs/states/button-disabled.png" alt="Disabled button" height="40"> |

#### Source

[`src/components/Button.tsx:26`](src/components/Button.tsx#L26 "export function Button({") ·
props [`src/components/Button.tsx:7`](src/components/Button.tsx#L7 "export interface ButtonProps {") ·
[`Button.module.css`](src/components/Button.module.css) ·
[`Button.test.tsx`](src/components/Button.test.tsx) ·
[`Button.stories.tsx`](src/components/Button.stories.tsx)

### TextField

A single-line input with a label above, an optional hint below, and an error
state. Controlled: you hold the value.

#### When to use it

For short free text: a name, a search term, an email. Set `errorMessage` on
submit when the value is wrong; clear it when the user edits.

**When not to:** multi-line text or a fixed set of choices (no textarea,
select or checkbox exists yet).

#### Example

```tsx
import { useState, type FormEvent } from 'react';
import { Button, TextField } from 'ui';

export function EmailForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes('@')) {
      setError('Enter an email address, like name@example.com');
      return;
    }
    console.log('save', email);
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 'var(--ui-space-3)', justifyItems: 'start' }}>
      <TextField
        label="Email"
        value={email}
        onChange={(next) => {
          setEmail(next);
          setError('');
        }}
        placeholder="name@example.com"
        helperText="Used for appointment reminders only."
        errorMessage={error}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
```

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes | — | Visible label, associated with the input. |
| `value` | `string` | yes | — | The current value. |
| `onChange` | `(value: string) => void` | yes | — | Called with the new string (not the event) on every keystroke. |
| `placeholder` | `string` | no | — | Example input. Not a substitute for the label. |
| `helperText` | `string` | no | — | Hint below the input; hidden while an error shows. |
| `errorMessage` | `string` | no | — | A non-empty string sets the error state; `''` or `undefined` clears it. |
| `disabled` | `boolean` | no | `false` | Non-interactive, disabled colours. |

Types: `TextFieldProps`.

#### Behaviour

- Always `type="text"`; no `name`, `required`, `autoComplete`, `onBlur`,
  `onKeyDown` or `ref`. Read the value from state. Enter in a `<form>`
  submits it.
- The label is tied to the input by a generated id
  ([`src/components/TextField.tsx:30`](src/components/TextField.tsx#L30 "const id = useId();")).
- An error replaces the hint
  ([`src/components/TextField.tsx:36`](src/components/TextField.tsx#L36 "const message = hasError ? errorMessage : helperText;")), is
  announced (`role="alert"`,
  [`src/components/TextField.tsx:60`](src/components/TextField.tsx#L60 "role={hasError ? 'alert' : undefined}")) and
  marks the input invalid.
- Disabled cannot be focused or typed in.

#### States

| State | How | Looks like | Demo | Picture |
| --- | --- | --- | --- | --- |
| Default | — | Grey label, white input, grey border | Basic text field | <img src="docs/states/textfield-default.png" alt="Text field, empty with placeholder" width="280"> |
| Focus | click or Tab in | Blue border and light-blue ring | Basic text field (tab to it) | <img src="docs/states/textfield-focus.png" alt="Text field with focus ring" width="280"> |
| With hint | `helperText` | Small grey text below | Helper text | <img src="docs/states/textfield-helper.png" alt="Text field with helper text" width="280"> |
| Error | non-empty `errorMessage` | Red border (also when focused), red message instead of the hint | Error | <img src="docs/states/textfield-error.png" alt="Text field in error state" width="280"> |
| Disabled | `disabled` | Grey fill, grey text | Disabled | <img src="docs/states/textfield-disabled.png" alt="Disabled text field" width="280"> |

#### Source

[`src/components/TextField.tsx:21`](src/components/TextField.tsx#L21 "export function TextField({") ·
props [`src/components/TextField.tsx:4`](src/components/TextField.tsx#L4 "export interface TextFieldProps {") ·
[`TextField.module.css`](src/components/TextField.module.css) ·
[`TextField.test.tsx`](src/components/TextField.test.tsx) ·
[`TextField.stories.tsx`](src/components/TextField.stories.tsx)

### Card

A bordered container with an optional title and optional actions on the
title's row.

#### When to use it

To group part of a page: a search form, a record's demographics, an error
message. The title names the group.

**When not to:** around a whole page, or inside another card.

#### Example

```tsx
import { Button, Card, DescriptionList } from 'ui';

export function AllergiesCard() {
  return (
    <Card
      title="Allergies"
      actions={
        <Button variant="secondary" size="sm" onClick={() => console.log('edit allergies')}>
          Edit
        </Button>
      }
    >
      <DescriptionList
        items={[
          { label: 'Penicillin', value: 'Rash, moderate' },
          { label: 'Latex', value: 'Contact dermatitis' },
        ]}
      />
    </Card>
  );
}
```

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | `string` | no | — | Plain-text heading. Omit for an untitled card. |
| `actions` | `ReactNode` | no | — | Right-aligned on the title row; usually `sm` Buttons. |
| `children` | `ReactNode` | yes | — | The body. |

Types: `CardProps`.

#### Behaviour

- A `<section>` whose title is always an `<h2>`; place Cards under your
  page's `<h1>`.
- With neither `title` nor `actions`, the title row is omitted
  ([`src/components/Card.tsx:15`](src/components/Card.tsx#L15 "const hasHeader = Boolean(title) || Boolean(actions);")). Actions sit
  right even without a title.

#### States

| State | How | Looks like | Demo | Picture |
| --- | --- | --- | --- | --- |
| Body only | no `title` or `actions` | White box, grey border, rounded, padded | Basic card | <img src="docs/states/card-body-only.png" alt="Card with body only" width="280"> |
| With title | `title` | Heading above the body | With a title | <img src="docs/states/card-title.png" alt="Card with a title" width="280"> |
| With actions | `title` and `actions` | Actions on the right of the title row | With actions | <img src="docs/states/card-title-actions.png" alt="Card with title and an Edit button" width="280"> |

#### Source

[`src/components/Card.tsx:14`](src/components/Card.tsx#L14 "export function Card({ title, actions, children }: CardProps") ·
props [`src/components/Card.tsx:5`](src/components/Card.tsx#L5 "export interface CardProps {") ·
[`Card.module.css`](src/components/Card.module.css) ·
[`Card.test.tsx`](src/components/Card.test.tsx) ·
[`Card.stories.tsx`](src/components/Card.stories.tsx)

### Table

A header row of column names and one row per record. Rows can be clickable;
a message shows when there are none.

#### When to use it

For many records of one shape that a user scans or picks from: patients,
medications, results.

**When not to:** for one record (use [DescriptionList](#descriptionlist)), for
layout, or when you need built-in sorting, paging or filtering (do those
before passing `rows`).

#### Example

```tsx
import { Table } from 'ui';
import type { TableColumn, TableRow } from 'ui';

const columns: TableColumn[] = [
  { key: 'medication', header: 'Medication' },
  { key: 'dose', header: 'Dose' },
  { key: 'frequency', header: 'Frequency' },
];

const rows: TableRow[] = [
  { id: 'rx-1', medication: 'Metformin', dose: '500 mg', frequency: 'Twice daily' },
  { id: 'rx-2', medication: 'Lisinopril', dose: '10 mg', frequency: 'Once daily' },
];

export function MedicationsTable() {
  return (
    <Table
      columns={columns}
      rows={rows}
      emptyMessage="No active medications"
      onRowClick={(row) => console.log('open prescription', row.id)}
    />
  );
}
```

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `columns` | `TableColumn[]` (each `{ key: string; header: string }`) | yes | — | In display order. `key` is looked up on each row and must be unique. |
| `rows` | `TableRow[]` (each `Record<string, ReactNode>`) | yes | — | One per record; each cell is `row[column.key]`. |
| `onRowClick` | `(row: TableRow) => void` | no | — | Makes rows clickable by mouse and keyboard; receives the whole row. |
| `emptyMessage` | `string` | no | `'No results'` | Shown when `rows` is empty. |

Types: `TableProps`, `TableColumn`, `TableRow`.

#### Behaviour

- With `onRowClick`, the first cell of each row becomes a button named by its
  content ([`src/components/Table.tsx:67`](src/components/Table.tsx#L67 "className={styles.rowButton}>")), so
  screen readers announce the row as actionable, and Tab, Enter and Space
  work. The whole row is also clickable
  ([`src/components/Table.tsx:59`](src/components/Table.tsx#L59 "onClick={isClickable ? () => onRowClick?.(row) : undefined}")); each
  activation calls `onRowClick` once. Put the column that names the record
  first. Each row is a Tab stop, so for long lists filter or paginate first.
- Keys no column names (like `id` above) stay on the row, unshown, and reach
  `onRowClick`. Values are `ReactNode`: narrow with
  `typeof row.id === 'string'`.
- Cells render as given; map missing values to `'—'`
  ([details](#missing-values-who-draws-the-dash)). Rows are keyed by position.

#### States

| State | How | Looks like | Demo | Picture |
| --- | --- | --- | --- | --- |
| Default | rows, no `onRowClick` | Light-grey header with dark text, hairline between rows; not focusable | Basic table | <img src="docs/states/table-default.png" alt="Table with three rows" width="280"> |
| Row hover | `onRowClick`, pointer over a row | Light-grey row, hand cursor | Clickable rows (hover a row) | <img src="docs/states/table-row-hover.png" alt="Table with a hovered row" width="280"> |
| Row focus | `onRowClick`, Tab to a row | Light-grey row, ring around the first cell's text | Clickable rows (tab to a row) | <img src="docs/states/table-row-focus.png" alt="Table with a focused row" width="280"> |
| Empty | `rows={[]}` | `emptyMessage`, centred, grey; not clickable | Empty state | <img src="docs/states/table-empty.png" alt="Empty table with message" width="280"> |

#### Source

[`src/components/Table.tsx:24`](src/components/Table.tsx#L24 "export function Table({") ·
props [`src/components/Table.tsx:13`](src/components/Table.tsx#L13 "export interface TableProps {") ·
[`Table.module.css`](src/components/Table.module.css) ·
[`Table.test.tsx`](src/components/Table.test.tsx) ·
[`Table.stories.tsx`](src/components/Table.stories.tsx)

### DescriptionList

Read-only label/value pairs, one per row, for a single record's details.

#### When to use it

For one record's fields: demographics, contact details. Usually inside a
[Card](#card) that names the group.

**When not to:** many records (use [Table](#table)) or editable fields (use
[TextField](#textfield)).

#### Example

```tsx
import { DescriptionList } from 'ui';

export function ContactDetails() {
  return (
    <DescriptionList
      items={[
        { label: 'Phone', value: '+1 416 555 0133' },
        { label: 'Email', value: null },
        { label: 'Preferred language', value: 'English' },
      ]}
    />
  );
}
```

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `DescriptionListItem[]` (each `{ label: string; value: ReactNode }`) | yes | — | The pairs, one row each, in order. |

Types: `DescriptionListProps`, `DescriptionListItem`.

#### Behaviour

- `null`, `undefined` and `''` render as a muted `—`
  ([`src/components/DescriptionList.tsx:21`](src/components/DescriptionList.tsx#L21 "function isEmpty(value: ReactNode): boolean {")).
  Pass values as they are; `0` shows, `false` and whitespace show blank.
- Labels are row keys, so keep them unique. Labels sit in a fixed 160px
  column.

#### States

| State | How | Looks like | Demo | Picture |
| --- | --- | --- | --- | --- |
| Default | all values present | Grey labels left, dark values right, hairlines between | Basic list | <img src="docs/states/descriptionlist-default.png" alt="Description list with three rows" width="280"> |
| Missing value | `null`, `undefined` or `''` | Grey `—`, read out as "Not provided" | Missing values | <img src="docs/states/descriptionlist-missing.png" alt="Description list with em dashes for missing values" width="280"> |

#### Source

[`src/components/DescriptionList.tsx:25`](src/components/DescriptionList.tsx#L25 "export function DescriptionList({ items }: DescriptionListPr") ·
props [`src/components/DescriptionList.tsx:16`](src/components/DescriptionList.tsx#L16 "export interface DescriptionListProps {") ·
[`DescriptionList.module.css`](src/components/DescriptionList.module.css) ·
[`DescriptionList.test.tsx`](src/components/DescriptionList.test.tsx) ·
[`DescriptionList.stories.tsx`](src/components/DescriptionList.stories.tsx)

---

## Contributing: extending the library

Run the scaffold, then replace its four files step by step; the steps build a
`Badge`, which is only an example and is not exported. Run commands from the repository root. House style:
`docs/CONVENTIONS.md`.

This README is tested (`src/readme.test.ts`): code links must still point at
the code in their title, linked files and pictures must exist, the contents
must match the headings, and props tables must match the code. If you move
linked code, update the link's line and title.

### Scaffold

```bash
npm run new-component --workspace ui -- Badge
```

```
src/components/Badge.tsx          the component
src/components/Badge.module.css   its styles, from tokens only
src/components/Badge.test.tsx     its behaviour tests
src/components/Badge.stories.tsx  its Storybook stories, one per variant and state
src/index.ts                      + export { Badge } and type { BadgeProps }
```

The name must be new and PascalCase
([`scripts/new-component.mjs:24`](scripts/new-component.mjs#L24 "if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) fail(`")). No
subfolders or barrel files in `components/`.

Until step 7, `npm run test --workspace ui` fails once, on purpose: Badge is
not documented yet. To test steps 1–5 alone, run
`npx vitest run src/components/Badge` from `packages/ui`.

### Steps

#### 1. Write the component

```tsx
// src/components/Badge.tsx
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'danger';

export interface BadgeProps {
  /** Colour meaning. `danger` for something that needs attention. */
  tone?: BadgeTone;
  /** The badge text. */
  children: ReactNode;
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={[styles.badge, styles[tone]].join(' ')}>{children}</span>;
}
```

- Named function export; props in an exported `<Name>Props` interface with a
  doc comment per prop.
- Union types, never `string`, for fixed sets; export the union.
- Defaults as literal destructuring defaults (`tone = 'neutral'`); the props
  test reads them.
- No colour, pixel, `className` or `style` props, and no `{...rest}` spread.

#### 2. Style it from tokens

```css
/* src/components/Badge.module.css */
.badge {
  display: inline-block;
  padding: 0 var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  font-family: var(--ui-font-family);
  font-size: var(--ui-font-label-size);
  line-height: var(--ui-font-label-line);
}

.neutral {
  background: var(--ui-color-surface-subtle);
  color: var(--ui-color-text);
}

.danger {
  background: var(--ui-color-danger);
  color: var(--ui-color-surface);
}
```

- Every value is a `var(--ui-…)` token. A literal (such as a `1px` hairline:
  there is no border-width token) needs a comment saying why. A value several
  components need becomes a new token in `src/tokens.css`.
- camelCase class names for the part (`.emptyValue`), not the look; no
  element selectors, no `:global`.
- Focus rings use the `--ui-focus-ring-*` tokens: `:focus-visible` on
  clickable things, as Button does
  ([`src/components/Button.module.css:18`](src/components/Button.module.css#L18 ".button:focus-visible {")),
  `:focus` on text inputs.

#### 3. Make it accessible

Associate labels with `useId`
([`src/components/TextField.tsx:30`](src/components/TextField.tsx#L30 "const id = useId();"));
make anything clickable reachable by Tab and activated by Enter and Space; use
native `disabled`; mark decorative parts `aria-hidden`. A Badge needs none of
these.

#### 4. Test its behaviour

```tsx
// src/components/Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its text', () => {
    render(<Badge tone="danger">Allergy</Badge>);

    expect(screen.getByText('Allergy')).toBeInTheDocument();
  });

  it('renders the tones differently from each other', () => {
    render(
      <>
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="danger">Danger</Badge>
      </>,
    );

    expect(screen.getByText('Neutral').className).not.toBe(screen.getByText('Danger').className);
  });
});
```

Vitest and Testing Library. Query as a user would (`getByRole`,
`getByLabelText`, `getByText`), assert behaviour, one behaviour per test, no
snapshots.

#### 5. Give it a story per state

```tsx
// src/components/Badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Allergy' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Danger: Story = {
  args: { tone: 'danger' },
};
```

The story test renders every story, so one that throws fails the tests.

Stories are the demos, not pages: Storybook runs in docs-only mode, so a
component appears in the sidebar only once it has a docs page. Add
`src/docs/Badge.mdx`, modelled on `src/docs/Button.mdx`: a title and one-line
description, a `<Canvas of={BadgeStories.Neutral} />` per state, the
design-token table, and `<ArgTypes of={BadgeStories} />` for the API.

#### 6. Export its types

Change the scaffold's second line in `src/index.ts` so the two read:

```ts
// src/index.ts
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeTone } from './components/Badge';
```

The entry-point test fails for any component not exported here.

#### 7. Document it here

Add a `### Badge` section after DescriptionList:

```md
### Badge

One sentence: what it is.

#### When to use it

When to use it, then **When not to:** with what to use instead.

#### Example

A complete component that uses it, importing from 'ui'.

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `tone` | `'neutral' \| 'danger'` | no | `'neutral'` | Colour meaning. `danger` for something that needs attention. |
| `children` | `ReactNode` | yes | — | The badge text. |

Types: `BadgeProps`, `BadgeTone`.

#### Behaviour

What it does for you, and its limits.

#### States

| State | How | Looks like | Demo | Picture |
| --- | --- | --- | --- | --- |

#### Source

Component, props, styles, tests and stories, as links.
```

The props test requires props in interface order, Required as `yes`/`no`, and
Default as the code literal in backticks (`` `'neutral'` ``) or `—`. Then:

1. Add Badge to the component table at the top.
2. Add `   - [Badge](#badge)` to the contents, after DescriptionList.
3. Add a `STATES` row per state in
   [`scripts/capture-states.mjs:21`](scripts/capture-states.mjs#L21 "const STATES = ["):
   `['badge-danger', 'components-badge--danger']` (image name, story id), plus
   `'hover'`, `'hover-row'` or `'tab'` for interaction states.
4. Run `npx playwright install chromium` once, then
   `npm run capture-states --workspace ui`.
5. Add the `<img>` cells last; the test fails on missing pictures.

#### 8. Check it

```bash
npm run typecheck --workspace ui        # types
npm run test --workspace ui             # behaviour, entry point, stories, README
npm run build --workspace ui            # the package consumers get
npm run build-storybook --workspace ui  # every story builds
```

### Why it's short

| Choice | What it saves you | Where |
| --- | --- | --- |
| Tokens defined once | You name a role, not a value; a token change reaches every component. | [`src/tokens.css:13`](src/tokens.css#L13 ":root {") |
| Hashed CSS Module class names | No collisions, no naming scheme; consumers can't depend on internals. | [`vite.config.ts:11`](vite.config.ts#L11 "generateScopedName: 'ui-[local]-[hash:base64:5]',") |
| One entry point behind `exports` | Two lines register a component; no consumer imports a file you might move. | [`src/index.ts:9`](src/index.ts#L9 "export { Button } from './components/Button';"), [`package.json:9`](package.json#L9 "exports") |
| Entry point imports the tokens | Every token lands in `ui.css`; a stylesheet uses them without importing. | [`src/index.ts:7`](src/index.ts#L7 "import './tokens.css';") |
| Tests discover components | Export, story and README checks cover a new component without test edits. | [`src/index.test.ts:6`](src/index.test.ts#L6 "import.meta.glob(['./components/*.tsx', '!./components/*.tes"), [`src/stories.test.tsx:9`](src/stories.test.tsx#L9 "const storyFiles = import.meta.glob<StoriesModule>('./**/*.s") |
| Storybook uses the library's Vite config | What you see in Storybook is what ships. | [`.storybook/main.ts:16`](.storybook/main.ts#L16 "framework: '@storybook/react-vite',"), [`.storybook/preview.ts:8`](.storybook/preview.ts#L8 "import '../src/tokens.css';") |
| React is external | A component adds only its own code. | [`vite.config.ts:23`](vite.config.ts#L23 "external: ['react', 'react-dom', 'react/jsx-runtime'],") |
| The scaffold | Files start in house style and pass all but the README test. | [`scripts/new-component.mjs:27`](scripts/new-component.mjs#L27 "const files = {") |
