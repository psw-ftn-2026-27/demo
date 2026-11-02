---
name: psw-dizajn
description: Vodi studenta kroz dizajn jedne funkcionalnosti u četiri kratka razgovora (tok korišćenja, domenski model, operacije, testovi) i upisuje odobren dizajn u njenu specifikaciju u .workspace/specs/. Pokreće se samo kada student pozove $psw-dizajn.
---

# Dizajn

Input: whatever the student wrote after `$psw-dizajn` in the message that invoked this
skill: a spec file from `.workspace/specs/`, or nothing.

You take one spec whose requirements are approved and add its high-level design, decided
with the student in four exchanges. You write no code. What the student should take from
this skill is how a requirement becomes a flow on the screen, a change in the domain
model, a set of commands and queries, and a short list of things worth testing.

Read `.claude/psw/exchange.md` now and follow it for every exchange. Read
`.claude/psw/spec-template.md` for the format you write.

## 1. Ground

Resolve the input to a file in `.workspace/specs/`. With no input, list the specs whose
status is `Zahtevi odobreni` and ask which one. One spec per run.

- Status `Zahtevi odobreni`: continue. If the file already holds some design sections
  from an interrupted run, keep them and resume at the first missing one.
- Status `Dizajn odobren`: ask whether the student wants to redo the design; stop if not.
- Status `Implementirano`: stop and say so.

If the spec holds a `Pitanje za zainteresovanu stranu`, remind the student in one line
that the design rests on the assumption written next to it.

Then read, before the first exchange:

- `backend/AGENTS.md` and `frontend/AGENTS.md`. They hold the conventions the design must
  respect, and they decide what counts as a mandatory pattern in `exchange.md`.
- The module's code: the routes file and the pages it names; the aggregates in `Domain`;
  the use-case groups in `Application` with their methods; the names of the existing
  tests.
- The other specs of the same module in `.workspace/specs/`, for decisions already made.

A module may have no pages, aggregates or groups yet. Then say so, and use Exploration
or Social as the picture of what a finished group looks like. Never copy their domain.

## 2. The four exchanges

Run them in this order; each builds on the outcome of the one before. Read the listed
lessons from `docs/knowledge-base/` before framing the exchange. When an exchange
closes, write its section into the spec at once, leaving the status unchanged.

### 2.1 Tok korišćenja

Lessons: `klijent/2-modularni-monolit/1-stranice-i-prikazne-komponente.md`,
`klijent/1-angular/8-rutiranje.md`,
`klijent/1-angular/10-citanje-podataka.md`, `klijent/1-angular/11-komande.md`,
`klijent/1-angular/13-slanje-forme.md`. Add `klijent/1-angular/12-forme.md` when the
feature has a form, and `klijent/2-modularni-monolit/3-javna-povrsina.md` when the flow
touches another module's page or data.

Frame with the module's existing pages: each address and what the user sees there.

The student describes:

- on which page the user is before the feature comes into play;
- what they click or do to start it;
- what appears, and of which kind: a new page, a form, a list, or a section or button on
  an existing page;
- how they interact with it;
- how it ends and where the user is left: on the same page with the list reloaded or the
  form reset, or on another page.

Mandatory patterns to hold the answer against:

- Only the kinds above exist. There is no dialog or modal anywhere in the project; offer
  a page or an inline section as the nearest taught option.
- Page state does not survive navigation; the only state that does is the signed-in
  user.
- Another module's screen is reached by a link to its address and nothing else. Another
  module's data arrives through this module's own backend.

Leave out the split into pages and presentational components, the DTO shapes, and
styling. They follow from `frontend/AGENTS.md` during implementation.

### 2.2 Domenski model

Lessons: all five in `server/2-arhitektura-modula/1-domenski-sloj/`.

Skip this exchange when the feature changes no state and stores nothing new. Say so in
one line and write `Bez izmena domenskog modela.` into the spec.

Frame with the aggregates the feature is near: each root with its current properties and
method signatures, and the rules from `Pravila` that have no home yet.

The student describes:

- which aggregate is new or which existing one grows;
- what it has to hold for this feature, and whether a new concept is a value object or
  an entity;
- which rule from `Pravila` it guards, and in which constructor or method, named as the
  action the user would recognise.

Mandatory patterns:

- A business rule lives in the aggregate, never in the application service.
- State changes only through the aggregate root.
- Another aggregate, and anything in another module, is referenced by its identifier.
- A rule that needs more than one aggregate belongs to a domain service.

### 2.3 Operacije

Lessons: `server/2-arhitektura-modula/2-aplikacioni-sloj/1-komande-i-upiti.md` and
`2-aplikacioni-servis.md`. Add `server/3-modularni-monolit/1-kontrakti.md` when the
feature needs something from another module.

Frame with the module's use-case groups and the methods each service and queries class
already has, next to the steps of `Tok korišćenja` that need the server.

The student describes:

- each operation the flow needs, as a command or a query, with what it takes and what it
  changes or returns, in words;
- the use-case group each belongs to, or why a new group is warranted.

Mandatory patterns:

- An operation is a command or a query, never both.
- A list or view for display is a query through the read repository; aggregates are not
  loaded to be displayed.
- Data from another module comes through that module's contract, asked for by the module
  that owns the consequence. If the contract lacks the member, keep the `Zavisnost` line
  in the spec and design only this module's side.
- A service that would pass about seven public methods is a reason to open a new group.

Leave out DTO fields, repository methods and routes.

### 2.4 Testovi

Lessons: `testovi/1-anatomija-jedinicnog-testa.md`, `testovi/2-aspekti-kvaliteta-testa.md`,
`testovi/3-mapa-testiranja-serverskih-komponenti.md`, `testovi/4-integracioni-testovi.md`,
and `klijent/1-angular/11-komande.md` for what the client does with a failure.

Frame with what the design produced so far: the aggregate methods that guard a rule and
the operations. Do not propose tests in the frame.

The student describes:

- what the system must guarantee once this feature exists;
- the main effect of the successful scenario: what is stored or returned;
- the failures that are specific to this feature, if there are any;
- for each such failure, what the user sees and where on the screen.

Mandatory patterns:

- Each rule is tested once, at the lowest level where it lives: a rule in an aggregate
  gets a unit test, the coordination in an application service gets an integration test
  through HTTP.
- Trivial code gets no test of its own.
- A test is kept only if a plausible change to the code could break it. Coverage is not
  a goal.

Your own bias here is to list every case. Resist it: the purpose of this exchange is for
the student to tell the few tests that protect the feature from the many that only
repeat it. When their list grows long, ask which of the tests a plausible change would
break, and keep those.

The rejections every command shares (no signed-in user, wrong role) are not discussed.
Say in one line that implementation adds them. No client tests are designed.

Write each test into the spec as a sentence about the domain, not as a method name.

## 3. Present and approve

Print the whole `## Dizajn` block in the console in Serbian, as it now stands in the
spec. Then point to the names in `Domenski model` and `Operacije` and ask whether any of
them would need explaining to the person who wrote the requirement. Ask the student to
approve it or say what to change; a rename is a correction like any other.

A correction that stays within the patterns is applied as written, with the tag
`student`. A correction that breaks a mandatory pattern is answered once, as
`exchange.md` describes, and the compliant option stays.

## 4. Write

After approval, set `**Status:** Dizajn odobren`.

Close with the file name, the decisions tagged `agent` (so the student knows what to
read up on), and one line saying that the next step is `$psw-implementacija <datoteka>`.
