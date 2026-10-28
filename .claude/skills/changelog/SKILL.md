---
name: changelog
description: Create or update CHANGELOG.md in the project root from git commits, with one heading per date (newest first). Run manually before merging a branch.
disable-model-invocation: true
allowed-tools: Bash(git log *), Bash(git diff *), Bash(git branch *), Bash(git rev-parse *), Read, Edit, Write
---

Keep `CHANGELOG.md` (project root) up to date from git history. Extra
instructions from the user, if any: $ARGUMENTS

## 1. Pick the mode

- **No `CHANGELOG.md`** → **bootstrap**: use the full history:
  `git log --no-merges --date=short --format='%ad%x09%h%x09%s%n%b'`
- **`CHANGELOG.md` exists** → **update**: use only this branch's commits not yet
  on `main`:
  `git log main..HEAD --no-merges --date=short --format='%ad%x09%h%x09%s%n%b'`
  - If the current branch is `main` or the range is empty, say there's nothing
    to add and stop.

## 2. Turn commits into bullets

- Group commits by date (`%ad`, the author date).
- **Skip**: merge commits and formatting-only `style:` commits.
- Write one bullet per meaningful change, for humans, not raw commit subjects:
  - Past tense, sentence case, ends with a period, one line.
    `feat: add main layout` → `Added a main layout with header, main, and footer.`
  - Use the commit body for context; don't repeat the type prefix.
  - Merge related commits on the same date into one bullet (e.g. a spec commit
    and the code that implements it).
- Keep bullets in the order the work happened within each date (oldest first).

## 3. Write the file

Format (dates newest first, flat bullet list under each date):

```markdown
# Changelog

All notable changes to AgentClinic, grouped by date (newest first).

## YYYY-MM-DD

- Added ….
- Changed ….
```

- **Bootstrap**: write the whole file.
- **Update**: add bullets under an existing `## <date>` heading (appended after
  its current bullets) or insert a new date heading in the right position.
- Never rewrite, reorder, or delete existing entries.
- Run `npx prettier --write CHANGELOG.md`.

## 4. Review, then commit

1. Show the user `git diff CHANGELOG.md` (or the new file) and wait for approval.
2. After approval, commit only `CHANGELOG.md` as `docs: update changelog`
   (`docs: add changelog` on bootstrap), so it lands on the branch before it is
   merged.
