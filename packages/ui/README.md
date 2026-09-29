# `ui`

React components for the EHR product suite: five components, one entry point,
one stylesheet. You pick a component and its variant; the library decides how
it looks and behaves in every state.

| Component | Use it for |
| --- | --- |
| [Button](#button) | Triggering an action. |
| [TextField](#textfield) | Entering a single line of text, with a label, a hint and an error. |
| [Card](#card) | Grouping related content under an optional title. |
| [Table](#table) | Showing many records as rows, optionally clickable. |
| [DescriptionList](#descriptionlist) | Showing one record's details as label/value pairs. |

Start with [Getting started](#getting-started), then
[the patient lookup](#a-real-screen-patient-lookup), which uses all five.

Read this file in the repository. The installed package includes it, but its
pictures, its links into `src/` and its Storybook commands work only here.

## Contents

1. [Getting started](#getting-started)
   - [Requirements](#requirements)
   - [Install](#install)
   - [Use](#use)
2. [A real screen: patient lookup](#a-real-screen-patient-lookup)
3. [Styling](#styling)
   - [The contract](#the-contract)
   - [Tokens](#tokens)
4. [Component reference](#component-reference)
   - [Missing values: who draws the dash](#missing-values-who-draws-the-dash)
   - [Button](#button)
   - [TextField](#textfield)
   - [Card](#card)
   - [Table](#table)
   - [DescriptionList](#descriptionlist)
5. [Contributing: extending the library](#contributing-extending-the-library)
   - [Start with the scaffold](#start-with-the-scaffold)
   - [1. Write the component](#1-write-the-component)
   - [2. Style it from tokens](#2-style-it-from-tokens)
   - [3. Make it accessible](#3-make-it-accessible)
   - [4. Test its behaviour](#4-test-its-behaviour)
   - [5. Give it a story per state](#5-give-it-a-story-per-state)
   - [6. Export its types](#6-export-its-types)
   - [7. Document it here](#7-document-it-here)
   - [8. Check it](#8-check-it)
   - [Why adding a component is this short](#why-adding-a-component-is-this-short)

---

## Getting started

### Requirements

- **React 19** and **React DOM 19**, as peer dependencies. React is not bundled
  into the library; it runs on your app's copy.
- A bundler that understands package `exports` and CSS imports: Vite,
  webpack 5, or anything equivalent.

### Install

The package is not on npm. Build the library before your app uses it: the
name `ui` resolves to the built files in `dist/`.

**In this repository**, first make your package a workspace: add its folder
(for example `"packages/your-app"`) to `workspaces` in the root
`package.json`. Without that, npm fetches an unrelated public package that is
also called `ui`. Then add the library to your package's dependencies; for a
workspace, the version `"*"` makes npm link this library instead of
downloading one:

```jsonc
// packages/your-app/package.json
"dependencies": {
  "ui": "*"
}
```

Then, at the repository root:

```bash
npm install                      # links the workspace
npm run build --workspace ui     # builds packages/ui/dist, which your app imports
```

**In another repository**, build a tarball and install that:

```bash
# at this repository's root
npm run build --workspace ui
npm pack --workspace ui          # writes ui-0.1.0.tgz to the repository root

# in your app
npm install /absolute/path/to/this-repo/ui-0.1.0.tgz
```

**After changing the library**, rebuild it: your app only sees what is in
`dist/`. While you work on it, `npm run dev --workspace ui` rebuilds the
JavaScript and CSS on save. It does not rebuild the type declarations, so when
a prop or a type changes, run `npm run build --workspace ui` as well. A tarball
install has to be packed and installed again.

### Use

You import from the library in two places: `ui/styles.css` once, in your app's
root file, and components from `ui` wherever you use them.

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

Four rules for using it:

- **The stylesheet holds the component styles and the tokens, nothing else.**
  Tokens are CSS custom properties such as `--ui-space-3`; use them for your
  own spacing and colours, as the examples below do ([Tokens](#tokens)). The
  stylesheet does not style `body`: set `font-family: var(--ui-font-family)`
  and `color: var(--ui-color-text)` on your page yourself.
- **Forget the stylesheet, and the components render as unstyled HTML.** They
  still work; they just look like plain browser controls.
- **Import only from `'ui'` and `'ui/styles.css'`.** The package's `exports`
  map rejects any other `ui/...` path, such as `ui/src/...` or `ui/dist/...`.
  It cannot stop a relative path like `../ui/src/...`, so never write one.
- **Prop types are exported too.** `ui` exports each component's prop types,
  such as `ButtonProps`, for typing your own wrappers. Each Props section lists
  them after its table.

---

## A real screen: patient lookup

This screen uses all five components together: a search form in a `Card`,
results in a `Table`, and the chosen record in a `DescriptionList`. Each
loading, validation, empty and failure case is handled by the component that
owns it, not by the screen.

Run `npm run storybook` from this repository's root and open
**Examples / Patient lookup**. Search
`lo` for results, `zz` for none, `error` for a failed request, or a single
letter for the validation error, then click a row.

<img src="docs/examples/patient-lookup.png" alt="Patient lookup after searching &quot;lo&quot; and clicking Ada Lovelace: search card, results table, and her record in a description list" width="560">

What to notice:

- **The screen holds the data; the components hold the states.** The screen
  never styles a loading button, a focused row or an error border. It passes
  `loading`, `errorMessage` or `emptyMessage`, and the component does the rest.
- **One `primary` button.** Search is the screen's main action. Try again and
  Close are `secondary` and `sm` because they sit in a card's title row.
- **Missing values.** `DescriptionList` draws `—` for a missing value itself;
  `Table` prints cells exactly as given, so the screen maps a missing health
  card to `'—'` when it builds the rows. See
  [Missing values](#missing-values-who-draws-the-dash).
- **Layout is yours.** The `div` and `form` elements with grid styles are the
  screen's own layout, spaced with tokens. They position the components; they
  never restyle them. Widths have no token, so the page's maximum width is a
  plain number, and the bare `<div>` around Search stops the button
  stretching across the grid.

This listing is the story's source, apart from the import path, and a test
fails if the two drift apart.

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

- **You choose a variant or a size; the library owns the appearance.** No
  component takes a colour, a pixel value, a `className` or a `style` prop.
- **Spacing between components is yours.** Components have no outer margin.
  Wrap them in your own elements and space them with tokens, for example
  `display: flex; gap: var(--ui-space-2)`.
- **Widths follow the container.** Table fills its container. TextField, Card
  and Button stretch to fill a grid cell or a flex column. To keep one at its
  natural width, set `justifyItems: 'start'` on the grid, as Getting started
  does, or wrap it in a plain `<div>`, as the patient lookup does with Search.
- **Component internals are private.** Class names are generated at build time
  (`ui-button-BiD3F`) and are not a stable API: any release can change them. Do not target them, and do not
  write selectors that reach inside a component.
- **Tokens are public.** Every colour, spacing, radius and type value is a CSS
  custom property on `:root`, defined once and shipped in `ui/styles.css`. Use
  them in your own layout CSS too, so a page sits on the same scale as the
  components.
- **Theme with tokens, globally only.** Redefine tokens on `:root` in a
  stylesheet loaded after `ui/styles.css`, and every component follows.
  Redefining them on a wrapper element to recolour one part of a page is
  restyling a component, which is not supported.

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

In CSS, use the custom property: `var(--ui-color-primary)`. The dotted spec
name (`color.primary`) is only for matching against the design specification;
it is not valid CSS.

**Colour**

| Custom property | Spec name | Value | Used for |
| --- | --- | --- | --- |
| `--ui-color-primary` | color.primary | `#1F6FEB` | Primary buttons, focused input border |
| `--ui-color-primary-hover` | color.primary.hover | `#185CC4` | Primary button hover |
| `--ui-color-danger` | color.danger | `#C93C37` | Error border and message |
| `--ui-color-text` | color.text | `#1A1A1A` | Body text |
| `--ui-color-text-muted` | color.text.muted | `#6B7280` | Labels, helper text, placeholders, table headers, empty values and the empty-table message |
| `--ui-color-border` | color.border | `#D1D5DB` | Borders and row dividers |
| `--ui-color-focus` | color.focus | `#93C5FD` | Focus ring |
| `--ui-color-surface` | color.surface | `#FFFFFF` | Card and input background, primary button label |
| `--ui-color-surface-subtle` | color.surface.subtle | `#F3F4F6` | Table header, hovered rows and secondary buttons |
| `--ui-color-disabled-bg` | color.disabled.bg | `#E5E7EB` | Disabled background |
| `--ui-color-disabled-text` | color.disabled.text | `#9CA3AF` | Disabled text |

**Spacing and radius**

| Custom property | Spec name | Value |
| --- | --- | --- |
| `--ui-space-1` | space.1 | `4px` |
| `--ui-space-2` | space.2 | `8px` |
| `--ui-space-3` | space.3 | `12px` |
| `--ui-space-4` | space.4 | `16px` |
| `--ui-space-6` | space.6 | `24px` |
| `--ui-space-8` | space.8 | `32px` |
| `--ui-radius-sm` | radius.sm | `4px` |
| `--ui-radius-md` | radius.md | `8px` |

**Typography**

Each role is three properties: a size, a line height and a weight.

| Role | Size | Line height | Weight | Used for |
| --- | --- | --- | --- | --- |
| body | `--ui-font-body-size` (`14px`) | `--ui-font-body-line` (`20px`) | `--ui-font-body-weight` (400) | Input text, table cells, values |
| label | `--ui-font-label-size` (`12px`) | `--ui-font-label-line` (`16px`) | `--ui-font-label-weight` (400) | Field labels, hints, table headers |
| button | `--ui-font-button-size` (`14px`) | `--ui-font-button-line` (`20px`) | `--ui-font-button-weight` (600) | Button labels |
| heading | `--ui-font-heading-size` (`20px`) | `--ui-font-heading-line` (`28px`) | `--ui-font-heading-weight` (600) | Card titles |
| title | `--ui-font-title-size` (`24px`) | `--ui-font-title-line` (`32px`) | `--ui-font-title-weight` (600) | No component; use it for your page's `<h1>` |

The font stack is `--ui-font-family`, the platform's system UI font.

**Focus ring**

Every focusable component draws its focus ring in
`--ui-color-focus`, `--ui-focus-ring-width` (`2px`) wide. Button draws it
`--ui-focus-ring-offset` (`2px`) outside its border; TextField draws it flush
with its border; a clickable table row draws it just inside the row.

---

## Component reference

Each component has the same sections, in the same order: When to use it,
Example, Props, Behaviour, States and Source.

- **Examples** run as written in an app that imports `ui/styles.css`.
- **Props tables** list every prop and nothing else; a test checks them
  against the code.
- **States:** to see one live, run `npm run storybook` from the repository
  root and open the story named in the States table. Hover and focus states
  appear when you hover over, or tab to, the component in that story.
- **Links** such as `src/components/Button.tsx:38` point at the library
  source, at the line that does what the sentence says.

### Missing values: who draws the dash

Two components show data that can be missing, and they handle it differently:

| Component | What counts as missing | What it shows | What you do |
| --- | --- | --- | --- |
| `DescriptionList` | Exactly `null`, `undefined` and `''` | A muted `—` | Pass the value as it is. Do not draw the dash yourself. |
| `Table` | Nothing: cells render exactly as given | `null`, `undefined` and `''` show an empty cell | Map a missing value to `'—'` when you build `rows`, as the [patient lookup](#a-real-screen-patient-lookup) does. |

`0` is a value in both, and is shown. Neither component treats `false`, a
whitespace-only string or an empty array as missing: they render blank, with
no dash. Convert booleans to text and trim strings before you pass them.

### Button

A clickable button that triggers an action. Two visual weights, two sizes, and
built-in busy and unavailable states.

#### When to use it

For an action: save, search, submit, open a dialog. Use one `primary` button
per screen or section, for the action the user most likely wants, and make the
rest `secondary`. While an asynchronous action runs, set `loading` rather than
disabling the button and adding a spinner of your own.

**When not to:**

- To go to another page. Use a link, so it can open in a new tab and reads as
  navigation to assistive technology.
- For an on/off setting. The library has no toggle yet; that would be a new
  component.

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
| `variant` | `'primary' \| 'secondary'` | no | `'primary'` | Visual weight. `primary` is the main action on a screen; everything else is `secondary`. |
| `size` | `'sm' \| 'md'` | no | `'md'` | Height and padding. `sm` for dense places, such as a card's title row. |
| `loading` | `boolean` | no | `false` | Shows a spinner in place of the label and makes the button non-interactive. The width does not change. |
| `disabled` | `boolean` | no | `false` | Makes the button non-interactive and renders it in the disabled colours. |
| `onClick` | `() => void` | no | — | Called on click, Enter or Space. Never called while `loading` or `disabled`. |
| `children` | `ReactNode` | yes | — | The button's label. |
| `type` | `'button' \| 'submit' \| 'reset'` | no | `'button'` | Native button type. Use `'submit'` to submit a surrounding `<form>`; the default never submits one by accident. |
| `aria-label` | `string` | no | — | Accessible name, for when the visible label is not descriptive enough (for example, several "Edit" buttons on one page). |

Types: `ButtonProps`, `ButtonVariant` (the `variant` union), `ButtonSize` (the
`size` union).

#### Behaviour

- **Loading and disabled are real.** Both set the native `disabled` attribute
  ([`src/components/Button.tsx:38`](src/components/Button.tsx#L38 "const isInteractive = !loading && !disabled;")), so the
  button cannot be clicked, reached with Tab or activated from the keyboard.
- **Loading keeps its look and its name.** A loading button keeps its variant
  colours and its accessible name, and sets `aria-busy`
  ([`src/components/Button.tsx:52`](src/components/Button.tsx#L52 "aria-busy={loading || undefined}")).
- **Loading takes focus away.** Because a loading button is genuinely
  disabled, a button that had keyboard focus loses it when loading starts.
  Button takes no `ref`, so you cannot refocus it. When the action finishes,
  move focus to what it produced, such as the result's heading, so keyboard
  users are not left at the top of the page.
- **It never submits a form by accident.** The default `type` is `'button'`.

#### States

| State | How you get it | What it looks like | Storybook | Picture |
| --- | --- | --- | --- | --- |
| Primary | `variant="primary"` (the default) | Solid blue (`--ui-color-primary`) with a white label. | Components / Button / Primary | <img src="docs/states/button-primary.png" alt="Primary button" height="40"> |
| Primary, hover | Pointer over an enabled primary button | A darker blue (`--ui-color-primary-hover`). | Components / Button / Primary (hover it) | <img src="docs/states/button-primary-hover.png" alt="Primary button, hovered" height="40"> |
| Focus | Tab to the button | A light-blue ring (`--ui-color-focus`) a little outside the border. Keyboard focus only; a mouse click shows no ring. | Components / Button / Primary (tab to it) | <img src="docs/states/button-primary-focus.png" alt="Primary button with focus ring" height="40"> |
| Secondary | `variant="secondary"` | White with a grey border (`--ui-color-border`) and a dark label. | Components / Button / Secondary | <img src="docs/states/button-secondary.png" alt="Secondary button" height="40"> |
| Secondary, hover | Pointer over an enabled secondary button | A light-grey fill (`--ui-color-surface-subtle`). | Components / Button / Secondary (hover it) | <img src="docs/states/button-secondary-hover.png" alt="Secondary button, hovered" height="40"> |
| Small | `size="sm"` | Less padding; the same text size. | Components / Button / Small | <img src="docs/states/button-small.png" alt="Small button" height="40"> |
| Loading | `loading` | A spinner replaces the label; the width and colours stay the same. | Components / Button / Loading | <img src="docs/states/button-loading.png" alt="Loading button with spinner" height="40"> |
| Disabled | `disabled` | Grey fill and grey label (`--ui-color-disabled-bg`, `--ui-color-disabled-text`); no hover change. | Components / Button / Disabled | <img src="docs/states/button-disabled.png" alt="Disabled button" height="40"> |

#### Source

Component [`src/components/Button.tsx:26`](src/components/Button.tsx#L26 "export function Button({") ·
props [`src/components/Button.tsx:7`](src/components/Button.tsx#L7 "export interface ButtonProps {") ·
styles [`Button.module.css`](src/components/Button.module.css) ·
tests [`Button.test.tsx`](src/components/Button.test.tsx) ·
stories [`Button.stories.tsx`](src/components/Button.stories.tsx)

### TextField

A single-line text input with a label above it, an optional hint below it, and
an error state. The field is controlled: you hold the value in state and pass
it back in.

#### When to use it

For short free text: a name, a search term, an email, a phone number. Set
`errorMessage` when the user submits a value that is wrong, and clear it when
they edit the value.

**When not to:**

- For multi-line text, or for choosing from a fixed set of values. The library
  has no textarea, select or checkbox yet; those would be new components, not
  TextField options.

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
| `label` | `string` | yes | — | Visible label, rendered above the input and associated with it. |
| `value` | `string` | yes | — | The current value. |
| `onChange` | `(value: string) => void` | yes | — | Called with the new value on every keystroke. Receives the string, not the event. |
| `placeholder` | `string` | no | — | A short example of the expected input. Not a substitute for the label. |
| `helperText` | `string` | no | — | A hint below the input. Hidden while an error is showing. |
| `errorMessage` | `string` | no | — | An error to show below the input. A non-empty string puts the field in its error state; `undefined` or `''` clears it. |
| `disabled` | `boolean` | no | `false` | Makes the input non-interactive and renders it in the disabled colours. |

Types: `TextFieldProps`.

#### Behaviour

- **There are no other input attributes.** The input is always `type="text"`,
  with no `name`, `required`, `autoComplete`, `onBlur`, `onKeyDown` or `ref`.
  Validate on submit and read the value from your state, not from the form.
  Pressing Enter inside a `<form>` submits it, as in the example.
- **The label is wired to the input** by a generated id
  ([`src/components/TextField.tsx:30`](src/components/TextField.tsx#L30 "const id = useId();")).
  Clicking the label focuses the input, screen readers announce it, and two
  fields on one page never share an id.
- **An error replaces the hint** rather than stacking under it
  ([`src/components/TextField.tsx:36`](src/components/TextField.tsx#L36 "const message = hasError ? errorMessage : helperText;")). It
  is announced (`role="alert"`,
  [`src/components/TextField.tsx:60`](src/components/TextField.tsx#L60 "role={hasError ? 'alert' : undefined}")), and
  the input is marked invalid and described by it.
- **Disabled is real.** The input cannot be focused or typed in, and Tab skips
  it.

#### States

| State | How you get it | What it looks like | Storybook | Picture |
| --- | --- | --- | --- | --- |
| Default | No `errorMessage`, not `disabled` | A grey label above a white input with a grey border; the placeholder is grey. | Components / TextField / Default | <img src="docs/states/textfield-default.png" alt="Text field, empty with placeholder" width="280"> |
| Focus | Click or Tab into the input | Blue border (`--ui-color-primary`) plus a light-blue ring (`--ui-color-focus`). | Components / TextField / Default (tab to it) | <img src="docs/states/textfield-focus.png" alt="Text field with focus ring" width="280"> |
| With hint | `helperText` | The hint in small grey text under the input. | Components / TextField / With Helper Text | <img src="docs/states/textfield-helper.png" alt="Text field with helper text" width="280"> |
| Error | A non-empty `errorMessage` | Red border (`--ui-color-danger`), also while focused, and the message in red where the hint was. | Components / TextField / With Error | <img src="docs/states/textfield-error.png" alt="Text field in error state" width="280"> |
| Disabled | `disabled` | Grey fill and grey text (`--ui-color-disabled-bg`, `--ui-color-disabled-text`). | Components / TextField / Disabled | <img src="docs/states/textfield-disabled.png" alt="Disabled text field" width="280"> |

#### Source

Component [`src/components/TextField.tsx:21`](src/components/TextField.tsx#L21 "export function TextField({") ·
props [`src/components/TextField.tsx:4`](src/components/TextField.tsx#L4 "export interface TextFieldProps {") ·
styles [`TextField.module.css`](src/components/TextField.module.css) ·
tests [`TextField.test.tsx`](src/components/TextField.test.tsx) ·
stories [`TextField.stories.tsx`](src/components/TextField.stories.tsx)

### Card

A bordered container that groups related content on a page, with an optional
title and an optional place for actions on the title's row.

#### When to use it

To group a part of a page that belongs together: a search form, a record's
demographics, an error message that replaces a section. The title names what
is in it.

**When not to:**

- Around a whole page. If everything is in cards, nothing is grouped.
- Inside another card. Two borders around one group add no meaning; use a
  second card beside the first instead.

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
| `title` | `string` | no | — | Heading shown at the top of the card. Plain text only. Omit it for an untitled container. |
| `actions` | `ReactNode` | no | — | Controls shown right-aligned on the title row, usually `sm` Buttons. |
| `children` | `ReactNode` | yes | — | The card's body. |

Types: `CardProps`.

#### Behaviour

- **It is a `<section>`, and its title is always an `<h2>`.** There is no
  heading-level prop, so place Cards directly under your page's `<h1>` to keep
  the heading outline correct.
- **The title row only exists when it has something in it.** With neither
  `title` nor `actions` it is left out
  ([`src/components/Card.tsx:14`](src/components/Card.tsx#L14 "const hasHeader = Boolean(title) || Boolean(actions);")), so an
  untitled card has no gap above its body. With `actions` but no `title`, the
  actions still sit on the right.

#### States

A Card has no interactive states. Only its title row changes, and the props
you pass decide how.

| State | How you get it | What it looks like | Storybook | Picture |
| --- | --- | --- | --- | --- |
| Body only | No `title`, no `actions` | A white box with a grey hairline border, rounded corners and generous padding. | Components / Card / Default | <img src="docs/states/card-body-only.png" alt="Card with body only" width="280"> |
| With title | `title` | A heading above the body, with space between the two. | Components / Card / With Title | <img src="docs/states/card-title.png" alt="Card with a title" width="280"> |
| With title and actions | `title` and `actions` | The actions on the right of the title's row. | Components / Card / With Title And Actions | <img src="docs/states/card-title-actions.png" alt="Card with title and an Edit button" width="280"> |

#### Source

Component [`src/components/Card.tsx:13`](src/components/Card.tsx#L13 "export function Card({ title, actions, children }: CardProps") ·
props [`src/components/Card.tsx:4`](src/components/Card.tsx#L4 "export interface CardProps {") ·
styles [`Card.module.css`](src/components/Card.module.css) ·
tests [`Card.test.tsx`](src/components/Card.test.tsx) ·
stories [`Card.stories.tsx`](src/components/Card.stories.tsx)

### Table

A data table: a header row of column names and one row per record. Rows can
be clickable, and a message shows when there are no rows.

#### When to use it

For many records of the same shape that a user scans, compares or picks one
of: a patient list, a medication list, a list of results.

**When not to:**

- For one record's details. Use [DescriptionList](#descriptionlist).
- For page layout.
- When you need sorting, pagination or filtering built in. The Table has none;
  do those before you pass `rows`.

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
| `columns` | `TableColumn[]` (each `{ key: string; header: string }`) | yes | — | The columns, in display order. `header` is the column's heading; `key` is looked up on each row and must be unique across columns. |
| `rows` | `TableRow[]` (each `Record<string, ReactNode>`) | yes | — | One entry per record. Each cell is `row[column.key]`. |
| `onRowClick` | `(row: TableRow) => void` | no | — | Makes rows clickable by mouse and keyboard, and is called with the clicked row. |
| `emptyMessage` | `string` | no | `'No results'` | Shown in place of the rows when `rows` is empty. |

Types: `TableProps`, `TableColumn` (one column), `TableRow` (one row).

#### Behaviour

- **Clickable rows work from the keyboard.** With `onRowClick` set, each row
  joins the tab order
  ([`src/components/Table.tsx:59`](src/components/Table.tsx#L59 "tabIndex={isClickable ? 0 : undefined}")) and
  activates with Enter or Space
  ([`src/components/Table.tsx:64`](src/components/Table.tsx#L64 "if (event.key === 'Enter' || event.key === ' ') {")). They keep
  their table semantics, so screen readers still move through the table by
  row and column. Each clickable row is its own Tab stop: for a long list,
  filter or paginate before passing `rows`.
- **Put your record's identifier on the row.** Any key that no column names
  (like `id` in the example) is kept on the row but not displayed, and
  `onRowClick` receives the whole row. Every row value is typed `ReactNode`,
  so narrow it (`typeof row.id === 'string'`) before using it as a string.
- **Without `onRowClick`, rows are static:** no hover, no pointer, not
  focusable.
- **Cells render exactly what you give them.** A missing value shows as an
  empty cell; map it to `'—'` when you build `rows`
  ([Missing values](#missing-values-who-draws-the-dash)).
- **Rows are keyed by position,** not by any key of yours.

#### States

| State | How you get it | What it looks like | Storybook | Picture |
| --- | --- | --- | --- | --- |
| Default | `rows` with entries, no `onRowClick` | A light-grey header row with small grey column names, then one row per record, divided by grey hairlines. | Components / Table / Default | <img src="docs/states/table-default.png" alt="Table with three rows" width="280"> |
| Row hover | `onRowClick` set, pointer over a row | The row turns light grey (`--ui-color-surface-subtle`) and the pointer becomes a hand. | Components / Table / Clickable Rows (hover a row) | <img src="docs/states/table-row-hover.png" alt="Table with a hovered row" width="280"> |
| Row focus | `onRowClick` set, Tab to a row | The same light-grey fill, plus a light-blue ring (`--ui-color-focus`) inside the row. | Components / Table / Clickable Rows (tab to a row) | <img src="docs/states/table-row-focus.png" alt="Table with a focused row" width="280"> |
| Empty | `rows={[]}` | One wide cell with `emptyMessage`, centred and grey, with space above and below. Never clickable. | Components / Table / Empty | <img src="docs/states/table-empty.png" alt="Empty table with message" width="280"> |

#### Source

Component [`src/components/Table.tsx:24`](src/components/Table.tsx#L24 "export function Table({") ·
props [`src/components/Table.tsx:13`](src/components/Table.tsx#L13 "export interface TableProps {") ·
styles [`Table.module.css`](src/components/Table.module.css) ·
tests [`Table.test.tsx`](src/components/Table.test.tsx) ·
stories [`Table.stories.tsx`](src/components/Table.stories.tsx)

### DescriptionList

A read-only list of label/value pairs, one per row, for the details of a
single record: the read-only counterpart to a form.

#### When to use it

To show one record's fields: demographics, contact details, an encounter
summary. Put it inside a [Card](#card) whose title names that group of fields.

**When not to:**

- For many records. Use [Table](#table).
- For fields the user edits. Use [TextField](#textfield).

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
| `items` | `DescriptionListItem[]` (each `{ label: string; value: ReactNode }`) | yes | — | The label/value pairs, one row each, in display order. |

Types: `DescriptionListProps`, `DescriptionListItem` (one label/value pair).

#### Behaviour

- **It draws missing values itself.** Exactly `null`, `undefined` and `''`
  render as a muted `—`
  ([`src/components/DescriptionList.tsx:19`](src/components/DescriptionList.tsx#L19 "function isEmpty(value: ReactNode): boolean {")).
  Pass the value as it is: `null`, `undefined` and `''` all become the dash.
  Do not draw the dash yourself. `0` shows as `0`; `false` and whitespace
  show blank (see
  [Missing values](#missing-values-who-draws-the-dash)).
- **Labels are the row keys,** so keep them unique within one list.
- **Labels sit in a fixed 160px column,** values to their right, with a
  hairline between rows and none after the last.

#### States

| State | How you get it | What it looks like | Storybook | Picture |
| --- | --- | --- | --- | --- |
| Default | Every `value` present | Small grey labels in a fixed left column, dark values beside them, grey hairlines between rows. | Components / DescriptionList / Default | <img src="docs/states/descriptionlist-default.png" alt="Description list with three rows" width="280"> |
| Missing value | A `value` of `null`, `undefined` or `''` | A grey `—` (`--ui-color-text-muted`) in place of the value. | Components / DescriptionList / Missing Values | <img src="docs/states/descriptionlist-missing.png" alt="Description list with em dashes for missing values" width="280"> |

#### Source

Component [`src/components/DescriptionList.tsx:23`](src/components/DescriptionList.tsx#L23 "export function DescriptionList({ items }: DescriptionListPr") ·
props [`src/components/DescriptionList.tsx:14`](src/components/DescriptionList.tsx#L14 "export interface DescriptionListProps {") ·
styles [`DescriptionList.module.css`](src/components/DescriptionList.module.css) ·
tests [`DescriptionList.test.tsx`](src/components/DescriptionList.test.tsx) ·
stories [`DescriptionList.stories.tsx`](src/components/DescriptionList.stories.tsx)

---

## Contributing: extending the library

To add a component, run the scaffold, then replace its four generated files
one step at a time. The steps build a `Badge`. For anything they do not
cover, follow `docs/CONVENTIONS.md` at the repository root. Run every command
from the repository root unless a step says otherwise.

**This README is tested.** `src/readme.test.ts` checks four things: every code
link still points at the code named in its title; every linked file and
picture exists; the contents list matches the headings; and every component's
props table matches its code. Separately, `src/examples/PatientLookup.test.tsx`
checks that the patient lookup listing matches its source. If
your change moves linked code, the test names the broken link; update its line
number and its title.

### Start with the scaffold

```bash
npm run new-component --workspace ui -- Badge
```

This creates the four files every component has, side by side in
`src/components/`, and exports the component from the entry point:

```
src/components/Badge.tsx          the component
src/components/Badge.module.css   its styles, from tokens only
src/components/Badge.test.tsx     its behaviour tests
src/components/Badge.stories.tsx  its Storybook stories, one per variant and state
src/index.ts                      + export { Badge } and type { BadgeProps }
```

There are no subfolders and no barrel files inside `components/`. The name
must be PascalCase and not already taken; the script refuses anything else
([`scripts/new-component.mjs:24`](scripts/new-component.mjs#L24 "if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) fail(`")).

**Expect one failing test until step 7.** Until Badge has a section in this
README, `npm run test --workspace ui` fails in exactly one place: the README
test reports that Badge is not documented. That failure is deliberate, since
an undocumented component is not done. To check your work on steps 1 to 5
alone, run `npx vitest run src/components/Badge` from `packages/ui`, the one
command here that runs there.

### 1. Write the component

Replace the generated `Badge.tsx`:

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

- A **named function export**, not a default export and not `React.FC`.
- Props in an **exported interface** named `<Component>Props`, with a **doc
  comment on every prop**.
- **Union types, never `string`,** for anything with a fixed set of values, and
  export the union.
- Defaults as **destructuring defaults** in the signature, written as a
  literal (`tone = 'neutral'`, `loading = false`). The props test reads them
  from there.
- **No colour or pixel props, no `className`, no `style`, no `{...rest}`
  spread onto the DOM.** The documented props are the whole API.

### 2. Style it from tokens

Replace the generated `Badge.module.css`:

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

- **Every value is a `var(--ui-…)` token.** A literal needs a comment saying
  why no token fits: the token sheet has no border width, for example, so
  hairline borders are a literal `1px` with that comment. A value the sheet
  lacks and several components need becomes a new token in `src/tokens.css`,
  not a literal repeated.
- **Class names are camelCase and name the part** (`.header`, `.emptyValue`),
  not the look (`.blueBox`). No element selectors, no `:global`.
- **Focus rings use the `--ui-focus-ring-*` tokens.** Use `:focus-visible` on
  things you click, such as Button
  ([`src/components/Button.module.css:18`](src/components/Button.module.css#L18 ".button:focus-visible {")) and table rows, so a mouse
  click shows no ring. Use `:focus` on text inputs, which show the ring
  however they gain focus, as TextField does.

### 3. Make it accessible

- Label every input, and associate it with `useId`, never a hand-written id
  (TextField does this at
  [`src/components/TextField.tsx:30`](src/components/TextField.tsx#L30 "const id = useId();")).
- Anything clickable works from the keyboard: reachable with Tab, and
  activated with Enter and Space, as Button and clickable Table rows are.
- Disabled means the native `disabled` attribute, not a grey style on
  something still clickable.
- Decorative parts, such as spinners, are `aria-hidden`.

A Badge is plain text, so none of these apply. A component with an input, a
click handler or a disabled state needs the ones that match.

### 4. Test its behaviour

Replace the generated `Badge.test.tsx`:

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

Vitest and Testing Library. Query the way a user finds things (`getByRole`,
`getByLabelText`, `getByText`) and assert behaviour: a disabled control does
not fire, an error replaces a hint. No snapshot tests. One behaviour per test,
named as a sentence.

### 5. Give it a story per state

Replace the generated `Badge.stories.tsx`:

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

`npm run storybook` shows it under Components / Badge. The story test renders
every story it finds, so a story that throws fails
`npm run test --workspace ui`.

### 6. Export its types

The scaffold already added two lines for Badge to `src/index.ts`. Change the
second so it also exports the `tone` union. The two lines end up as:

```ts
// src/index.ts
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeTone } from './components/Badge';
```

`src/index.ts` is the only public entry point. A component that is not exported
there does not exist for consumers, and the entry-point test fails.

### 7. Document it here

Add a `### Badge` section under [Component reference](#component-reference),
after the last component, with the same parts as the others:

```md
### Badge

One sentence: what it is.

#### When to use it

When to use it, then **When not to:** as a bullet list with what to use instead.

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

| State | How you get it | What it looks like | Storybook | Picture |
| --- | --- | --- | --- | --- |

#### Source

Component, props, styles, tests and stories, as links.
```

The props test compares the table with the code, so:

- list the props in the order the interface declares them;
- write Required as `yes` or `no`;
- write Default as the code's literal in backticks, quotes included
  (`` `'neutral'` ``), or `—` when there is none.

Then, in this order:

1. Add a row for Badge to the component table at the top of this file.
2. Add `   - [Badge](#badge)` to the contents list, on the line after
   `   - [DescriptionList](#descriptionlist)`. The contents test requires the
   same order as the headings.
3. Add one row per state to the `STATES` list in
   [`scripts/capture-states.mjs:21`](scripts/capture-states.mjs#L21 "const STATES = ["), such as
   `['badge-danger', 'components-badge--danger']`: the image file name, then
   the story id. An interaction state adds a third entry: `'hover'`,
   `'hover-row'` or `'tab'`.
4. Run `npx playwright install chromium` once, then
   `npm run capture-states --workspace ui`.
5. Only now add the `<img>` cells to the States table. The README test fails
   for any picture that does not exist yet.

**A component that is not documented is not done.** An undocumented prop and a
documented prop that does not exist are equally wrong, so a prop and its table
row change in the same commit. The props test holds you to it: every prop
name, whether it is required, and its default must match the code.

### 8. Check it

```bash
npm run typecheck --workspace ui        # types
npm run test --workspace ui             # behaviour, entry point, stories, README
npm run build --workspace ui            # the package consumers get
npm run build-storybook --workspace ui  # every story builds
```

### Why adding a component is this short

Most of the work above is writing the component itself. The wiring is short
because the library decided these things once, for every component:

| Choice | What it saves you | Where it lives |
| --- | --- | --- |
| **Every value is a token, defined once.** | You never pick a colour, a spacing or a font size; you name a role (`--ui-color-danger`). A new component matches the other five by construction, and a token change reaches it with no edit. | [`src/tokens.css:13`](src/tokens.css#L13 ":root {") |
| **CSS Modules with prefixed, hashed class names.** | Class names cannot collide with another component's or the app's, so `.badge` is a safe name and there is no naming scheme to follow. Consumers have no stable name to target, so a change to a component's internals cannot break a supported use. | [`vite.config.ts:11`](vite.config.ts#L11 "generateScopedName: 'ui-[local]-[hash:base64:5]',") |
| **One entry point, enforced by the package's `exports` map.** | The public API is one file. In code, adding a component is two lines there; the only other registrations are this README's two lists and the screenshot list, and a test catches both lists. No consumer can depend on a file you later move. | [`src/index.ts:9`](src/index.ts#L9 "export { Button } from './components/Button';"), [`package.json:9`](package.json#L9 "exports") |
| **The entry point imports the tokens.** | So the build puts every token into `ui.css`, and a new component's stylesheet can use any of them without importing anything. | [`src/index.ts:7`](src/index.ts#L7 "import './tokens.css';") |
| **The four files sit side by side.** | Everything about a component is in one place, and deleting a component is deleting four files and two lines. | `src/components/` |
| **Tests find components; nobody lists them.** | The entry-point test checks that every file in `components/` is exported, the story test renders every story file, and the README test checks every component has a matching props table. A new component is held to all three without a test being edited. | [`src/index.test.ts:6`](src/index.test.ts#L6 "import.meta.glob(['./components/*.tsx', '!./components/*.tes"), [`src/stories.test.tsx:9`](src/stories.test.tsx#L9 "const storyFiles = import.meta.glob<StoriesModule>('./**/*.s") |
| **Storybook runs on the library's own Vite config.** | Stories render with the same CSS Modules naming and tokens a consumer gets, so what you see in Storybook is what ships. There is no second build to configure. | [`.storybook/main.ts:7`](.storybook/main.ts#L7 "framework: '@storybook/react-vite',"), [`.storybook/preview.ts:4`](.storybook/preview.ts#L4 "import '../src/tokens.css';") |
| **React is external to the build.** | A new component adds only its own code to the package; it runs on the consumer's React. | [`vite.config.ts:23`](vite.config.ts#L23 "external: ['react', 'react-dom', 'react/jsx-runtime'],") |
| **The scaffold writes the conventions for you.** | As generated, the four files pass typecheck, their own test, the story test and the entry-point test. Only the README test fails, until step 7. | [`scripts/new-component.mjs:27`](scripts/new-component.mjs#L27 "const files = {") |
