---
name: auto-phase
description: Drive a whole phase end to end in full auto — repeatedly pick up startable tasks from Tasks.md, implement them, verify them, and commit each one itself, without stopping for review. Keeps going until the only thing left is something the user alone can resolve. Resumable across token limits and session death. Use when asked to work a phase automatically, grind through the backlog, or take a phase start to finish unattended.
---

Run the project's **task workflow** in a loop instead of one task at a time, and keep running
until the only thing left is something **only the user can resolve**.

**This skill orchestrates; it does not reimplement.** Every step below is an existing skill —
invoke it. The rules that matter live in those skills, and duplicating their logic here means
the copy silently drifts out of date.

| Step | Skill | Run autonomously? |
|---|---|---|
| Plan the phase into tasks | `phase-tasks` | Only if no plan exists yet |
| Implement startable tasks | `implement-tasks` | **Yes** |
| Verify and fix failures | `test-and-fix` | **Yes — scoped per task, full suite once at the end** |
| Show the user the diff | `commit-gate` | **Not used — see below** |
| Commit | `commit-task` | **Yes, on its own** |

## Full auto

**This skill commits its own work.** The user's instruction: *"Change auto-phase skill to be in full
auto mode."* It implements a task, verifies it, commits it, and takes the next one — no gate, no
approval, no waiting.

**This is a deliberate trade and it is worth naming.** The pipeline's usual rule is that nothing is
committed the user has not read the diff of, and the gate exists because a green build is not a
reviewed build — review has caught things every test passed. What replaces it here is **review after
the fact**: the user's own reasoning was that changes like these are easy enough to revert. So the
loop's job is to make reverting easy, which is what the scoping rules below are for.

**The gate is not run at all in this mode.** Not skipped for speed — genuinely not applicable.
`commit-gate`'s second step is showing a human a diff, and there is nobody at it.

### What replaces the gate

Committing unreviewed puts the whole weight on the commit being *legible and separable later*. So:

- **One task, one changeset.** Never a phase in one commit. Fourteen tasks in one changeset cannot
  be reverted individually, which is the entire safety net this mode is relying on.
- **The message carries what the gate would have shown:** what changed, why, what verified it, and
  any decision taken alone. A reader coming to it cold gets the reasoning, not a file list.
- **Green before committed, always.** A task's own stated check must have actually run and passed.
  Verification is not what this mode gives up.
- **Verify the changeset afterwards** with `cm log cs:N --csFormat="{items}"` or the equivalent —
  the commit reporting success is not evidence it captured the files.
- **Mutation-check any task that edits an existing test's assertion**, not just adds a new one —
  `test-and-fix`'s mutation-check rule applies here with no exception, because there is no human
  reading the diff afterward to catch a test quietly weakened into passing. Record the result in
  `AutoPhase.md`'s entry for that task, next to the verification that ran.
- **Keep `AutoPhase.md` current anyway.** With commits happening it is no longer the only record,
  but it is where a decision taken alone, a plan discrepancy, or a doubt gets written down at the
  moment it happens rather than reconstructed later.

**Never weaken a test to get green, and never commit red.** Those are not review conventions; they
are what makes an unreviewed commit tolerable at all.

### Bundling is still not allowed

Where several tasks are genuinely one change, they may share a changeset — but say so in the message
and say why. Without a human to ask, the default is always **separate**, because a bundle the user
did not choose is the one thing this mode cannot undo cheaply.

---

## Part 0 — Resumability is the whole design

Assume this run will be **killed mid-task** — token limit, session end, a closed laptop. That
is expected, not exceptional, so nothing may live only in conversation.

All durable state is already on disk:

- **`Tasks.md`** — what is done, in progress, blocked, and what depends on what.
- **The repository** — everything committed to the mainline, task by task.
- **The working tree** — every verified-but-unreviewed task from this run.
- **`AutoPhase.md`** — which of those changes belongs to which task, and whether its check has
  actually been run yet.

So keep those authoritative and current *as you go*, never in a batch at the end. If the
session dies between two tool calls, the next run must be able to reconstruct exactly where
things stood by reading the repo. Never keep a task's progress only in your head.

### Read the authority and the memory first

