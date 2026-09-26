---
name: commit-task
description: Commit a finished task's changes, and push them when the version control system separates the two. Requires that verification has passed and the user has reviewed the diff. Verifies afterwards that the commit actually captured what was intended. Use when asked to commit or push completed task work.
---

The last step of the pipeline. This skill performs the commit; it does not decide whether the
work is ready.

---

## Preconditions — check these before anything else

Two things must already be true:

1. **Verification passed.** Tests and whatever else the project's bar requires ran, and went
   green.
2. **The user reviewed the actual diff and approved it.** Not "was told what changed" —
   looked at the changes.

Both come from the **`commit-gate`** skill. If either is missing or you are unsure whether it
happened, **stop and run `commit-gate` first.** Do not reconstruct the gate here, and do not
treat "the work looks finished" as equivalent to "the user approved it."

If the user asked for a commit directly without the gate having run, say so and run the gate.
Committing unreviewed work because it was asked for in the moment is the failure this whole
pipeline exists to prevent.

---

## Step 1 — Scope the commit to the task

Commit **this task's changes and nothing else.**

List everything currently pending. If unrelated work is also uncommitted — another task, a
stray experiment, a config change — leave it out and say explicitly what you excluded and why.
Sweeping up unrelated changes makes the history unreadable and makes reverting the task
impossible without collateral damage.

Include the task's `Tasks.md` status update in the same commit. The status change and the code
it describes are one logical change, and splitting them leaves the plan and the history
disagreeing about what is finished.

---

## Step 2 — Handle the version control system's actual mechanics

**Some systems will silently omit files you believe you are committing.** Learn how this one
behaves before relying on it:

- Systems that require an explicit stage or checkout step (`git add`, `cm checkout`) will
  quietly skip modified tracked files that were never staged — reporting success and creating
  a commit that is missing them. Files edited by tools other than the IDE are the usual
  victims.
- Adding a *new* file and committing a *modification* are often different operations. Doing
  one does not cover the other.

So: stage or check out everything the commit should contain, explicitly, before committing.

---

## Step 3 — Write a message worth reading

Describe **what the change does and why**, not which files were touched — the diff already
lists the files.

- A short subject line naming the change in plain terms.
- A body explaining the reasoning where it isn't obvious, and any tradeoff deliberately taken.
- **Reference the task id**, so the history and the task plan stay linked in both directions.

---

## Step 4 — Verify the commit actually captured what you intended

**Do not trust the success message.** After committing:

- Diff the new commit against its parent and confirm it contains the files you expected.
- Check that the working copy is now clean of this task's changes.
- Confirm the workspace is **on the mainline** before committing. Work happens there, so a
  workspace left elsewhere by an interrupted operation puts the commit somewhere unexpected
  while still reporting success.
- When the commit is a **merge to the mainline**, verify the merge changeset actually carries
  the content. Version control can auto-resolve a same-path conflict destructively (Plastic's
  `eviltwin-dst` is the model) and print `Created changeset cs:N` for an **empty** changeset —
  this project saw two merges in a row fail that way before anyone noticed. Diff the merge
  changeset; empty means the mainline still lacks the work.

If something is missing, fix it and commit again — and say what went wrong. A commit that
silently dropped half the work is worse than an obvious failure, because everyone downstream
believes the work is safe.

---

## Step 5 — Push, if pushing is a separate thing here

**First determine whether this system separates committing from publishing.**

- **Distributed systems** (git, Plastic in distributed mode) keep commits local until pushed.
  Here a commit is a private, still-amendable checkpoint, and pushing is the outward-facing
  step. **Ask before pushing** unless standing permission covers it — publishing is visible to
  others and awkward to retract.
- **Centralized systems** (Plastic against a hosted server, Perforce, Subversion) publish on
  commit. There is no local staging area and no quiet amend. **Say so before committing**, not
  after, so the user knows the change goes out the moment it lands.

Never describe work as pushed when it is only committed, or as committed when it is only
staged. If a push fails, report it plainly — the work is not where the user thinks it is.

---

## Report

State: what was committed, the commit identifier, what the verification of Step 4 showed, what
was deliberately excluded, and whether it was pushed or is waiting.

Then say **what is now unblocked** in `Tasks.md` — tasks whose predecessors just completed.
That is the input to the next run.
