# Harness

The Claude Code skills that built this project. They read `CLAUDE.md` first.
Most are my own general skills, copied unchanged, so some examples mention
other tools (Unity, the Plastic source control system) and a generic
`Tasks.md`. The second table maps those terms to this repository.

| Skill | What it does | Used for |
| --- | --- | --- |
| `phase-tasks` | Splits a phase of `CLAUDE.md` into tasks, each with dependencies and a check. | Planning phases |
| `implement-tasks` | Implements ready tasks one at a time and runs each check. | Phases 1–4 |
| `test-and-fix` | Runs tests and fixes the code, never the test. | Every task |
| `commit-gate` | Verify, owner reviews the diff, then commit. | Reviewed commits |
| `commit-task` | Commits one task and checks the commit captured it. | Every commit |
| `auto-phase` | Runs a whole phase unattended: implement, verify, commit, repeat. | Phases 1–4 and 6 |
| `document-writer` | Makes docs short and plain, with a wordiness checker. | Writing docs |
| `github-task` | Tracks tasks as GitHub issues. Written for this project. | The Register patient page |
| `sanity-check` | Checks every claim in the docs against the code, fixes the docs, reports code bugs. Written for this project. | Before delivery |

`code-review`, named in `commit-gate`, is a built-in Claude Code command.

## Generic terms in this repository

| In the skills | Here |
| --- | --- |
| `Tasks.md` | `docs/TASKS.md` |
| `status: todo` / `in-progress` / `done` / `blocked` | **Status:** Not started / In progress / Done / Blocked |
| `after:` | **Depends on:** |
| `verify:` / `goal:` | **Verify:** / **Done when:** |
| Run log / changeset manifest | `AutoPhase.md`, kept locally and not committed |
| Changeset (`cm`) | A git commit |
| Unity, Plastic SCM, EditMode/PlayMode | Not applicable |