This is the unattended skill, so two documents outrank convenience. If the project has a
**permissions document** stating what may be done without asking (this one's
`Docs/PERMISSIONS.md`), read it before acting — it is the pre-authorized answer to every
question that would otherwise stall the run, and authority it grants in classes is not
re-requested per instance. If the project keeps a **memory document** (this one's
`Docs/LongTermMemory.md`), read it early, and **update it when the loop stops** in the same
pass as the report — current state, corrected facts, anything the next run would otherwise
re-derive. The next run's reconcile starts from what these say.

### Reconcile before starting

A previous run may have died mid-task. Before doing anything, check every task marked
`in-progress`:

- **Work exists and its verification passes** → mark `done` and record its manifest entry.
- **Work is partial** → finish it, or revert it and reset to `todo`. Say which you did.
- **Nothing on disk** → reset to `todo`.

Never assume an `in-progress` task is being worked by someone else. There is no one else.

Also reconcile `AutoPhase.md` against the working tree: uncommitted changes with no manifest entry
belong to a task that died before recording itself, and they must be attributed before the loop
adds more on top.

### Snapshot the baseline before the first task

Before touching any task on a fresh run, write the current full-suite counts as `AutoPhase.md`'s
first line — `Baseline before this run: 954 EditMode / 39 PlayMode, workspace clean at cs:243` is
the form. Take the numbers from the project's memory document if it states them and nothing has
moved since, otherwise run the suite once to get a real count.

The end-of-run full pass (Part 1) is compared against this line, not against memory. A full run
reporting the same pass/fail shape but a **lower** count is exactly the silent regression a
per-task scoped run structurally cannot catch, and there is nothing to notice the drop against
without a number written down before the loop started. Skip this only when resuming a run that
already recorded one — reconcile against the existing line rather than overwriting it.

---

## Part 1 — The loop

Repeat until a stop condition below is met:

1. **Read `Tasks.md`.** Compute the startable set: `status: todo` with every `after`
   predecessor `done`. If no plan exists for the phase, invoke **`phase-tasks`** once to
   create one, then continue.
2. **If the startable set is empty, stop.** See stop conditions.
3. **Pick the next task.** Prefer whichever unblocks the most dependents — finishing a task with
   six dependents opens the most work, finishing a leaf opens none. Take one at a time: everything
   happens on the mainline, so two tasks in flight at once are two half-finished changes in one
   tree. Order the remaining work so a merge-hostile file — a Unity scene, prefab, project
   settings, an assembly definition — is touched by one task at a time.
4. **Invoke `implement-tasks`** for that task. It owns status updates and staying in scope — do
   not reimplement any of that here.
5. **Run the task's own check, scoped to what it touched** — its named test class by filter, never
   the whole suite. See *Scope the check to what changed*. It reaches `done` when that passes.
6. **Commit the task.** Invoke `commit-task`, scoped to that task alone, with a message carrying
   the reasoning. Verify the changeset holds what was intended, append the task's entry to
   `AutoPhase.md`, and **go straight to the next startable task**.
7. **Loop.**

Then, when the loop stops for any reason, **run the full suite once** over everything it produced.

### Scope the check to what changed

**Never run the whole suite per task.** Where verification is a batch-mode engine run costing
minutes, a full run per task is most of a phase's wall-clock time, and nearly all of it re-proves
code nobody touched.

- **Mid-loop, run only what covers the code the task touched** — its named test class by filter.
  Everything else is *assumed still green*: it passed on the last full run and this task did not
  change it. That assumption is the whole saving, and it is a good bet rather than a certainty.
- **A mutation check is already scoped** and stays exactly as it is: break the wiring, confirm a
  *named* test fails, restore. It is the task's deliverable, not an extra run.
- **At the end — every task done, or the loop blocked — run the full suite once.** This is not
  optional and not a formality. It is what catches the thing a scoped run structurally cannot: a
  regression in code the task never touched but does affect, through a widened contract, a shared
  static, or leaked global state. This project has been bitten by exactly that.

**A task reaches `done` when its own stated check has actually run and passed** — and a filtered
run of that check satisfies it, because it is the same test. What the final pass adds is proof that
tasks did not break *each other*; if it fails, the tasks it implicates go back to `in-progress`
with the real output recorded, however green their own scoped run was.

**Say which kind of run a claim rests on.** "`EnemyTuningTests` passed, full suite not yet run" is
the honest form mid-loop, and it is not the same claim as a green phase.

### Never let the loop damage the plan

