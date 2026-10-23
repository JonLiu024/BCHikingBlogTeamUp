---
name: document-merged-pr
description: >-
  Writes project documentation from the code changed in a pull request that
  has been merged into main. Use when the user asks to document a merged PR,
  document changes after a merge to main, update the development record from
  a merged pull request, or invoke document-merged-pr.
disable-model-invocation: true
---

# Document a merged pull request

Write a record of what the merged pull request changed. Use the diff as the source of truth. Do not describe behavior that the diff does not show.

## Invoke

The user runs this after a pull request is merged into `main`. They name the skill, for example `document the merged PR` or `document PR 30`.

This skill does not run by itself when GitHub merges a pull request. Run it in chat after the merge.

## Steps

1. From the repository root, run:

```bash
.cursor/skills/document-merged-pr/scripts/show-merged-pr.sh [pr-number]
```

Omit the number to document the latest merge on `origin/main`.

2. Read the script output. If a hunk is unclear, read the current file. Do not read or copy `.env`, credentials, or token values.
3. Write `docs/changes/pr-<number>.md` using the template below. Create `docs/changes/` if it is missing.
4. If the merged behavior changes a feature already described in `docs/development-progress.md`, update that file so it matches the code now on `main`.
5. Do not commit or push unless the user asks.

## Template

```markdown
# PR <number>: <title>

- Merged: <date>
- URL: <url or merge commit>

## What changed

<short paragraphs of the user-visible or API change>

## Where

- `path/to/file`: <what that file now does>

## Setup or follow-up

<commands, environment, or "None.">
```

## Rules

- Prefer the files and functions the diff actually touches.
- Keep secrets, connection strings, and key material out of the document.
- If the script cannot find the merge, say so and stop. Do not invent a diff.
