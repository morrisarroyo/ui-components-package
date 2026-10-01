# Harness

The Claude Code skills this project was built with. Most are my reusable,
user-level skills, copied here unchanged, so they were written for other
projects too: some examples mention Unity or Plastic SCM, and they describe a
generic `Tasks.md`.

| Skill | What it does | Used for |
| --- | --- | --- |
| `phase-tasks` | Breaks one phase of `CLAUDE.md` into tasks with dependencies, a done state and a check, and writes them to the task plan. | Planning phases |
| `implement-tasks` | Implements startable tasks one at a time and runs each task's own check. | Phases 1–4 |
| `test-and-fix` | Runs the tests, finds root causes, fixes code, never weakens a test. | Every task |
| `commit-gate` | Verification, then the owner reviews the diff, then commit. | Reviewed commits |
| `commit-task` | Commits one task and checks the commit captured it. | Every commit |
| `auto-phase` | Runs a whole phase unattended: implement, verify, commit, repeat. | Phases 1–4 and 6 |
| `document-writer` | Makes docs short and plain, with a checker script for wordy phrases and long sentences. | Writing and editing docs |
| `github-task` | Files tasks as GitHub issues, starts, updates and closes them with evidence. Written for this project. | The Register patient page |

## How the generic terms map to this repository

| In the skills | Here |
| --- | --- |
| `Tasks.md` | `docs/TASKS.md` |
| `status: todo` / `in-progress` / `done` / `blocked` | **Status:** Not started / In progress / Done / Blocked |
| `after:` | **Depends on:** |
| `verify:` / `goal:` | **Verify:** / **Done when:** |
| Run log / changeset manifest | `AutoPhase.md`, kept locally and not committed |
| Changeset (`cm`) | A git commit |
| Unity, Plastic SCM, EditMode/PlayMode | Not applicable |

`code-review`, mentioned by `commit-gate`, is Claude Code's built-in review
command, not a skill of mine.

The project context the skills read first is `CLAUDE.md` at the repository
root.
