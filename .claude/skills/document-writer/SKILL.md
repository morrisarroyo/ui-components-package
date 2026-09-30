---
name: document-writer
description: Writes and edits documentation so it is short, plain and clear, with no slop, no meandering and no needless technical detail. Use this whenever you write, edit, restructure or review any documentation — READMEs, docs pages (Markdown or MDX), guides, interview or process notes, changelogs, doc comments meant for readers — even if the user did not ask for concision, and always before you finish a task that created or changed a doc. Also use it when the user says docs are wordy, verbose, long, rambling, meandering, unclear, too technical, full of AI slop, or "too much information".
---

# Document writer

Docs are read by someone busy, often new, who wants one thing. Every extra word
costs them time and hides the sentence they came for. Write the shortest version
that is still complete and correct.

## Workflow

1. **Find the reader and the purpose.** Who opens this doc, and what do they need
   to do next? The first line says what the thing is for and who it is for, in
   the project's own domain terms. If a brief, spec or README states why the
   project exists, use its framing. Never open with a count ("Five
   components…") or a generic tagline ("Reusable components for building
   consistent screens").
2. **Measure first.** Run the checker on the file(s):
   `python3 <this skill>/scripts/check_docs.py FILE...`
   It flags wordy phrases, filler, stock "slop" phrasing, long sentences and
   paragraphs, and acronyms never spelled out. Findings are prompts to look,
   not verdicts. Note the word count.
3. **Rewrite in three passes**, largest first:
   - **Structure.** Put what the reader needs first. Say each fact once, in the
     place a reader looks for it, and link to it elsewhere. Cut sections that
     serve the author instead of the reader (how it was built, how it is
     tested) or move them to a contributor section.
   - **Sentences.** Lead with the point. One idea per sentence; split anything
     over ~25 words. Use a bulleted list for three or more parallel items and a
     table for reference data. Active voice: say who does what.
   - **Words.** Replace wordy phrases with the short form, cut filler and hedges,
     use plain words over jargon, and spell out an acronym the first time.
4. **Keep it correct.** Brevity never outranks truth. Do not drop a fact the
   reader needs, change code blocks, or break structure the project tests or a
   spec requires (props tables, headings, links). If a claim looks wrong,
   check it against the code rather than smoothing it over.
5. **Measure again.** Re-run the checker and any doc tests the project has.
   Report the word count before and after and what remains flagged, with a
   reason if you kept it.

## Reducing technicality

Explain what the reader gets and does, not how it works inside. Keep
implementation detail (file paths and line numbers, build internals, test
mechanics, library names) out of reader-facing docs unless the reader has to
act on it. When a term is unavoidable, define it in a few plain words the first
time.

## Meandering, and how to fix it

<!-- check-docs: off -->
| Meandering | Direct |
| --- | --- |
| In order to install the package, you will need to run… | To install it, run… |
| It is worth noting that the button is disabled while loading. | The button is disabled while loading. |
| This section explains how you can go about adding a component. | To add a component: |
| The component has been designed in such a way that it handles its own states. | The component handles its own states. |
| There are a number of options that are available. | There are three options: … |

Signs of slop to remove:

- stock words: robust, seamless, leverage, delve, comprehensive;
- announcing what you are about to say, or summarising what you just said;
- restating a point in other words;
- hedges (generally, typically) that add doubt without information.
<!-- check-docs: on -->

## Running it automatically

The checker exits non-zero with `--strict`, so it can gate a commit or CI step,
or run from a Claude Code hook after every Markdown edit. See
`references/automation.md` for ready-to-paste setups; offer them when the user
wants the check to happen without asking.
