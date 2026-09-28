# Conventions

How to write code that fits this repository. `CLAUDE.md` holds the rules that
are not negotiable; this file holds the house style that makes the code look
like one person wrote it.

## Repository layout

```
CLAUDE.md                     working context, phases
README.md                     project README (deliverable)
INTERVIEW.md                  interview notes (deliverable)
docs/
  DESIGNDOCUMENT.md           the reconciled spec
  TASKS.md                    the work order
  API-CONTRACT.md             endpoints and payloads
  DECISIONS.md                why things are the way they are
  CONVENTIONS.md              this file
packages/ui/
  src/
    tokens.css                every token-sheet value, defined once
    index.ts                  the only public entry point
    components/
      Button.tsx
      Button.module.css
      Button.test.tsx
      Button.stories.tsx
  .storybook/                 Storybook config (dev-only, not published)
  README.md                   the library documentation (deliverable)
packages/app/
  src/
    main.tsx                  React root, router, ui stylesheet import
    api/                      typed API calls and the display mapping
    pages/                    one file per page
api/Intrahealth.Api/          the ASP.NET Core project
```

## The `ui` package

### One component, four files, one folder

`components/Name.tsx`, `components/Name.module.css`, `components/Name.test.tsx`,
`components/Name.stories.tsx`. Stories are usage examples for Storybook; they
are excluded from the library build and are not documentation on their own.
No barrel files inside `components/` — `src/index.ts` is the only place that
re-exports.

### Component authoring

- A **named function export**, not a default export, and not
  `React.FC`. `export function Button(props: ButtonProps)`.
- Props typed by an **exported interface** named `<Component>Props`, so a
  consumer can type a wrapper without re-deriving it.
- **Union types, never `string`**, for anything with a fixed set of values.
  Export the union too (`ButtonVariant`, `ButtonSize`) when a consumer might
  hold one in a variable.
- **Every prop carries a doc comment.** It is what the props table in the
  README is checked against, and what a consumer sees on hover.
- Defaults are set by **destructuring defaults** in the signature, never
  `defaultProps`, so the default is visible in the same line as the type.
- **No prop spreading onto the DOM** (`{...rest}`). The prop surface is the
  documented one; anything else is a way for a consumer to reach past the API.
- **No `className` or `style` prop.** A consumer who can restyle a component
  can break it, and the brief forbids the app overriding library styles.

### Styling

- Every value comes from a token: `var(--ui-space-4)`, never `16px`. A literal
  in a component stylesheet needs a comment saying why no token fits.
- One `.module.css` per component; class names are camelCase and describe the
  part (`.header`, `.headerCell`, `.emptyValue`), not the appearance
  (`.blueBox`).
- Component styles never use element selectors that could leak (`div`, `p`) or
  `:global`.
- Focus rings use the shared `--ui-focus-ring-*` tokens so every component's
  focus looks identical.
- `:focus-visible`, not `:focus`, for keyboard focus rings — a mouse click
  should not leave a ring behind.

### Accessibility

Not a polish pass; it is part of "done".

- Inputs are associated with their label through `useId`, never a hand-written
  id that could collide when the component appears twice.
- Anything clickable is operable from the keyboard: reachable by Tab, activated
  by Enter (and Space where the role implies it).
- Disabled and loading controls are genuinely non-interactive — the `disabled`
  attribute — not merely styled and left clickable.
- Error messages are associated with their input via `aria-describedby` and
  announced (`role="alert"`).
- Decorative elements such as spinners are `aria-hidden`.

### Tests

- Vitest + Testing Library, in `Name.test.tsx` beside the component.
- Query the way a user finds things: `getByRole`, `getByLabelText`,
  `getByText`. Reach for `data-testid` only when nothing else works, and then
  say why in a comment.
- Assert **behaviour**: that a disabled button does not fire its handler, that
  the error message replaces the helper text. Not that a class name is present,
  and never a snapshot.
- One behaviour per test, named as a sentence about the component:
  `it('does not call onClick while loading')`.

### Adding a component

1. Create the three files in `src/components/`.
2. Style it from tokens only.
3. Export the component **and** its props type from `src/index.ts`.
4. Write behaviour tests.
5. Add a section to `packages/ui/README.md`: props table, one runnable usage
   example, and when to use it and when not to.

Step 5 is not optional. A component that is not documented is not done.

## The `app` package

- `app` imports from `'ui'` and `'ui/styles.css'`. Nothing else from the
  library, ever — no `ui/src/...`, no relative path into `packages/ui`.
- Pages are assembled from `ui` components plus plain layout markup (`div`,
  `main`, `h1`). If a page needs something styled that the library does not
  provide, that is a sign it should be a library component — raise it rather
  than styling it locally.
- The stylesheet is imported once, in `main.tsx`.
- All API access and all field mapping live under `src/api/`. A page receives
  display-ready values and never reads an API field name.
- Network failures are caught at the call site in `src/api/` and surfaced to
  pages as a typed result, so a page never inspects a `Response` object.

## The `api` project

- Minimal API endpoints in one file until there is a reason to split them.
- Seed data in its own file, separate from the endpoints.
- Nullable fields are nullable in the C# model too, and serialise as `null`
  rather than being omitted.
- The JSON property names on the wire are exactly those in
  `docs/API-CONTRACT.md`.

## Commits

- One task from `docs/TASKS.md`, one commit. The history is assessed against
  that file.
- Subject line in the imperative, under 72 characters, naming the area:
  `ui: add Button with loading and disabled states`.
- The body says **why**, when the why is not obvious from the diff.
- Never `wip`, `fix`, or `updates`.
- Documentation changes ride along in the commit that changed the code. A prop
  and its row in the README move together.

## TypeScript

- `strict` everywhere. No `any`; use `unknown` and narrow.
- No non-null assertions (`!`) — handle the absent case, which is the whole
  point of the `—` behaviour.
- Types that describe API payloads live beside the code that fetches them, and
  are named after the wire shape (`PatientDto`) so they are never confused with
  display models (`PatientDisplay`).
