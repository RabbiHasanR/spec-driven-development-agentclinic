# Task: Bootstrap spec-driven development docs for a new project

PROJECT NAME: <name>
ONE-LINE IDEA: <what it is, in one sentence>

You are helping me start a project using **spec-driven development**. Before any
code exists, we write three living documents in `specs/`:

1. `specs/mission.md`: what we're building, for whom, and why
2. `specs/roadmap.md`: build order, as small vertical-slice phases
3. `specs/tech-stack.md`: technology choices, conventions, validation rules

## How to work. Follow these steps in order.

**Step 1: Interview me.** Ask the questions below in **rounds** (one round per
message, at most ~6 questions per round). Number every question. Where it
helps, suggest a default answer in brackets so I can just reply "ok". Skip
questions I've already answered. Ask follow-ups when an answer is vague.
Never invent stakeholders, names, or requirements.

**Step 2: Summarize.** After the last round, give me a short bullet summary of
what you understood, plus any open questions or assumptions. Wait for me to
confirm.

**Step 3: Recommend the stack.** If I haven't fixed the stack, propose one
option per layer with a one-line reason tied to a stakeholder goal. List
alternatives with pros and cons. Wait for my approval.

**Step 4: Write the three files**, exactly in the formats below. Output each
one as a separate markdown code block, with its file path above it.

**Step 5: Ask me to review.** Revise until I approve. Do not start the Phase 0
spec or any code.

## Interview questions

### Round 1: Mission

1. What is the product, in 2–3 sentences? What are its core nouns (the main
   entities users work with)?
2. Why does it exist? What problem or pain does it solve?
3. Who are the users? List each type and what they do.
4. Who are the stakeholders (name + role), and what does each one want?
5. What is in scope for v1 (the smallest useful version)?
6. What is explicitly out of scope for v1?
7. What does success look like? Give 3–5 observable outcomes.

### Round 2: Tech stack

1. Language(s) and framework: already decided, or should you recommend?
2. Database and data-access layer (ORM / raw SQL / migrations tool)?
3. Does it have a UI? If yes: rendering approach, CSS approach, and must it be
   responsive (phones/tablets/desktop)?
4. Auth needs for v1 (none / shared password / per-user accounts / SSO)?
5. Testing tools, lint/format tools, CI platform?
6. Deployment target (Docker, cloud, VM, serverless), or deferred?
7. Hard constraints: team skills, budget, hosting, compliance, performance?
8. Do you have a preferred directory layout, or should you propose one?

### Round 3: Roadmap

1. What's the very first thing that should run end to end (Phase 0 skeleton)?
2. Which v1 features matter most? Rank them.
3. Any features that must ship together, or depend on each other?
4. What makes v1 "shippable" (auth, CI, Docker, health checks, docs)?
5. What goes in "Later"?

## File formats (follow exactly)

General style rules:

- Plain, direct sentences. Short bullets. Wrap lines at ~80 characters.
- **Bold** the product's core nouns and key decisions.
- Tie decisions back to the stakeholder goal they serve, e.g. "(Mary's
  requirement)".
- Cross-link between files with relative links, e.g.
  `[tech-stack.md → Project conventions](tech-stack.md#project-conventions)`.

### specs/mission.md

```
# <Project> — Mission

## What it is

<2–4 sentences. Who does what with which **core nouns**.>

## Why it exists

<2–3 sentences: the pain, and how this project relieves it.>

## Scope (v1 — Focused MVP)

In scope:

- <User type> <verb> **<noun>**.
- ...

Out of scope for v1 (revisit later): <comma-separated list>.

## Who it's for

- **<User type>** — <what they do / why they come>.
- ...

## Stakeholder goals this serves

- **<Name> (<role>):** <their goals, in their words>.
- ...

## Success looks like

- <Observable outcome, e.g. "A user can go from X to Y in one sitting.">
- ...
```

### specs/roadmap.md

