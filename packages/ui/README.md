# `ui`

React components for the EHR product suite. Five components, one entry point,
one stylesheet, no styling framework required.

| Component | Use it for |
| --- | --- |
| [Button](#button) | Triggering an action. |
| [TextField](#textfield) | Entering a single line of text, with a label, a hint and an error. |
| [Card](#card) | Grouping related content under an optional title. |
| [Table](#table) | Showing many records as rows, optionally clickable. |
| [DescriptionList](#descriptionlist) | Showing one record's details as label/value pairs. |

## Contents

1. [Getting started](#getting-started)
2. [Styling](#styling)
3. [Component reference](#component-reference)
4. [Contributing](#contributing)

---

## Getting started

### Requirements

- **React 19** and **React DOM 19**, as peer dependencies. The library does not
  bundle React, so your app's copy is the only one on the page.
- A bundler that understands package `exports` and CSS imports — Vite,
  webpack 5, or anything equivalent.

### Install

The package is not published to a registry. It is consumed as a package all the
same — by name, from its build output — never as a folder of source files.

**Inside this repository** (an npm workspace), add it to the consuming
package's dependencies and reinstall at the root:

```jsonc
// packages/your-app/package.json
"dependencies": {
  "ui": "*"
}
```

```bash
npm install                      # at the repository root
npm run build --workspace ui     # builds packages/ui/dist, which consumers import
```

**From another repository**, build a tarball and install that:

```bash
npm run build --workspace ui
npm pack --workspace ui          # writes ui-0.1.0.tgz
cd ../your-app && npm install ../path/to/ui-0.1.0.tgz
```

The library must be built before a consumer can import it; the package's
`exports` point at `dist/`. After changing the library, rebuild it. While
working on it, `npm run dev --workspace ui` rebuilds the JavaScript and CSS on
save; run the full build again when a prop or type changes, so the type
declarations follow.

### Use

A consumer needs exactly two imports: the stylesheet, **once**, at your app's
root, and components from the package entry point wherever you use them.

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
      <TextField label="Name" value={name} onChange={setName} />
      <Button onClick={() => console.log('search for', name)}>Search</Button>
    </Card>
  );
}
```

Import only from `'ui'` and `'ui/styles.css'`. Those are the package's only
public paths; anything else — `ui/src/...`, `ui/dist/...`, a relative path into
the library — is refused by the package's `exports` map and is not part of the
API.

Prop types are exported alongside the components, for typing your own
wrappers:

| Export | What it is |
| --- | --- |
| `ButtonProps`, `ButtonVariant`, `ButtonSize` | Button's props, and its `variant` and `size` unions. |
| `TextFieldProps` | TextField's props. |
| `CardProps` | Card's props. |
| `TableProps`, `TableColumn`, `TableRow` | Table's props, one column definition, one row. |
| `DescriptionListProps`, `DescriptionListItem` | DescriptionList's props, one label/value item. |

---

## Styling

### The contract

- **You choose a variant or a size; the library owns the appearance.** No
  component takes a colour, a pixel value, a `className` or a `style` prop.
- **Component internals are private.** Class names are generated at build time
  (`ui-button-BiD3F`) and change between builds. Do not target them, and do not
  write selectors that reach inside a component.
- **Tokens are public.** Every colour, spacing, radius and type value is a CSS
  custom property on `:root`, defined once in `src/tokens.css` and shipped in
  `ui/styles.css`. Your own layout CSS can and should use them, so a page sits
  on the same scale as the components.

```css
/* Your app's own layout — tokens, not literals. */
.page {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-6);
  padding: var(--ui-space-8) var(--ui-space-4);
  font-family: var(--ui-font-family);
}
```

**Theming.** Redefining a token on `:root` after importing `ui/styles.css`
changes it everywhere, for every component, consistently. That is a deliberate
escape hatch for a product-wide theme, not a way to restyle one component.

### Tokens

**Colour**

| Token | Custom property | Value | Used for |
| --- | --- | --- | --- |
| color.primary | `--ui-color-primary` | `#1F6FEB` | Primary buttons, focused input border |
| color.primary.hover | `--ui-color-primary-hover` | `#185CC4` | Primary button hover |
| color.danger | `--ui-color-danger` | `#C93C37` | Error border and message |
| color.text | `--ui-color-text` | `#1A1A1A` | Body text |
| color.text.muted | `--ui-color-text-muted` | `#6B7280` | Labels, helper text, headers, empty values |
| color.border | `--ui-color-border` | `#D1D5DB` | Borders and row dividers |
| color.focus | `--ui-color-focus` | `#93C5FD` | Focus ring |
| color.surface | `--ui-color-surface` | `#FFFFFF` | Card and input background |
| color.surface.subtle | `--ui-color-surface-subtle` | `#F3F4F6` | Table header, hovered rows and secondary buttons |
| color.disabled.bg | `--ui-color-disabled-bg` | `#E5E7EB` | Disabled background |
| color.disabled.text | `--ui-color-disabled-text` | `#9CA3AF` | Disabled text |

**Spacing**

| Token | Custom property | Value |
| --- | --- | --- |
| space.1 | `--ui-space-1` | `4px` |
| space.2 | `--ui-space-2` | `8px` |
| space.3 | `--ui-space-3` | `12px` |
| space.4 | `--ui-space-4` | `16px` |
| space.6 | `--ui-space-6` | `24px` |
| space.8 | `--ui-space-8` | `32px` |

**Radius**

| Token | Custom property | Value |
| --- | --- | --- |
| radius.sm | `--ui-radius-sm` | `4px` |
| radius.md | `--ui-radius-md` | `8px` |

**Typography** — each role is a size, a line height and a weight.

| Token | Size | Line height | Weight | Custom properties |
| --- | --- | --- | --- | --- |
| font.body | `14px` | `20px` | 400 | `--ui-font-body-size`, `-line`, `-weight` |
| font.label | `12px` | `16px` | 400 | `--ui-font-label-size`, `-line`, `-weight` |
| font.button | `14px` | `20px` | 600 | `--ui-font-button-size`, `-line`, `-weight` |
| font.heading | `20px` | `28px` | 600 | `--ui-font-heading-size`, `-line`, `-weight` |
| font.title | `24px` | `32px` | 600 | `--ui-font-title-size`, `-line`, `-weight` |

The font stack is `--ui-font-family` (the platform's system UI font).

**Focus ring** — one definition, used by every focusable component:
`--ui-focus-ring-width` (`2px`) and `--ui-focus-ring-offset` (`2px`), drawn in
`--ui-color-focus`.

### How a component uses them

Each component has one CSS Module beside it, and every value in it is a
`var(--ui-…)` reference:

```css
/* Button.module.css (excerpt) */
.md {
  padding: var(--ui-space-2) var(--ui-space-4);
}

.primary {
  background: var(--ui-color-primary);
  color: var(--ui-color-surface);
}

.button:focus-visible {
  outline: var(--ui-focus-ring-width) solid var(--ui-color-focus);
  outline-offset: var(--ui-focus-ring-offset);
}
```

The token sheet has no border width, so hairline borders are a literal `1px`,
and each literal in a component stylesheet carries a comment saying why no
token fits. A new component that follows these rules matches the existing
five by construction — see [Contributing](#contributing).

---

## Component reference

Every prop in each table exists in the code, and every prop in the code is in a
table. Every example runs as written inside a component tree whose root
imports `ui/styles.css`.

### Button

A clickable button that triggers an action. Two visual weights, two sizes, and
built-in busy and unavailable states.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual weight. `primary` is the main action on a screen; everything else is `secondary`. |
| `size` | `'sm' \| 'md'` | `'md'` | Control height and padding. `sm` for dense places such as a card's header row. |
| `loading` | `boolean` | `false` | Shows a spinner in place of the label and makes the button non-interactive. The width does not change. |
| `disabled` | `boolean` | `false` | Makes the button non-interactive and renders it in the disabled palette. |
| `onClick` | `() => void` | — | Called on click, Enter or Space. Never called while `loading` or `disabled`. |
| `children` | `ReactNode` | required | The button's label. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type. Use `'submit'` to submit a surrounding `<form>`; the default never submits one by accident. |
| `aria-label` | `string` | — | Accessible name, for when the visible label alone is not descriptive enough (for example, several "Edit" buttons on one page). |

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
    <div>
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

**Behaviour you get for free.** `loading` and `disabled` both set the native
`disabled` attribute, so the button cannot be clicked, reached with Tab or
activated from the keyboard. A loading button keeps its variant colours and its
accessible name, and is announced as busy (`aria-busy`).

**When to use it.** For an action: save, search, submit, open a dialog. Use one
`primary` button per screen or section, for the action the user most likely
wants; make the rest `secondary`. Show `loading` for the duration of an
asynchronous action rather than disabling the button and adding a separate
spinner.

**When not to.** For navigating to another page — use a link, so it opens in a
new tab and reads as navigation to assistive technology. And not for toggling a
setting on and off.

### TextField

A single-line text input with a label above it, an optional hint below it, and
an error state. The field is controlled: you hold the value.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | required | Visible label, rendered above the input and associated with it. |
| `value` | `string` | required | The current value. |
| `onChange` | `(value: string) => void` | required | Called with the new value on every keystroke. Receives the string, not the event. |
| `placeholder` | `string` | — | A short example of the expected input. Not a substitute for the label. |
| `helperText` | `string` | — | A hint below the input. Hidden while an error is showing. |
| `errorMessage` | `string` | — | An error to show below the input. A non-empty string puts the field in its error state; `undefined` or `''` clears it. |
| `disabled` | `boolean` | `false` | Makes the input non-interactive and renders it in the disabled palette. |

```tsx
import { useState } from 'react';
import { TextField } from 'ui';

export function EmailField() {
  const [email, setEmail] = useState('');
  const error =
    email !== '' && !email.includes('@') ? 'Enter an email address, like name@example.com' : undefined;

  return (
    <TextField
      label="Email"
      value={email}
      onChange={setEmail}
      placeholder="name@example.com"
      helperText="Used for appointment reminders only."
      errorMessage={error}
    />
  );
}
```

**Behaviour you get for free.** The label is tied to the input, so clicking it
focuses the input and screen readers announce it; two fields on one page never
share an id. In the error state the border turns `color.danger`, the message
replaces the helper text rather than stacking under it, it is announced
(`role="alert"`), and the input is marked invalid and described by it.

**When to use it.** For short free text: a name, a search term, an email, a
phone number. Pass an `errorMessage` once you know the value is wrong — on
submit, or on blur — and clear it when the user fixes it.

**When not to.** For multi-line text, or for choosing from a fixed set of
values. There is no textarea, select or checkbox in the library yet; those are
new components, not TextField options.

### Card

A bordered container that groups related content on a page, with an optional
title and an optional slot for actions on the title's row.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Heading shown at the top of the card. Omit for an untitled container. |
| `actions` | `ReactNode` | — | Controls shown right-aligned on the title row, typically `sm` Buttons. |
| `children` | `ReactNode` | required | The card's body. |

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

**Layout.** The title renders as an `h2` in `font.heading`. The title row is
left out entirely when there is neither a `title` nor `actions`, so an untitled
card has no stray space above its body.

**When to use it.** To group a section of a page that belongs together — a
search form, a record's demographics, an error message that replaces a
section. A card's title names what is in it.

**When not to.** Around a whole page, or nested inside another card. If
everything on a page is in cards, nothing is grouped.

### Table

A data table: a header row of column names and one body row per record. Rows
can be clickable, and a message shows when there are no rows.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `TableColumn[]` — `{ key: string; header: string }[]` | required | The columns, in display order. `header` is the column's heading; `key` is looked up on each row. |
| `rows` | `TableRow[]` — `Record<string, ReactNode>[]` | required | One entry per record. Each cell is `row[column.key]`. Keys that no column names are carried but not shown. |
| `onRowClick` | `(row: TableRow) => void` | — | Makes rows clickable by mouse and keyboard, and is called with the clicked row. |
| `emptyMessage` | `string` | `'No results'` | Shown in place of the body when `rows` is empty. |

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

The `id` key above is not a column, so it is not shown, but it comes back in
`onRowClick` — the usual way to know which record was clicked. Its type is
`ReactNode`, so narrow it (`typeof row.id === 'string'`) before using it as a
string.

**Behaviour you get for free.** With `onRowClick` set, rows highlight on hover,
show a pointer, and join the tab order; a focused row activates with Enter or
Space and shows the focus ring. Without it, rows are static and none of that
applies. Clickable rows keep their table semantics, so screen readers can still
move through the table by row and column.

**Cells render exactly what you give them.** A `null` or `undefined` cell is
empty; the Table does not substitute a dash. If a column can be missing, decide
what it should show before building the row.

**When to use it.** For many records of the same shape that a user scans,
compares, or picks one of — a patient list, a medication list, a results
list.

**When not to.** For one record's details (use
[DescriptionList](#descriptionlist)), or for page layout. The Table does not
sort, paginate or filter; do that before passing `rows`.

### DescriptionList

A read-only list of label/value pairs, one per row, for showing the details of
a single record — the read-only counterpart to a form.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `DescriptionListItem[]` — `{ label: string; value: ReactNode }[]` | required | The label/value pairs, one row each, in display order. A value that is `null`, `undefined` or `''` renders as `—`. |

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

**Missing values.** Pass a missing value as `null` (or `undefined`, or `''`)
and it renders as an em dash in `color.text.muted` — never blank and never the
text "undefined". Do not substitute the dash yourself; what "missing" looks
like is the library's decision. `0` is a value, not a missing one, and renders
as `0`.

**Layout.** Labels sit in a fixed 160px column in `font.label`, values to their
right in `font.body`, and rows are divided by a border except after the last.
Labels are the row keys, so keep them unique within one list.

**When to use it.** To show one record's fields: demographics, contact
details, an encounter summary. It usually sits inside a [Card](#card).

**When not to.** For many records (use [Table](#table)), or for fields the user
edits (use [TextField](#textfield)).

---

## Contributing

How to add a sixth component so it fits with the existing five. The house
style this summarises is `docs/CONVENTIONS.md` in the repository root.

### 1. Four files, one place

```
src/components/Badge.tsx          the component
src/components/Badge.module.css   its styles
src/components/Badge.test.tsx     its behaviour tests
src/components/Badge.stories.tsx  its Storybook stories, one per variant and state
```

Run `npm run storybook` from the repository root to browse every component
and state on http://localhost:6006. Stories are left out of the published
build.

No subfolders and no barrel files inside `components/`.

### 2. The component

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
- Props in an **exported interface** named `<Component>Props`, and a **doc
  comment on every prop** — the props table in this README is checked against
  them.
- **Union types, never `string`,** for anything with a fixed set of values, and
  export the union.
- Defaults as **destructuring defaults** in the signature.
- **No colour or pixel props, no `className`, no `style`, no `{...rest}`
  spread onto the DOM.** The documented props are the whole API.

### 3. Styles, from tokens only

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

- Every value is a `var(--ui-…)` token. A literal needs a comment saying why no
  token fits. A value the sheet lacks and several components need is a new
  token in `src/tokens.css`, not a literal repeated.
- Class names are camelCase and name the part (`.header`, `.emptyValue`), not
  the look (`.blueBox`). No element selectors, no `:global`.
- Keyboard focus uses `:focus-visible` and the `--ui-focus-ring-*` tokens.

### 4. Accessible by default

- Label every input, and associate it with `useId` — never a hand-written id.
- Anything clickable works from the keyboard: reachable with Tab, activated
  with Enter (and Space where the role implies it).
- Disabled means the native `disabled` attribute, not a grey style on
  something still clickable.
- Decorative parts, such as spinners, are `aria-hidden`.

### 5. Export it from the entry point

```ts
// src/index.ts
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeTone } from './components/Badge';
```

`src/index.ts` is the only public entry point. A component that is not exported
there does not exist for consumers.

### 6. Test its behaviour

```tsx
// src/components/Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its text', () => {
    render(<Badge tone="danger">Allergy</Badge>);

    expect(screen.getByText('Allergy')).toBeInTheDocument();
  });
});
```

Vitest and Testing Library. Query the way a user finds things (`getByRole`,
`getByLabelText`, `getByText`), assert behaviour — a disabled control does not
fire, an error replaces a hint — and never write snapshot tests. One behaviour
per test, named as a sentence.

### 7. Document it here

Add a section under [Component reference](#component-reference): what it is
for, a props table (name, type, default, description), one usage example that
runs as written, and when to use it and when not to. Add it to the table at the
top of this file and to the exported-types table in
[Getting started](#getting-started).

**A component that is not documented is not done.** An undocumented prop and a
documented prop that does not exist are equally wrong, so a prop and its table
row change in the same commit.

### 8. Check it

```bash
npm run test --workspace ui       # behaviour tests
npm run typecheck --workspace ui  # types
npm run build --workspace ui      # the package consumers get
```
