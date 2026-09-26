---
name: implement-tasks
description: Take tasks from Tasks.md, implement them, verify each one by its own stated check, and write the status back. Resolves which tasks are startable from their dependencies and works them one at a time on the mainline, finishing whatever unblocks the most first. Use when asked to implement, work through, or execute tasks from a task plan.
---

This is the downstream half of a task plan: `phase-tasks` writes `Tasks.md`, this reads it and
does the work.

**Two rules govern everything below.** A task is only `done` when its own stated verification
has actually been run and actually passed — never on the strength of the code looking right.
And the plan is the source of truth: implement what the task says, not what you would have
planned.

---

## Part 1 — Read the plan

Read `Tasks.md` (or the path given as an argument). Each task carries a fixed set of fields:

```
### T-101 — Short task title
- **status:** todo
- **after:** —
- **files:** Assets/Game/Core/Save/ISaveStore.cs
- **verify:** EditMode test SaveStoreTests passes
- **goal:** One line on what done looks like.
```

- **`status`** — `todo`, `in-progress`, `done`, or `blocked`.
- **`after`** — predecessor task ids, or `—` for none.
- **`files`** — paths the task is expected to touch.
- **`verify`** — the check that proves this task is finished.
- **`goal`** — what done looks like.

Then read the project's source documents — `CLAUDE.md` and any design, development, or
conventions documents it references. Tasks are written tersely and assume that context.
**Decisions recorded in those documents are settled**: follow the established folder layout,
naming, testing approach, and conventions rather than inventing your own.

Two reads deserve explicit mention. If the project keeps a **memory document** (this one's
`Docs/LongTermMemory.md`), read it early — it carries the current state and the verification
commands that actually work, and skipping it means re-deriving both. And **honor the
documents' own read triggers**: when a document says "read X before building UI," a UI task
starts by reading X — those triggers exist because the failure they prevent is silent.

If `Tasks.md` doesn't exist, say so and stop. Don't invent a plan — that's `phase-tasks`' job.

---

## Part 2 — Work out what's startable

A task is **startable** when its `status` is `todo` and every id in its `after` list has
`status: done`.

- Tasks named as arguments: implement those, but **refuse any whose predecessors aren't
  done** — say which dependency is outstanding rather than working around it.
- No argument: take the whole startable set.
- `status: blocked`: do not implement. Report the blocker and which document owns the open
  question. **Never invent an answer to unblock a task** — that silently converts someone's
  deliberate open question into an assumption buried in code.

### Ordering the work

**Work happens on the mainline. Do not open a branch per task.** That means one task is in
flight at a time: a second started before the first is committed lands in the same working tree,
and neither can then be reviewed on its own. Take the startable set in an order that finishes
whatever unblocks the most dependents first.

The plan's merge-hostility flags still matter, for a different reason — they now govern **what
order** work is done in rather than which branches may run at once. Land shared scaffolding
before the tasks that consume it, and never leave two tasks half-done in the same
merge-hostile file.

Judge overlap by **how badly the file merges**, not merely by whether it is shared:

- **Never concurrent** — Unity scenes and prefabs, project settings, assembly definitions,
  central registries and manifests. These merge into silently broken state rather than honest
  conflicts. Sequence these tasks, always.
- **Usually fine** — two source files, or two clearly separate regions of one source file.

Tasks that must be sequenced run one after another; order between them doesn't matter unless
`after` says it does.

`files` is the plan's *expectation*, not a guarantee. If implementing a task means touching a
file the task didn't list, that's fine — but check nothing running alongside it claimed that
file, and note the discrepancy in your report so the plan can be corrected.

### Confirm before a large fan-out

Implementing code is substantial and awkward to unwind. Before starting more than a couple of
tasks at once, state the set, the grouping, and what will run concurrently — then go. For a
single named task, just do it.

---

## Part 3 — Implement

For each task:

1. **Set `status: in-progress`** in `Tasks.md` before starting, so an interrupted run leaves a
   truthful record.
2. **Implement the task and nothing else.** Stay inside the goal. If you spot adjacent work —
   a bug, a cleanup, a task that looks mis-specified — note it for the report; don't fold it
   in. Scope creep in one task is what breaks the concurrency assumptions of every task
   running alongside it.
3. **Run the task's `verify` step**, exactly as written. A named test means running that test.
   A build means running that build. A manual check means saying plainly that it needs a human
   and leaving the task `in-progress`. Be especially wary of tasks whose real risk is
   Editor-side wiring — scene references, `[SerializeField]` assignments, prefab links:
   automated tests can stay green while the scene contains none of the code, so never round a
   manual check up into an automated pass.
   If the project has an acceptance document that records expected test counts (this one's
   `Docs/ACCEPTANCE.md`), a task that adds, renames, or removes tests **updates those counts
   in the same change** — and a passing run reporting a *lower* total than that document
   states is a failure to investigate, not a pass.
4. **Record the outcome:**
   - Verification passed → `status: done`.
   - Verification failed → fix and re-run if the cause is within the task's scope. If it isn't,
     leave `status: in-progress` and report what failed with the actual output.
   - A dependency turns out to be missing or wrong → stop that task, set `status: blocked`,
     and report it. Do not quietly reorder the plan.

### Completed task: proceed to commit-gate for review and commit

**Reaching `status: done` does not authorize a commit.** Completed work stays uncommitted on
the mainline until the user approves via the **`commit-gate`** skill. The gate will show
the user the complete diff of everything the task changed so they can review it themselves,
and only then lets a commit happen — with their approval.

Never commit a task's code directly from this skill, even when verification passed and the
work looks clean. `done` means the task's own check passed; the user still has to see the
changes. If they ask for adjustments, testing restarts, because the run that went green
described different code than what would be committed.

### Editing Tasks.md

Change **only** `status` values. Never renumber ids, never restructure the file, never delete
finished tasks, never reword goals to match what you built. Ids are how dependencies and
progress stay resolvable across sessions.

If the file is under version control that requires an explicit checkout before edits are
committable, do that first — and afterwards confirm the write actually landed rather than
assuming it did.

---

## Part 4 — Report

State, plainly:

- **Which tasks reached `done`**, and what verification proved it.
- **What failed**, with the real output — never a summary that softens it.
- **What's now unblocked** by this run: tasks whose predecessors just completed. This is the
  most useful thing in the report, because it's the input to the next run.
- **Plan discrepancies** — files touched that weren't listed, dependencies that turned out to
  be wrong or missing, tasks that were mis-specified. The plan should be corrected by
  `phase-tasks`, not silently patched here.
- **Adjacent work you deliberately didn't do.**

Then hand any completed tasks to **`commit-gate`** rather than committing them here. If
verification was skipped or couldn't run, say so explicitly — a task reported as done that was
never verified is worse than one honestly left open.
