---
name: commit-gate
description: The required sequence between finishing work and committing it — run test-and-fix until verification passes, then show the user the complete diff of everything the task changed so they can review it themselves, and only commit after they approve. Use whenever implementation work is finished and about to be committed.
---

Finished work does not go straight into version control. It passes this gate first.

```
work finished  →  code review  →  user approves  →  commit
```

**Nothing commits unreviewed.** That is the core thing this skill exists to prevent.

If work was **just verified by an agent** (tests run and passed immediately before this
gate), skip Step 1 below. If work is older or verification status is unclear, always run
Step 1 first.

---

## Step 1 — Test and fix (skip if just verified)

Invoke the **`test-and-fix`** skill. Run the project's verification, diagnose any failures to
root cause, and fix them.

**The gate does not open until verification actually passes.** Not "passes except for one
known failure," not "passes apart from something unrelated," not "would pass if the Editor
weren't open." If verification cannot be brought to green:

- Stop here. Do not proceed to review, and do not commit.
- Report what is failing, with the real output.
- Say plainly that the work is not committable yet, and why.

If `test-and-fix` hits its attempt bound without reaching green, that is a stop, not a
formality to note and step past.

---

## Step 2 — Code review: generate and present diffs

**Code review here means the user reads the changes themselves.** It is their chance to look
at *everything the task touched*. It is not a report about the changes, and not a summary of
what you did.

Generate a complete diff for each task:

- **Every file the task changed**, with its actual content — added, modified, deleted, moved.
- **Scoped to this task.** If multiple tasks are in the gate, show each task's changes in a
  separate section, then list anything uncommitted that's excluded and why.
- **Complete.** Never truncate, elide, or silently drop a file because the diff got long. If
  it is large, lead with a file-by-file map so it can be navigated, then show the diff — but
  show all of it.
- **Never substitute a description for the code.** "Added the scoring pipeline and wired it
  to the config" is not a review; the diff is.

Write all diffs to **`Commit.md`** in the working directory. Present that file to the user.

Read the diff yourself before presenting it, and flag anything you think deserves a second
look — but as annotation alongside the changes, never in place of them.

### Automated review as a supplement

Optionally also invoke the **`code-review`** skill and include its findings in `Commit.md`,
most serious first, with file and line. Treat it as a second pair of eyes that may catch
something, not as the review itself — a clean automated result is not permission to skip
showing the diff.

Do not fix findings unilaterally and do not decide on the user's behalf which ones matter.
The user decides what gets addressed.

---

## Step 3 — Wait for approval

**The user decides whether the work is committed.** Ask, and wait.

Three outcomes:

- **Approved** → hand off to the **`commit-task`** skill, which scopes the commit to this
  task, handles the version control system's staging mechanics (checkout, add, commit),
  verifies the commit actually captured what was intended, and pushes if pushing is a
  separate step here.
- **Changes requested** → make them, then **restart from Step 1.** This is not optional
  bookkeeping. New code invalidates the earlier passing run — the tests that went green
  described different code than the code now being committed. Re-test, re-review, re-present.
- **Held** → leave it uncommitted and say what state it's in.

**Waiting on a review does stop other work, and that is the cost of working on the mainline.**
There is no task branch to absorb the wait: a second task started before this one is committed
lands on top of it in the same working tree, and neither diff can then be reviewed on its own.
So gate promptly, keep the diff small, and do not begin the next task until this one is
committed or explicitly held.

Keep track of what is awaiting review. At most one task should be sitting there — if a second
has accumulated, say so, because the two diffs are now tangled and neither can be judged alone.

---

## What this gate does not cover

It governs **completed implementation work**. It is not meant to obstruct routine
housekeeping — committing a document, an ignore rule, a configuration change — where there is
no code to test and nothing to review. Use judgment: if the change contains no logic, the gate
has nothing to act on and standing commit permissions apply as normal.

The moment there is code in the change, the gate applies in full.

---

## Report

State which steps ran and what each returned: whether testing was skipped (and why), what the
review found, what the user decided, and whether a commit happened. If the gate stopped early,
say at which step and why.

Never describe work as committed that isn't, and never describe a gate step as passed when it
was skipped.