- **Do not implement `blocked` tasks**, and never invent an answer to unblock one. A blocked
  task is a decision the user deliberately left open; guessing buries that decision inside
  code where nobody will find it.
- **Do not add, renumber, or reword tasks.** Only `status` changes. If the plan is wrong —
  a missing dependency, a task that can't be verified as written — record it for the report and
  keep going. `phase-tasks` fixes plans; this skill does not.
- **Do not retry forever.** If a task fails verification after `test-and-fix` has exhausted its
  attempts, leave it `in-progress`, note it, and move to the next task. A loop that keeps
  grinding one broken task burns the whole budget on it.
- **Never close a manual checkpoint yourself.** A plan that separates an automated ground truth
  from a manually-checked UI layer contains tasks only a person can complete — a play session, a
  visual check. Tooling cannot satisfy one, and marking it `done` because the code beneath it
  compiles is how an empty scene once passed a phase. **Park it and keep going:** leave it
  `in-progress`, take everything that does not depend on it, and hand it over in the report with
  **what to look at and what would count as wrong**, carrying any number you can derive yourself
  so the user confirms a prediction rather than investigating.

---

## Part 2 — Stop conditions

**Only a blocker the user alone can clear stops the loop.** Everything else — unreviewed work, a
parked checkpoint, one failed task, a long phase — is a reason to keep going, not to wait.

Stop and report when any of these is true:

- **A full blocker: nothing startable remains, and clearing it needs the user.** An open decision
  no document answers, an unauthored asset, a manual checkpoint that is now the only work left, a
  failure `test-and-fix` cannot resolve, or an action `PERMISSIONS.md` does not pre-authorize.
  Name it, name who owns it, and say exactly what would unblock it.
- **The startable set is empty** and nothing is in flight.
- **The phase is complete** — every task `done`, including the close-out and any manual
  checkpoint. Check the plan carries a close-out at all: documents updated, findings closed,
  recorded test counts matching an actual run. If it has none, **say so rather than adding one**.
- **A judgement the documents do not answer and the code cannot settle.** Full auto commits code;
  it does not invent product decisions. Record the question, proceed under a stated assumption where
  one is safe, and stop where none is.

**A partial blocker is not a stop.** A blocked or parked task blocks its dependents, not the loop.
Take everything else first, and stop only when the parked work is all that is left.

**These are not stop conditions:** the diff growing large, a task awaiting review, or the phase
simply being long.

---

## Part 3 — Running out of tokens, and continuing after reset

You cannot detect or control a usage limit, and the session may simply stop. **Do not try to
predict it.** What makes this survivable is Part 0: the repo is always current, so resuming is
just running this skill again.

To continue automatically after a reset, the run must be scheduled by something outside it:

- **Dynamic `/loop`** — self-paced re-entry. The natural fit: each wake-up re-enters this
  skill, reads `Tasks.md`, and continues from wherever the last run stopped. Pick a delay
  matching the reset window rather than polling every few minutes; a wake-up that finds no
  budget accomplishes nothing.
- **A scheduled routine** for longer or unattended gaps.

Whichever is used, **the resumption prompt is just this skill plus the phase** — no state
needs passing, because there is no state to pass beyond what is on disk.

When re-entering, always run the Part 0 reconcile first. A run killed by a token limit very
likely left a task `in-progress`.

If asked to keep going and no scheduling mechanism is available, say so plainly rather than
pretending the loop will continue on its own.

---

## Part 4 — Report

Whenever the loop stops, report:

- **Every task finished this run, in dependency order**, each with its **changeset id**, what it
  does, what verification proved it, and the files it touched. Never describe a task as done whose
  check did not actually run.
- **Say plainly that this work was committed unreviewed**, and give the changeset range, so the
  user knows exactly what to read back and what a revert would target.
- **What was verified, and how.** Real numbers: tests run and passed, builds produced — from the
  single end-of-run pass. Distinguish tasks it settled to `done` from any left `in-progress`
  because their check failed or never ran.
- **What stopped the loop**, why it needs the user, and what would clear it.
- **What is parked** — blocked tasks and manual checkpoints — with what to look at for each.
- **Plan discrepancies** found: missing dependencies, unverifiable tasks, files touched that
  the plan did not predict.
- **What is startable next**, once the blocker clears.
- **Whether a resumption is scheduled**, and when — or plainly that none is.
