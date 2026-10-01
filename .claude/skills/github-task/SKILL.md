---
name: github-task
description: Track project tasks as GitHub issues with the gh CLI — create a task issue (or a set of them under a tracking issue), start one, update its body or post progress, and close it once its verification check has passed. Each issue carries the same fields as a task in docs/TASKS.md (depends on, done when, verify). Use when asked to file, create, open, update, start, list or close a GitHub task or issue, to plan work as issues instead of in TASKS.md, or when committing work that an issue tracks.
---

GitHub issues as the task list. An issue is a task: it can be implemented and verified on its
own, and it carries its own check. Everything goes through `gh`, run from the repository root.

## Before anything

```bash
gh auth status                                  # must be logged in
gh repo view --json nameWithOwner,hasIssuesEnabled
```

If either fails, stop and tell the user. Do not fall back to editing `docs/TASKS.md`.

Make sure the labels exist (`--force` updates rather than fails if they do):

```bash
gh label create task         --color 1d76db --description "A task with its own done state and check" --force
gh label create in-progress  --color fbca04 --description "Being worked on now" --force
```

A group of tasks also gets a group label, such as `phase-12` or `register-page`.

## The issue body

Same fields as a task in `docs/TASKS.md`, so the two read alike:

```markdown
<one or two sentences: what this task changes and why>

**Depends on:** #12, #13   (or —)
**Done when:** <the observable end state>
**Verify:** <the command or check that proves it>

Part of #11
```

Title: imperative, under 72 characters, naming the area, like a commit subject —
`api: accept new patients at POST /api/patients`.

## Create

One task:

```bash
gh issue create --title "<title>" --label task,<group> --body-file <file>
```

Write the body to a file in the scratchpad first; heredocs mangle backticks.

A set of tasks:

1. Plan the set as `phase-tasks` would: each task separately verifiable, dependencies honest
   and shallow. Show the user the list of titles and dependencies before creating anything,
   unless they already asked for these exact issues.
2. Create the **tracking issue** first (label `<group>` only, not `task`). Its body says what
   the group delivers and holds a task list, filled in once the tasks have numbers.
3. Create each task in dependency order, so `Depends on:` can cite real issue numbers.
4. Edit the tracking issue's body to list them — GitHub shows progress from the checkboxes:

   ```markdown
   - [ ] #12 api: accept new patients at POST /api/patients
   - [ ] #13 app: ...
   ```

Report each issue's number and URL.

## List and pick the next one

```bash
gh issue list --label <group> --state all --json number,title,state,labels
```

A task is **startable** when it is open and every issue in its `Depends on:` is closed. Pick
the startable task that unblocks the most others.

## Start

```bash
gh issue edit <n> --add-label in-progress
```

One task in progress at a time.

## Update

- **The plan changed** (scope, done state, check, dependencies): edit the body, then comment
  saying what changed and why. The body must stay the truth.

  ```bash
  gh issue edit <n> --body-file <file>
  gh issue comment <n> --body "<what changed and why>"
  ```

- **Progress or a finding worth keeping** (a decision taken, a correction): comment. Skip
  routine chatter.
- **Blocked:** comment with what blocks it and who can unblock it, and remove `in-progress`.

## Commit

One task, one commit. End the subject with the issue number, as `docs/TASKS.md` tasks end
with their id, and reference it in the body:

```
app: add the Register patient page (#14)

<why>

Refs #14
```

`Refs`, not `Closes`: the issue is closed below with its evidence, not by a push.

## Close

Only after the task's **Verify** check has run and passed — not because the code looks done.

```bash
gh issue close <n> --reason completed --comment "<evidence>"
gh issue edit <n> --remove-label in-progress
```

The comment gives the commit (`Done in <short sha>`) and what the check showed (test counts,
the command run). If the commit is not pushed yet, say so: the SHA links once it is.

Then tick the task in the tracking issue's list (edit its body). When every task is closed,
close the tracking issue with a one-line summary.

Close as `--reason "not planned"`, with a comment saying why, when a task is dropped.

## Rules

- Issues are public on a public repository. No secrets, no personal data, no copied brief text.
- Never close an issue whose check failed or did not run. Comment the failure instead.
- Do not push to make an issue close. Pushing is the user's call.
