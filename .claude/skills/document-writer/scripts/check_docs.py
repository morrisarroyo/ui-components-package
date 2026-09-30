#!/usr/bin/env python3
"""Flag verbose, meandering, sloppy or overly technical prose in Markdown docs.

Usage:
  python check_docs.py FILE [FILE ...]            report findings
  python check_docs.py --strict FILE [FILE ...]   also exit 1 if any finding (for hooks/CI)
  python check_docs.py --json FILE                machine-readable output

Code, quoted text, URLs, HTML tags, YAML frontmatter and anything between
<!-- check-docs: off --> and <!-- check-docs: on --> are ignored, so only the
doc's own prose is judged.
The word lists are deliberately short and common; a finding is a prompt to look,
not a verdict.
"""
import json
import re
import sys

# Phrases that add words without adding meaning. Each maps to a shorter form.
WORDY = {
    r"\bin order to\b": "to",
    r"\bdue to the fact that\b": "because",
    r"\bthe fact that\b": "that (or rephrase)",
    r"\bat this point in time\b": "now",
    r"\bin the event that\b": "if",
    r"\bfor the purpose of\b": "for / to",
    r"\bwith regard to\b|\bwith respect to\b|\bin terms of\b": "about / for",
    r"\ba number of\b": "some / several (or the number)",
    r"\bis able to\b|\bare able to\b": "can",
    r"\bit is worth noting that\b|\bit should be noted that\b|\bnote that\b": "(cut; just say it)",
    r"\bit is important to\b|\bit's important to\b": "(cut; just say it)",
    r"\bthat is to say\b|\bin other words\b": "(cut; say it once, clearly)",
    r"\bas well as\b": "and",
    r"\bprior to\b": "before",
    r"\bsubsequent to\b": "after",
    r"\bin addition\b|\badditionally\b|\bfurthermore\b|\bmoreover\b": "also (or cut)",
    r"\bneedless to say\b": "(cut)",
    r"\bso as to\b": "to",
    r"\bwhether or not\b": "whether",
    r"\bmake use of\b|\butilize\b|\butilise\b": "use",
    r"\bin a way that\b|\bin such a way that\b": "so that (or rephrase)",
    r"\bthe way (?:that )?\w+ \w+ is\b": "(rephrase directly)",
}

# Words that pad or hedge without informing.
FILLER = [
    "basically", "essentially", "simply", "just", "actually", "really", "very",
    "quite", "fairly", "somewhat", "clearly", "obviously", "of course",
    "generally", "typically", "arguably",
]

# Stock phrasing that reads as generated text.
SLOP = [
    "delve", "leverage", "leverages", "leveraging", "robust", "seamless",
    "seamlessly", "comprehensive", "cutting-edge", "state-of-the-art",
    "empower", "empowers", "unlock", "unlocks", "elevate", "streamline",
    "holistic", "synergy", "game-changer", "in today's", "ever-evolving",
    "navigate the", "a testament to", "plays a crucial role", "it's worth",
    "rest assured", "look no further", "in conclusion", "in summary",
    "whether you're", "at the end of the day",
]

LONG_SENTENCE = 28      # words
LONG_PARAGRAPH = 90     # words


def blank(match):
    """Replace a span with its newlines only, so line numbers stay right."""
    return "\n" * match.group(0).count("\n")


def strip_markup(text):
    """Remove what is not the doc's own prose: YAML frontmatter, regions between
    <!-- check-docs: off --> and <!-- check-docs: on -->, fenced code, inline
    code, quoted text (examples, quotations), URLs, HTML/JSX tags and link
    targets."""
    text = re.sub(r"\A---\n.*?\n---\n", blank, text, flags=re.S)
    text = re.sub(r"<!--\s*check-docs:\s*off\s*-->.*?(<!--\s*check-docs:\s*on\s*-->|\Z)", blank, text, flags=re.S)
    text = re.sub(r"```.*?```", blank, text, flags=re.S)
    text = re.sub(r'"[^"\n]*"|“[^”\n]*”', "QUOTE", text)
    text = re.sub(r"`[^`\n]*`", "CODE", text)
    text = re.sub(r"\]\([^)]*\)", "]", text)
    text = re.sub(r"https?://\S+", "URL", text)
    text = re.sub(r"<[^>\n]+>", " ", text)
    return text