```
# <Project> — Roadmap

High-level implementation order. Phases are **vertical slices**: each ships one
usable, demoable piece end to end (data → API → UI). Keep every phase small.
Every phase follows the directory and naming rules in
[tech-stack.md → Project conventions](tech-stack.md#project-conventions)<, and
every phase's UI meets the
[responsive design standard](tech-stack.md#responsive-design)>.

## Phase 0 — Project skeleton ⏳ Not started

- Scaffold the <framework> app.
- Confirm it runs and <renders a placeholder page / answers a health check>.
- <Base layout or base app structure.>

## Phase 1 — <Feature area> ⏳ Not started

<One sentence: what the user can do after this phase.>

### <Sub-slice name>

- Model and seed **<noun>**.
- <List / detail / action.>
- <Acceptance detail, e.g. a responsive or UX requirement.>

### <Sub-slice name>

- ...

## Phase N — MVP ⏳ Not started

Closes the mission's unmet promises and makes v1 shippable.

### <Auth / management / ship-readiness sub-slices>

- ...

## Later (out of v1 scope)

<Same list as the mission's out-of-scope line.>
```

Status markers: `⏳ Not started`, `🚧 In progress`, `🔍 In review`,
`✅ Complete`. When a phase gets a spec folder, link it on the phase:
`Spec: [YYYY-MM-DD-<slug>](YYYY-MM-DD-<slug>/requirements.md)`.

### specs/tech-stack.md

```
# <Project> — Tech Stack

## Principles

- **<Principle>** — <why>.
- Popular, well-supported, reliable tools (<stakeholder>'s requirement).
- ...

## Recommended framework: <Framework>

We commit to **<Framework>**<, running on **<runtime>**>.

Why <Framework>:

- **<Benefit>** — <explanation tied to a stakeholder>.
- ...

## Stack summary

| Layer       | Choice |
| ----------- | ------ |
| Language    |        |
| Framework   |        |
| UI          |        |
| Backend     |        |
| Data access |        |
| Database    |        |
| Lint/format |        |
| Tests       |        |

## Decided in Phase 0

_Filled in as Phase 0 is built. Record each decision as:_

- **<Topic>:** <decision> — <why>.

## Project conventions

Every phase follows this layout. Update this section when a convention changes.

| Directory | Holds             |
| --------- | ----------------- |
| `<dir>/`  | <what lives here> |

Rules:

- <Where a new page/endpoint/module goes and where its test goes.>
- <Dependency direction between layers.>
- <Only `<db dir>` touches the ORM/driver.>
- <Naming conventions.>
- <Config comes from env vars; never hardcode secrets.>

## Validation

<Test runner> tests are how we validate every change. Work isn't done until
they pass.

- `<test command>` runs the whole suite once. Use it before committing and in CI.
- `<watch command>` re-runs tests as you edit.
- Each phase's acceptance criteria are written as tests in `<tests dir>/`.
- Run `<lint command>` and `<format check command>` alongside the tests.
- CI (`<ci config path>`) runs the same checks on every push and pull request;
  a PR merges only when CI is green.

## Responsive design            ← include ONLY if the project has a UI

Every page's UI must be responsive. This section is the single standard that
all feature specs reference.

- **Mobile-first:** ...
- **Breakpoints:** ...
- **Supported widths:** 320px to wide desktop, no horizontal page scroll.
- **Fluid layout:** ...
- **Touch:** tap targets at least 44×44px; nothing depends on hover alone.
- **Viewport:** never disable zoom.
- **Verification:** every phase with UI is checked at 320px, 768px, and 1280px.

## Known limitations

_None yet. Add each one as it's discovered: **<Area>:** <limitation>._

## Deferred decisions

- <Each choice we're intentionally not making yet.>
```

Rules for the first version:

- Every phase is `⏳ Not started`.
- In tech-stack.md, "Decided in Phase 0" and "Known limitations" are
  placeholders. Later phases add `## Decided in Phase N` sections above
  "Project conventions".
- Anything I didn't decide goes under "Deferred decisions". Don't guess.
- The conventions table is a proposal for me to approve, not final.
