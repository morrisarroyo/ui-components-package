---
name: phase-tasks
description: Read one phase of CLAUDE.md and break it into tasks that can each be separately implemented and separately tested, working out what genuinely depends on what so the order is honest and shallow, then write the plan into Tasks.md. Grills the user first if the phase is missing information the plan would otherwise have to invent. Use when asked to plan a phase, break a phase into tasks, or order upcoming work.
---

**Two goals, together.** Produce tasks that can each be **separately implemented and separately
tested**, and keep the ordering between them **honest and shallow** — as few tasks waiting on
another as the work actually requires. A task nobody can verify on its own is a failure of
decomposition; a plan where everything must happen in sequence is a failure of dependency
analysis.

Work is done **one task at a time on the mainline**, so a wide graph does not buy simultaneous
execution. What it buys is **choice and reach**: every task with no unfinished predecessor can be
picked up next, so a wide graph lets the most valuable work go first and a deep chain forces an
order nobody chose. A spurious edge is therefore still expensive — it makes work wait for no
reason. Every rule below serves one or both goals.

**A shallow graph does not come from isolating tasks** — tasks are allowed to share files and to
depend on predecessors. It comes from keeping the dependency graph honest, and
from recording the resulting order as data another skill can read.

Take the phase from the invocation argument — `1`, `Phase 2`, a phase title, whatever was
passed. **If no argument was given, list the phases you found and ask which one. Do not
guess.**

Four parts, in order. Do not skip ahead; the plan is only as good as the reading behind it.

---

## Part 1 — Read everything first

Read the **whole** phase section in `CLAUDE.md`, not just its headings.

Then find and read the companion documents. Projects routinely split decisions across files —
a design document, a development document, an architecture or conventions file, an ideas
backlog. `CLAUDE.md` may cross-reference them; it may not. Check the working directory.

**Decisions already recorded elsewhere are settled. Honor them, never re-derive them.** If a
development document already fixes the build order, the folder layout, or the testing
approach, the plan follows it. Contradicting a recorded decision — or quietly re-deciding
something because you'd have chosen differently — is the main way this skill produces a plan
nobody can use.