def prose_lines(text):
    """Yield (line_number, line) for prose, skipping headings and table rules."""
    for number, line in enumerate(strip_markup(text).split("\n"), start=1):
        stripped = line.strip()
        if not stripped or re.fullmatch(r"\|?[\s:\-|]+\|?", stripped):
            continue
        if stripped.startswith("#") or stripped.startswith("import ") or stripped.startswith("<"):
            continue
        yield number, line


def paragraphs(text):
    """Yield (first_line_number, text) for each prose paragraph and each list
    item (with its continuation lines). Headings, tables and markup lines are
    skipped: tables hold reference data, which is allowed to be terse."""
    buffer, start = [], None

    def flush():
        nonlocal buffer, start
        if buffer:
            yield start, " ".join(buffer)
        buffer, start = [], None

    for number, line in enumerate(strip_markup(text).split("\n"), start=1):
        stripped = line.strip()
        skip = not stripped or stripped.startswith(("#", "|", "import ", "<"))
        item = re.match(r"([-*]|\d+\.)\s+(.*)", stripped)
        if skip:
            yield from flush()
        elif item:
            yield from flush()
            start, buffer = number, [item.group(2)]
        else:
            if start is None:
                start = number
            buffer.append(stripped)
    yield from flush()


def check(path):
    text = open(path, encoding="utf-8").read()
    findings = []

    for number, line in prose_lines(text):
        lower = line.lower()
        for pattern, better in WORDY.items():
            for match in re.finditer(pattern, lower):
                findings.append((number, "wordy", f'"{match.group(0)}" → {better}'))
        for word in FILLER:
            if re.search(rf"\b{re.escape(word)}\b", lower):
                findings.append((number, "filler", f'"{word}" (cut unless it changes the meaning)'))
        for phrase in SLOP:
            if re.search(rf"\b{re.escape(phrase)}", lower):
                findings.append((number, "slop", f'"{phrase}" (stock phrasing; say the plain thing)'))

    acronyms_defined = set(re.findall(r"\(([A-Z]{2,6})\)", strip_markup(text)))
    seen_acronyms = set()
    for start, para in paragraphs(text):
        words = para.split()
        if len(words) > LONG_PARAGRAPH:
            findings.append((start, "long-paragraph", f"{len(words)} words (split or cut; aim under {LONG_PARAGRAPH})"))
        for sentence in re.split(r"(?<=[.!?])\s+", para):
            count = len(sentence.split())
            if count > LONG_SENTENCE:
                findings.append((start, "long-sentence", f'{count} words: "{" ".join(sentence.split()[:8])}…"'))
        for acronym in re.findall(r"\b[A-Z]{3,6}\b", para):
            if acronym in {"CODE", "URL", "QUOTE", "API", "HTML", "CSS", "JSON", "README", "TODO", "NOTE", "PDF", "FAQ", "MDX", "YAML"}:
                continue
            if acronym not in acronyms_defined and acronym not in seen_acronyms:
                findings.append((start, "jargon", f'"{acronym}" is never spelled out (define it once, or drop it)'))
            seen_acronyms.add(acronym)

    prose_words = sum(len(p.split()) for _, p in paragraphs(text))
    sentences = [s for _, p in paragraphs(text) for s in re.split(r"(?<=[.!?])\s+", p) if s.strip()]
    average = round(prose_words / len(sentences), 1) if sentences else 0
    return {
        "file": path,
        "total_words": len(re.findall(r"\S+", text)),
        "prose_words": prose_words,
        "average_sentence_words": average,
        "findings": [{"line": n, "kind": k, "message": m} for n, k, m in sorted(findings)],
    }


def main(argv):
    strict = "--strict" in argv
    as_json = "--json" in argv
    files = [a for a in argv if not a.startswith("--")]
    if not files:
        print(__doc__)
        return 2
    reports = [check(f) for f in files]
    if as_json:
        print(json.dumps(reports, indent=2))
    else:
        for report in reports:
            counts = {}
            for f in report["findings"]:
                counts[f["kind"]] = counts.get(f["kind"], 0) + 1
            summary = ", ".join(f"{k} {v}" for k, v in sorted(counts.items())) or "none"
            print(f"{report['file']}: {report['total_words']} words ({report['prose_words']} prose), "
                  f"{report['average_sentence_words']} words/sentence; findings: {summary}")
            for f in report["findings"]:
                print(f"  {f['line']:>5}  {f['kind']:<15} {f['message']}")
    if strict and any(r["findings"] for r in reports):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
