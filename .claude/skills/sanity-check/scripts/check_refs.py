#!/usr/bin/env python3
"""Check that every file reference in the repository's docs resolves.

Scans tracked Markdown and MDX files for relative links, `path/to/file`
mentions in backticks, and `path:line` references, and reports any that
point at a missing file or past the end of one. Prints one line per problem
and exits 1 if there are any.

Usage: python3 .claude/skills/sanity-check/scripts/check_refs.py
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(subprocess.run(['git', 'rev-parse', '--show-toplevel'],
                           capture_output=True, text=True, check=True).stdout.strip())

LINK = re.compile(r'\]\((?!https?:|mailto:|#)([^)\s]+)\)')
TICKED = re.compile(r'`([\w.@/-]+\.[A-Za-z]{1,5})(?::(\d+)(?:-(\d+))?)?`')
SKIP_DIRS = ('node_modules/', 'dist/', '.claude/skills/')
# Docs often write paths relative to a package (`src/index.ts`).
PACKAGES = ('packages/ui', 'packages/app', 'api')
# Not files on disk: URL routes, build output, and the `ui` package's export names.
NOT_FILES = ('/', 'dist/', 'ui/')


def tracked_docs():
    out = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard',
                          '*.md', '*.mdx'], cwd=ROOT, capture_output=True, text=True,
                         check=True).stdout.splitlines()
    # A tracked doc deleted in the working tree is not checked.
    return [ROOT / p for p in out if not p.startswith(SKIP_DIRS) and (ROOT / p).exists()]


def resolve(doc: Path, target: str):
    """A target relative to the doc, else to the repository root, else None."""
    for base in (doc.parent, ROOT, *(ROOT / p for p in PACKAGES)):
        candidate = (base / target).resolve()
        if candidate.exists():
            return candidate
    return None


def main():
    problems = []
    for doc in tracked_docs():
        text = doc.read_text(encoding='utf-8')
        rel = doc.relative_to(ROOT)
        for n, line in enumerate(text.splitlines(), 1):
            for match in LINK.finditer(line):
                target = match.group(1).split('#')[0]
                # Storybook and site routes (?path=, /docs/) are not files.
                if target and not target.startswith(('?', '/')) and resolve(doc, target) is None:
                    problems.append(f'{rel}:{n}: link to missing file {target}')
            for match in TICKED.finditer(line):
                path, start, end = match.group(1), match.group(2), match.group(3)
                if '/' not in path or path.startswith(NOT_FILES):
                    continue  # a bare name like `index.ts` is too ambiguous to check
                found = resolve(doc, path)
                if found is None:
                    problems.append(f'{rel}:{n}: missing file {path}')
                elif start and found.is_file():
                    length = len(found.read_text(encoding='utf-8', errors='replace').splitlines())
                    last = int(end or start)
                    if last > length:
                        problems.append(f'{rel}:{n}: {path}:{last} is past the end ({length} lines)')
    for problem in problems:
        print(problem)
    print(f'{len(problems)} problem(s)', file=sys.stderr)
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