Two companions deserve explicit mention. If the project keeps a **memory document** (this
one's `Docs/LongTermMemory.md`), read it before planning — it says where things actually
stand, which is what stops the plan re-creating what exists or trusting a stale claim. And if
the project keeps **retrospectives, read the relevant one before planning a phase** — they
are largely a catalogue of operations that reported success and changed nothing, which is
precisely the failure a task plan's `verify` fields must be designed against.

Also read enough of the actual codebase to know what already exists. A plan that says "create
the encounter system" when a stub is already sitting there is wrong before it's written. Note
what's present, what's a template default, and what's genuinely absent.

---

## Part 2 — Grill, but only about what's missing

Do **not** run a full interview. This skill grills to unblock planning, nothing more.

Go through the phase and list what a task plan would have to **invent** to proceed —
unstated dependencies, undefined data shapes, features described by name with no behavior,
acceptance criteria that don't exist. Anything explicitly marked open or deferred in the
source documents is a known gap, not a discovery; treat it as a blocker to surface, not a
question to force.

If nothing material is missing, say so and go straight to Part 3.

Otherwise ask, in rounds, using this format:

```
❓ **Q1** - **<question title>**: <what's missing, and what the plan would have to assume without it>

➡️ <your recommended answer>
```

Every question gets a real recommendation with reasoning, never a menu. Number continuously
across the session, never restarting. At the end of each round, re-list any earlier question
that went unanswered — a dropped question becomes a silently assumed answer. After asking the
same thing three times, state the assumption you'll proceed under and stop asking.

Ask only what genuinely blocks the plan. Details that can be decided *while doing* a task
belong in the task, not in an interview.

---

## Part 3 — Work out what can actually run in parallel

This is the part that carries the value, and it is easy to fake. Getting it right means
being strict about what "parallel" means.

### Decompose so each task can be implemented and tested on its own

Break the phase into tasks that can each be **separately implemented and separately tested**.
That is the goal; everything below serves it.

Cut along **behavior** boundaries, not file boundaries. Slicing by file tends to produce
fragments that individually do nothing observable and therefore can't be checked on their own.
Every task needs a verification that confirms it specifically — a named test, a build that
succeeds, or an explicit manual check. A task nobody can tell is finished is not a task.

**Write each `verify` at the right tier.** Where the project separates an automated ground
truth from a manually-checked layer — as this one does: the command-line gameplay core is
verified by tests, the Unity UI by a human once per completed loop step — gameplay behaviour
gets an automated check, and Editor-side wiring (scenes, prefabs, `[SerializeField]`
references) gets an honest manual check rather than a test that cannot see it. Tests staying
green while the scene contains none of the code is this stack's recurring failure; a `verify`
written at the wrong tier is how it recurs. If an acceptance document owns verification
(this one's `Docs/ACCEPTANCE.md`), draw the checks from it, and note that new tests must
extend its recorded counts in the same change.

Size them so one sitting finishes one task; split anything larger.

### Keep the graph shallow, and every edge earned

**A large startable set is a primary goal of this plan.** Aim for as much work as possible being
*eligible* at any moment, even though only one task is worked at a time.

But **hard separation is not the mechanism, and is not required.** Tasks may share files and
may depend on predecessors. Do not re-cut a sensible task merely because it touches a file
another task also touches, and do not manufacture artificial independence to make a plan look
wide.

It comes from the **shape of the dependency graph**: a wide, shallow graph leaves a real choice
of what to do next, a deep chain leaves none. So the thing to optimize is the number of `after`
edges — and every one of them is a claim you have to justify.

For each task, record its predecessors — the tasks whose output it genuinely consumes: a type,
an interface, an asset, a scene, a settled decision. **A dependency that exists only because
one thing *feels* like it comes second is not a dependency.** Spurious edges serialize work
far more effectively than shared files ever do, and they are the single biggest thing that
quietly turns a plan with options into a fixed queue. When unsure whether an edge is real, ask
what concretely breaks if the later task is done first; if the answer is "nothing, it'd just feel
odd," drop it.

Prefer decompositions that **widen** the graph. If a task has many dependents, consider whether
part of it can be split out and finished early to unblock them sooner.

**Name the files each task touches.** This is not a gate on decomposition — two tasks sharing
a file may both exist — but it is the data the executor needs to choose a safe order. **Work
happens on the mainline, one task at a time**, so the risk is no longer a bad merge between
branches; it is a half-finished task sitting in a file the next one has to edit.

Flag the files that merge *badly*, not merely the ones that overlap. Two tasks appending to
different areas of a source file merge fine. Two tasks editing the same **Unity scene or
prefab** do not — `.unity` and `.prefab` are YAML, but merging them produces silently broken
GUID and `fileID` references rather than honest conflict markers. The same applies to project
settings, assembly definitions, and central registries or manifests.

So mark any task touching a merge-hostile file, and **avoid routing several tasks through the
same scene or settings file** when the work can be arranged otherwise. Such a file is one nobody
can review a partial change to, so a task must leave it in a finished state before the next task
opens it. A decomposition where six tasks all edit one scene is a plan with one very long
sequential spine, whatever the dependency graph says.

### Shared scaffolding lands first

Some things several tasks need must exist before any of them starts: folder structure, package
manifests, index or barrel files, assembly definitions, project files listing sources.

Left implicit, each task creates its own — and even when the content is byte-identical that is
not free. Version control tracks item identity, not just bytes, so the same path created twice
becomes two items (Plastic calls it an "evil twin", git an add/add conflict), and auto-resolution
can be destructive; see the development document for what `eviltwin-dst` does. The everyday
version is duller and just as costly: three tasks each half-editing one manifest, none of them
reviewable on its own.

So **give shared scaffolding its own task, with no predecessors, and make every task that needs
it depend on it.** This is one of the few places where an `after` edge earns its cost outright,
because the alternative is not a conflict you can see.

### Structure the result

From the predecessor graph, derive and report:

- **What can start immediately** — every task with no unfinished predecessors. State the
  count. This is the plan's headline number: how many things can be picked up right now.
- **How the startable set holds up** — how many tasks are eligible after each layer completes.
  A plan that starts wide and immediately narrows to one has a hidden spine and should be
  re-examined.
- **The critical path** — the longest dependency chain. That is the floor on the number of
  sequential steps the phase takes, and the first thing to attack when it needs to be shorter.
- **Genuine convergence points** — places where several tasks feed one successor. Note them,
  but don't insert barriers for tidiness; a barrier that isn't required by a real dependency
  costs exactly as much as one that is.

If the startable set comes out small, treat that as a signal to revisit the decomposition and
the edges before writing the file — not as a fact to report and accept.

---

## Part 4 — Write Tasks.md

Write to `Tasks.md` in the working directory unless another path was named.

**If `Tasks.md` already exists, revise it in place.** Preserve its structure and any completion
state already recorded — never reset checkboxes or delete finished work. Add or update this
phase's section and leave other phases alone.

Write for someone who wasn't in the conversation. Never reference question numbers from the
grilling.

### The format is a contract — another skill has to read it

`Tasks.md` is not only for humans. A downstream skill must be able to parse it, see what is
already done, resolve what is now unblocked, and adjust. So the per-task block below is a
**fixed format**: the same field names, in the same order, present on every task, one per
line. Never drop a field, never rename one, never let a task drift into freeform prose.

Open the file with a short **Format** section documenting these fields and the allowed
`status` values, so a future reader — human or skill — knows the contract without guessing.

Each task is written exactly like this:

```
### T-101 — Short task title
- **status:** todo
- **after:** —
- **files:** Assets/Game/Core/Save/ISaveStore.cs
- **verify:** EditMode test SaveStoreTests passes
- **goal:** One line on what done looks like.
```

- **`id`** — in the heading, `T-` plus a number. **Stable across re-runs.** Ids are how
  dependencies and progress stay resolvable between sessions; renumbering breaks every
  reference and every record of what was finished.
- **`status`** — one of `todo`, `in-progress`, `done`, `blocked`. A downstream skill both
  reads and updates this.
- **`after`** — comma-separated predecessor ids, or `—` when nothing blocks it. This is the
  ordering data. A task whose `after` list is empty or fully `done` is startable now.
- **`files`** — paths the task is expected to touch, as a coordination note. Overlap with
  another task is allowed; it is information, not a conflict.
- **`verify`** — the specific check that confirms this task is done: a named test, a build
  that succeeds, or an explicit manual check.
- **`goal`** — one line.

Around the tasks:

- **A short orientation** — what the phase delivers, what can start immediately, and what the
  critical path is.
- **Blockers** — anything that cannot start because a decision is still open. Set `status:
  blocked`, and name the open question and which document owns it. Never silently invent an
  answer to unblock your own plan.
- **Explicitly out of scope** — anything from a later phase a reader might expect here, so it
  is visibly deferred rather than forgotten.

### After writing

Summarize the shape: how many tasks, how many can start immediately, what the critical path
is, and what's blocked and on what. Call out anything you had to assume. Don't start
implementing, and don't commit, unless asked.
