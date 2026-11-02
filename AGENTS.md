# AGENTS.md

This is an educational project, not a full production solution. Keep cognitive load theory
in mind and do not introduce new technologies, concepts, or libraries without checking
first. If a pattern you are about to write is not described in these instructions, stop
and ask.

## Context

Teaching repository for a fourth-year software engineering course. A single team of
10 to 15 students builds one modular monolith web application. Students are split into
sub-teams of 2 to 4. Each sub-team owns one feature module. One sub-team owns the
platform: shared code, build, CI, and the agent tooling.

Students know Clean Architecture and .NET. The modular monolith is the new concept for
them. They are weak on frontend.

This shapes every decision here: the backend is rigorous and enforced by tooling, the
frontend is deliberately plain and enforced by convention. That asymmetry is intentional,
not an oversight. Do not "improve" the frontend by adding architectural layers.

**Domain:** a tourism-exploration platform. Exploration holds guided tours built by
authors as sequences of key points, each carrying a segment of a narrative. Games holds
map-based challenges (a quiz, find-the-hidden-location). Social holds the community:
clubs, blogs, leaderboards. Payment monetizes the platform through a product abstraction
that can sell tours, games, bundles, or subscriptions. Cross-module synergies (a key
point that requires completing a game, a purchase that unlocks a tour) are a deliberate
learning outcome; the module that owns the consequence asks through the other module's
contract — the module that owns the cause never pushes.

**Stack:** ASP.NET Core on .NET 10 (backend), Angular (frontend), one repository, one
PostgreSQL database. No Docker in this project; students run PostgreSQL natively.

## Repository layout

```
backend/          .NET solution (Explorer.slnx), see backend/AGENTS.md
frontend/         Angular workspace, see frontend/AGENTS.md
docs/             knowledge base (course material, in Serbian), see below
.github/          CI workflow: backend restore, build, test (Postgres service container);
                  frontend install, lint, build
.config/          dotnet tool manifest (dotnet-ef)
.claude/          shared agent settings and the psw-* skills, see below
.agents/          the same psw-* skills for Codex
.workspace/       per-student working files of the skills (specs, study log, exports);
                  gitignored, never committed
```

Feature modules are Exploration, Games, Social, and Payment. Module paths are strictly
parallel across the two tiers, so a team's ownership is two globs:

```
backend/Modules/<Name>/
frontend/src/app/modules/<name>/
```

## Rules that apply everywhere

- One module never reaches into another module's internals. Cross-module access goes
  through that module's declared public surface only: its `Contracts` on the backend,
  its routes on the frontend. Changing such a surface is a cross-team negotiation — flag
  it rather than quietly changing it.
- Shared code is owned by the platform team. Adding to the shared kernel is a decision,
  not a convenience. Resist the urge to move things there.
- Every feature module has an identical structure. Consistency beats local cleverness,
  because students learn by pattern-matching against each other's modules.
- All modules are pre-scaffolded so students never edit central registration files,
  project files, or the solution. Every new dependency goes through the platform team,
  because versions are pinned centrally in a platform-owned file.

## Where to look next

The instructions are scoped by tier. `backend/AGENTS.md` and `frontend/AGENTS.md` hold
the mandatory patterns for their folder and load automatically once a session touches
files there; read the relevant one before writing code, not after the first file is
open. READMEs placed next to the code they govern hold the finer conventions. When a
platform change alters a mandatory pattern, updating the affected instructions file or
README is part of that change.

- Backend feature or fix: `backend/AGENTS.md`.
- Frontend feature or fix: `frontend/AGENTS.md`.
- A feature spanning both tiers: both. The seam is the backend's Application DTO, which
  is the wire contract the frontend's `api/` types mirror.
- Understanding a concept or trade-off: the knowledge base, below. Do not load the
  tier instructions for a discussion that changes no code.

## Knowledge base

`docs/knowledge-base/` holds the course material students learn from, written in
Serbian and owned by the platform team. Every document is a lesson: concept teaching
whose examples are deliberately simplified and do NOT follow this project's
conventions. Expect the knowledge base and the real code to differ; that divergence
is by design, not an error to fix. Never copy code from the knowledge base into the
project.

Consult the knowledge base only when the session is about understanding: a student
asking to learn, discuss, or examine a concept or trade-off. Start from
`docs/knowledge-base/INDEX.md`, which lists every document with a one-line
description and its prerequisites, and load only the documents relevant to the
discussion. Do not read `docs/knowledge-base/mapa.html`; it is a human-facing view
of the same material.

For engineering tasks (writing or changing code), do not load knowledge-base
documents; the mandatory patterns live in the tier instructions and READMEs.

When you explain a concept, pattern, or trade-off that no knowledge-base lesson covers,
start that part of the answer on its own line with the exact prefix `Van baze znanja:`.
This holds in every session, with or without a skill. Project conventions from the tier
instructions and facts about the code in front of you are not flagged. If you cannot
tell whether a lesson covers it, flag it.

## Skills

`.claude/skills/` holds the `psw-*` skills, and `.agents/skills/` holds their Codex
versions. A skill runs only when a student invokes it by name. They exist to teach: a skill slows the work down on purpose and asks the student
to reason before it answers, so never shorten its phases to finish sooner. Each skill
names the lessons and tier instructions it reads, and that list overrides the two
loading rules above (no knowledge base for engineering tasks, no tier instructions for
a discussion). The skills keep their working files in `.workspace/`.

## Working style

- Prefer the smallest change that satisfies the request. This is teaching code, so
  readability outranks sophistication.
- When a change would touch a platform-owned file, a `Contracts` surface, or a `.csproj`,
  say so before doing it.
- When a decision is genuinely open, ask rather than guess.
- Prefer a plain class over an abstraction. If you are adding an interface, be able to say
  which dependency arrow it reverses.
