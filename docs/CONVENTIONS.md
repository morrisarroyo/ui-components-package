# Conventions

House style for code, so it reads as one person's. Non-negotiable rules are in
`CLAUDE.md`; the layout is in the
[project README](../README.md#repository-layout).

## The `ui` package

### One component, four files

`Name.tsx`, `Name.module.css`, `Name.test.tsx` and `Name.stories.tsx`, in
`src/components/`. Stories stay out of the library build. Only `src/index.ts`
re-exports; no other index files.

To add one, run `npm run new-component --workspace ui -- Name` and follow
[Contributing](../packages/ui/README.md#contributing-extending-the-library).
It is not done until documented.

### Component authoring

- **Named function export:** `export function Button(props: ButtonProps)`.
  No default export, no `React.FC`.
- **Exported `<Component>Props` interface,** so consumers can type wrappers.
- **Union types, not `string`,** for fixed values. Export the union
  (`ButtonVariant`) if consumers may need it.
- **A doc comment on every prop.** The README props table is checked against
  it.
- **Defaults in the signature,** not `defaultProps`.
- **No `{...rest}` onto the HTML element.** The documented props are the whole
  API.
- **No `className` or `style` prop.** The app must not override library
  styles.

### Styling

- Values come from tokens: `var(--ui-space-4)`, not `16px`. A literal needs a
  comment saying why.
- Class names are camelCase and name the part (`.headerCell`), not the look
  (`.blueBox`).
- No bare element selectors (`div`, `p`) and no `:global`.
- Focus rings use the `--ui-focus-ring-*` tokens and `:focus-visible`, so
  mouse clicks show no ring.

### Accessibility

Part of "done", not a later pass.

- Link labels to inputs with `useId`, not hand-written ids.
- Anything clickable works with Tab and Enter (and Space where the role
  expects it).
- Disabled and loading controls set the `disabled` attribute.
- Errors link to their input with `aria-describedby` and use `role="alert"`.
- Decorative elements, such as spinners, are `aria-hidden`.

### Tests

Tests sit beside the component in `Name.test.tsx`. Use `data-testid` only when
no role, label or text works, and comment why. More in
[`docs/TESTING.md`](./TESTING.md#writing-tests).

## The `app` package

- Import only `'ui'` and `'ui/styles.css'`; the stylesheet once, in
  `main.tsx`.
- Pages use `ui` components and plain layout markup (`div`, `main`, `h1`).
  Styling the library lacks becomes a library component.
- API calls and field mapping live in `src/api/`. Pages get display-ready
  values and a typed failure result, never API field names or a `Response`.

## The `api` project

- Endpoints in one file until there is a reason to split; seed data in its
  own file.
- Nullable fields are nullable in the C# model and sent as `null`, not left
  out.
- JSON names match [`API-CONTRACT.md`](./API-CONTRACT.md) exactly.

## Commits

- One task from `docs/TASKS.md`, one commit.
- Subject: imperative, under 72 characters, naming the area, such as
  `ui: add Button with loading and disabled states`. Never `wip`, `fix` or
  `updates`.
- The body says **why** when the diff doesn't.
- Code and docs change together: a prop and its README row in one commit.

## TypeScript

- `strict` everywhere. No `any`; use `unknown` and narrow it.
- No non-null assertions (`!`). Handle the missing case; that is what `—` is
  for.
- Payload types sit beside the code that fetches them, named for the API
  (`PatientDto`), separate from display models (`PatientDisplay`).
