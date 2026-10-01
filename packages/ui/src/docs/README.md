# Component docs site

A website for developers building healthcare apps, such as the screens of an
Electronic Health Record (EHR) system, with the `ui` components. It has one
page per component with live demos and props, plus the design tokens and a
worked example. It is built with Storybook.

## Quick start

From the repository root:

```bash
npm install                    # once
npm run docs                   # builds the site and serves it on http://localhost:6007
```

Open <http://localhost:6007> and start from **Overview**. Or read the live
copy: <https://ui-components-package.onrender.com/docs/>. It sleeps when
idle, so the first visit can take about a minute.

## Pages

| Page | File |
| --- | --- |
| Overview | `Overview.mdx` |
| Foundations → Tokens | `Tokens.mdx` |
| Components → Button, TextField, Card, Table, DescriptionList | `<Component>.mdx` |
| Examples → Patient lookup | `PatientLookup.mdx` |
| Contributing: adding a new component | `Contributing.mdx` |

The demos on each page are the component's stories
(`src/components/<Component>.stories.tsx`). Storybook runs in docs-only mode,
so a component appears in the sidebar only once it has a page here. To add a
component, follow the **Contributing** page, or the library README's
[Contributing](../../README.md#contributing-extending-the-library) section for
the full walkthrough.

## Commands

| Command | What it does |
| --- | --- |
| `npm run docs` | Builds the site and serves it on :6007. |
| `npm run storybook` | The same site in development mode on :6006, reloading on save. |
| `npm run build-storybook --workspace ui` | Builds the static site into `packages/ui/storybook-static/`. |

## Sharing it

Zip `packages/ui/storybook-static/` and send it, or put it on any static web
server. Serve the folder over HTTP; opening `index.html` from disk doesn't
work.

```bash
cd packages/ui/storybook-static
python3 -m http.server 8080 --bind 127.0.0.1   # then open http://127.0.0.1:8080
```
