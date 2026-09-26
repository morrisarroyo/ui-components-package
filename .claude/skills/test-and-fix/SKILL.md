---
name: test-and-fix
description: Run the project's tests and builds, diagnose any failures down to root cause, and rewrite the offending code until verification actually passes. Asks before structural rewrites, and never weakens a test to make it green. Use when asked to test the code, check that things still work, or fix failing tests.
---

Run the project's verification, find out what's actually broken, and fix it.

**The rule that outranks every other rule here: never make a test pass by weakening it.**
Deleting an assertion, loosening a comparison, adding a skip, catching and swallowing the
error, or narrowing the input until the bug is out of range — all of these produce green
output and leave the bug in the product. Green that was obtained by lowering the bar is worse
than red, because it stops anyone looking.

---

## Part 1 — Find out how this project verifies itself

Don't guess at commands. Read the project's own documents — `CLAUDE.md` and any development,
contributing, or conventions document it references. Projects usually state their verification
bar explicitly: which test runner, which command, whether a build counts, what "done" means.
**If the project has an acceptance document that owns the verification commands** (this one's
`Docs/ACCEPTANCE.md`), it is authoritative — run its commands as written, including any
ceremony around them, rather than reconstructing equivalents from memory.

Note whether the project distinguishes **per-change** verification from **per-milestone**
verification. If it does, run the per-change bar by default and the fuller one only when
asked, or when the change is large enough to warrant it.

If no verification is documented, look at what exists — test directories, test frameworks in
the manifest, build scripts — then say what you found and what you intend to run before
running it.

---

## Part 2 — Run it and triage

Run the verification and capture the **actual output**. Never paraphrase a failure you
haven't read.

Three traps sit around the run itself:

- **Delete stale result files before running.** A runner that dies before the framework
  starts — most often because something else holds the project lock — leaves the *previous*
  run's results file untouched, and reading it back reports a clean pass for a run that never
  happened. Read counts from the results file, never from the log's closing lines, and treat
  a **missing results file as a failure**, not as an absence of information.
- **Check for resource locks before diagnosing.** If verification needs exclusive access that
  an open editor holds (Unity's project lock is the model), detect the lock and act per the
  project's standing permissions — this project authorises closing the Editor and continuing —
  rather than chasing phantom failures.
- **A shrinking test count is a failure.** Where the project records expected totals, a run
  reporting fewer tests than expected usually means something did not compile; investigate
  the count before believing any green.

Sort every failure into one of three buckets before touching any code:

- **A real bug** — the code does the wrong thing. Fix the code.
- **A stale or wrong test** — the code is right and the test encodes an outdated expectation.
  Fixing this means changing the test, which is legitimate *only* when the specification backs
  you up. Cite the document or requirement that says so. "The test is inconvenient" is not
  evidence that the test is wrong.
- **Environment or flake** — a missing tool, a locked project, a licensing error, a timeout,
  a genuinely nondeterministic test. Fix the environment or report it. Do not "fix" code to
  work around it.

Getting this triage wrong is how a working feature gets rewritten to satisfy a broken test,
or a real bug gets buried by editing the test that caught it. When you cannot tell which
bucket a failure belongs in, **say so and ask** rather than picking the convenient one.

---

## Part 3 — Diagnose before rewriting

**Reproduce the failure and understand it before changing anything.** A fix written against a
guess usually moves the symptom somewhere less visible.

Find the **root cause**, not the surface. If a value is wrong three layers up from where the
assertion fires, fix it three layers up. Patching the assertion site makes the test pass and
leaves every other caller broken.

When several tests fail together, check whether they share one cause. One root cause behind
five failures is common, and fixing it once beats five separate patches. When failures are
genuinely independent, fix them **one at a time** — batching means you can't tell which change
fixed which failure, or which one introduced a new problem.

---

## Part 4 — Fix, or prompt for a rewrite

**Fix directly** when the change is contained: wrong operator, off-by-one, wrong constant,
missing null check, inverted condition, wrong order of operations. Just correct it and move on.

**Stop and ask first** when the fix would be structural:

- It changes behavior the project's documents specify.
- It requires redesigning a type, interface, or data shape rather than correcting a line.
- It spreads across many files or rewrites a whole component.
- It means changing a test rather than the code.
- Two or more contained fixes have already failed on the same failure.

In those cases, present the diagnosis, the root cause, what the rewrite would involve, and what
you recommend — then wait. A structural rewrite made unilaterally is hard to review and harder
to unwind, and it's exactly where a wrong diagnosis becomes expensive.

**Stay inside the failure.** Fixing a bug is not an invitation to refactor surrounding code,
rename things, or tidy what you're passing through. Note anything worth doing separately and
leave it alone.

### Bound the loop

After **three** failed attempts at the same failure, stop. Report the failure, everything you
tried, what you learned, and what you believe is actually going on. Thrashing produces a pile
of speculative edits that is worse than the original bug and much harder to review.

---

## Part 5 — Re-verify properly

After any fix, **re-run the whole verification, not just the test that was failing.** Fixes
cause regressions, and a targeted re-run is exactly the thing that hides them.

Keep going until verification passes cleanly or the attempt bound is reached.

### Mutation-check an edited test

**Whenever this run changes an existing test's assertion — not adds a new one — the change must be
proven to still catch what it exists to catch.** Editing an assertion is exactly how a test gets
quietly weakened into passing, and it is the one failure mode a normal green re-run cannot surface:
the edited test passes either way.

Temporarily revert the production-code change this fix depends on (or reintroduce the specific bug
the assertion is meant to catch), re-run **only the edited test** — filtered to its class, never the
whole suite for this check — and confirm it now fails for the reason expected. Then restore the fix
and confirm the test passes again. This is the same mutation-check pattern already used elsewhere in
this project for keypress handlers and detection guards; it applies here to every edited assertion,
not only to a named category of code.

Skip this only for a test that is newly added rather than edited — a new test has no prior passing
state to have quietly regressed from.

If the project tracks work in a `Tasks.md`, update the `status` of any task whose verification
this run settles — `done` when its stated check now passes, `in-progress` when it doesn't.
Change only `status`; never renumber ids or restructure the file.

---

## Part 6 — Report

Be exact and unflattering:

- **What was run**, and the result.
- **Each failure**, its root cause, and what was changed to fix it — root cause, not just the
  edit.
- **Anything still failing**, with the real output. Never soften it, never round a partial fix
  up to done.
- **Any test that was changed**, called out prominently, with the specification that justified
  it, and the mutation-check result that proved the edit still catches what it's meant to. This is
  the highest-risk thing this skill can do and it must never be buried in a list — and a changed
  test with no mutation-check result attached is not yet trusted.
- **Adjacent problems you deliberately left alone.**

If verification could not run at all, say that plainly rather than reporting on code you never
exercised. Don't commit unless asked.
