---
name: feature-spec
description: Start the next roadmap phase. Find it in specs/roadmap.md, create its branch, ask the user grouped questions, then write specs/YYYY-MM-DD-<feature>/{requirements,plan,validation}.md. Run manually with an optional feature hint.
disable-model-invocation: true
allowed-tools: Bash(git status *), Bash(git branch *), Bash(git switch *), Bash(git log *), Bash(date *), Bash(npx prettier *), Read, Glob, Grep, Write, AskUserQuestion
---

Write the feature spec for the next piece of work. Extra instructions from the
user, if any: $ARGUMENTS

Never write a file before step 4. The user answers the questions first.

## 1. Gather context

Read all of these before deciding anything:

- `specs/roadmap.md`: the phases and which are marked `✅ Complete`.
- `specs/mission.md`: scope, audience, and what success looks like.
- `specs/tech-stack.md`: the stack, decisions so far, **Project conventions**,
  **Responsive design**, **Validation**, and **Deferred decisions**.
- Every existing `specs/YYYY-MM-DD-*/` directory. Read the newest one in full;
  it is the template for tone, structure, and level of detail.
- `git status` and `git branch -a`.

## 2. Pick the feature and branch

- **Feature:** the first roadmap phase not marked complete. If `$ARGUMENTS`
  names a feature, use that one instead. If every phase is complete, compare
  `mission.md` with the code and the existing specs, list the gaps (unmet
  mission promises, deferred decisions), and let the user choose in step 3.
- **Name:** a short kebab-case slug for the feature, e.g. `booking-and-clinic-ops`.
- **Directory:** `specs/<today>-<slug>/`, where today comes from `date +%F`.
- **Branch:** `phase-<N>-<slug>`, where N is the roadmap phase number.
  - If the working tree has uncommitted changes, stop and ask the user
    what to do with them.
  - Branch from `main` unless the user says otherwise:
    `git switch -c <branch> main`.
  - If the branch already exists, ask before reusing it.

## 3. Ask the user (required, before writing anything)

Call `AskUserQuestion` once, with one question per file you will write:

1. **requirements.md:** scope. Which items are in this phase? Use
   `multiSelect` and give each option's trade-off in its description.
2. **plan.md:** task ordering and slicing, e.g. vertical slices in one
   spec, a sub-branch per slice, or the thinnest version first.
3. **validation.md:** the merge bar beyond the existing gate, e.g. current
   checks only, plus CI green, or plus new tooling.

Rules for the questions:

- Ground every option in what you read; name real files, routes, or tables.
- Put your recommended option first, with "(Recommended)" in its label.
- Ask a 4th question only for a decision that changes the spec's shape and
  can't be settled by a sensible default.
- Make smaller decisions yourself. Record them in the Decisions table and
  point them out in step 5.

## 4. Write the spec

Create `specs/<today>-<slug>/` with three files. Title each file
`# Phase <N> — <Feature Name>: <Requirements|Plan|Validation>`.

### `requirements.md`: scope, decisions, context

- `## Context`: where this phase sits in the roadmap, what earlier phases
  delivered, and which mission goals it serves. Link `specs/mission.md`,
  `specs/roadmap.md`, and `specs/tech-stack.md`.
- `## Scope`: **In scope** and **Out of scope** bullet lists. Each responsive
  UI item cites
  `[tech-stack.md → Responsive design](../tech-stack.md#responsive-design)`.
- Per-feature sections (`## Features` / `### <feature>`) when the phase has
  more than one feature.
- `## Data model` (or `## Data model changes`): a table of tables and columns,
  with indexes, constraints, and foreign-key behavior, if data changes.
- `## Decisions`: a `| Decision | Choice | Why |` table, including the user's
  answers from step 3.
- `## Constraints`: the project conventions, which guides in
  `node_modules/next/dist/docs/` to read first (this Next.js version has
  breaking changes), re-validation in Server Actions, no committed secrets,
  and migrations that apply to the previous phase's database.

### `plan.md`: numbered task groups

- Short intro: the branch, and the per-group gate (`npm test`, `npm run lint`,
  `npm run format:check` green, then a conventional commit).
- `## 1. Groundwork`: read the relevant Next.js docs, plus any schema, env,
  route, and constant setup.
- `## 2. <slice> (slice 1)`, `## 3. …`: one group per vertical slice, in
  the order the user chose. Each group has numbered tasks naming the real
  files (`src/lib/db/…`, `src/app/(site)/…`, `src/views/…`) and ends with a
  **Tests:** task.
- Last group, `## N. Verify and document`: run `validation.md`; update
  `specs/tech-stack.md` (new conventions and decisions), `README.md`, and
  `specs/roadmap.md` (mark the phase complete); add a changelog entry.

### `validation.md`: how to know it's done and mergeable

- Opening line: the clean-checkout setup (`npm ci`, `.env` from
  `.env.example`, `npm run db:migrate && npm run db:seed`), and that
  migrations apply to the previous phase's database.
- `## Automated checks`: a `| Check | Command | Pass criteria |` table (build,
  lint, format, tests, plus anything the user added, such as CI).
- `### Required tests`: grouped by feature or layer. Each bullet is a
  concrete, checkable behavior, including edge cases and failure paths.
  End with `tests/conventions.test.ts` still passing.
- `## Manual checks`: numbered. Always include an end-to-end walkthrough,
  **320px / 768px / 1280px** in light and dark schemes, keyboard-only use,
  and a polish/Lighthouse check.
- `## Done means`: all checks pass; tech-stack, README, roadmap, and
  changelog are updated; no secrets or database files are committed.

Then run `npx prettier --write specs/<today>-<slug>`.

## 5. Stop for review

Don't commit. Tell the user:

- the branch and directory created;
- one line per file on what it covers;
- a numbered list of the decisions **you** made (the ones they weren't asked
  about), so they can push back;
- that they can say "commit it". The commit is then
  `docs(specs): add phase <N> <slug> spec` with only the spec directory staged.
