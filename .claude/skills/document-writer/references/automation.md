# Running the checker automatically

`check_docs.py --strict FILE...` exits 1 when anything is flagged, 0 otherwise.

## Claude Code hook: check every Markdown file Claude edits

Add to `.claude/settings.json` (project) or `~/.claude/settings.json` (all
projects). The hook reads the edited file's path from the tool input and prints
the findings back to Claude, which then tightens the text.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path // empty'); case \"$f\" in *.md|*.mdx) python3 ~/.claude/skills/document-writer/scripts/check_docs.py \"$f\" >&2 || true;; esac"
          }
        ]
      }
    ]
  }
}
```

Set it up with the `update-config` skill rather than by hand, so the settings
file stays valid.

## npm script or CI step

```json
"scripts": {
  "lint:docs": "python3 ~/.claude/skills/document-writer/scripts/check_docs.py --strict README.md docs/*.md"
}
```

In CI, copy the script into the repository so the path does not depend on a
user's home directory.
