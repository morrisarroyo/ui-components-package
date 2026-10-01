# Component docs site

## Summary

A website for developers building Electronic Health Record (EHR) screens with
the `ui` components. It shows each component's demos and props, the design
tokens, a worked example and how to contribute.

## Quick start

From the repository root:

```bash
npm install                    # once
npm run docs                   # builds the site and serves it on http://localhost:6007
```

Open <http://localhost:6007> at **Overview**, or read the
[live copy](https://ui-components-package.onrender.com/docs/).

## Tech stack

Storybook 10. Pages are MDX (Markdown with React components); demos are each
component's stories.

## Pages

| Page | File |
| --- | --- |
| Overview | `Overview.mdx` |
| Foundations → Tokens | `Tokens.mdx` |
| Components → Button, TextField, Card, Table, DescriptionList | `<Component>.mdx` |
| Examples → Patient lookup | `PatientLookup.mdx` |
| Contributing | `Contributing.mdx` |

## Commands

| Command | What it does |
| --- | --- |
| `npm run docs` | Builds the site and serves it on :6007. |
| `npm run storybook` | Live-reloading site on :6006. |
| `npm run build-storybook --workspace ui` | Builds into `packages/ui/storybook-static/`. |

## Sharing it

Zip `packages/ui/storybook-static/` or put it on any web server. Opening
`index.html` from disk doesn't work; serve it:

```bash
cd packages/ui/storybook-static
python3 -m http.server 8080 --bind 127.0.0.1   # then open http://127.0.0.1:8080
```

## Contributing

Follow the **Contributing** page, or the library README's
[Contributing](../../README.md#contributing-extending-the-library) section.
A component shows on the site only once it has a page here.
