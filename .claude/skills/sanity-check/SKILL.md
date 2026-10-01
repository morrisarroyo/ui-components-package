---
name: sanity-check
description: Check that every claim the docs make matches what is implemented — commands, props, endpoints, ports, test counts, file and line references, page behaviour, task status — then fix the docs that are wrong and report the code that is. Use when asked for a sanity check, to check the docs against the code, to find stale or wrong documentation, or before a delivery or commit that touched docs.
---

Find every place the docs say something the code does not do, and fix it.
The rule from `CLAUDE.md`: an undocumented prop and a documented prop that
does not exist are equally wrong.

**Which side is wrong.** The code is the truth for docs that *describe* it
(READMEs, `docs/TESTING.md`, the Storybook pages, `docs/API-CONTRACT.md`, the
commands in `CLAUDE.md`): fix the doc. The brief and `docs/DESIGNDOCUMENT.md`
are the truth for what *should* be built. Code that differs from them is a
bug: report it and ask before changing code.

## 1. Run the mechanical checks

```bash
python3 .claude/skills/sanity-check/scripts/check_refs.py   # links, paths, path:line refs
npm test                                                    # includes the ui README checks
npm run test:api
```

`check_refs.py` lists references it cannot resolve. Judge each one: a made-up
example file (the Contributing guide's `Badge`) is fine; anything else is
stale. `packages/ui/src/readme.test.ts` already checks the library README's
props tables and code links, so a failure there is a real mismatch.

## 2. Check the claims by hand

Read each doc and check every claim against the code. Run what can be run;
read the source for the rest. Never mark a claim correct because it looks
plausible.

| Doc | Check against |
| --- | --- |
| `packages/ui/README.md`, `packages/ui/src/docs/*.mdx` | Each component's props interface, defaults, states and stories in `packages/ui/src/components/` |
| `packages/ui/src/docs/Tokens.mdx`, token mentions anywhere | `packages/ui/src/tokens.css` |
| `docs/API-CONTRACT.md`, `api/README.md` | `api/Intrahealth.Api/Program.cs`, `Patient.cs`, `SeedData.cs` |
| `packages/app/README.md`, page behaviour in any doc | `packages/app/src/pages/`, `packages/app/src/api/patients.ts` |
| Every command block (`CLAUDE.md`, all READMEs, `docs/TESTING.md`) | Run each command, or match it to a `package.json` script; check ports and URLs |
| Test counts (`docs/TESTING.md`, `INTERVIEW.md`) | The counts printed by `npm test`, `npm run test:api`, `npm run test:e2e` |
| `docs/TASKS.md` statuses, `INTERVIEW.md` history | `git log`; each Done task's **Verify** still holds |
| `docs/DECISIONS.md` | The code still does what each settled decision says |
| `.claude/README.md` | The skills in `.claude/skills/` |

Look for both directions: a doc claim with no code behind it, and code (a
prop, an endpoint, a script, a state) that no doc mentions.

## 3. Fix and report

- Fix each wrong doc in place, using the `document-writer` skill. Keep the
  fix as short as the sentence it replaces.
- Do not change code to match a doc without asking.
- Rerun step 1 after fixing.

Then report every mismatch in a table: file and line, what the doc said, what
the code does, and fixed or needs the owner. Say
plainly if nothing was wrong. List anything you could not check (for example,
a command that needs a running server you could not start).
