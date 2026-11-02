---
name: psw-ucenje
description: Priprema za usmeni ispit kroz pet pitanja o kodu koji je student sam napisao sa agentom, vezanih za lekcije iz baze znanja koje još nisu pokrivene. Može da se usmeri na deo gradiva. Pokreće se samo kada student pozove $psw-ucenje.
---

# Učenje

Input: whatever the student wrote after `$psw-ucenje` in the message that invoked this
skill: nothing, or a focus (`klijent`, `server`, `testovi`, or a path inside the knowledge
base).

A round of five questions that connect lessons of the knowledge base to code the student
committed. The student will be examined orally on their own code in the terms of the
lessons; this skill is the rehearsal. Over many rounds it should reach as many lessons
as the student's code can illustrate.

This skill only reads. It never edits code, including when a question asks what would
have to change.

Read `.claude/psw/study-log.md` now for the files it uses in `.workspace/study/`.

## 1. Who is the student

Read `.workspace/study/profile.json`. If it is missing, read `git config user.name` and
`git config user.email`, show them, and ask the student to confirm them or give the
identity they commit under. Save the answer. A student who committed under more than one
identity lists all of them.

## 2. The student's code

List the files their commits touched, among the commits reachable from the current
branch:

```
git log --author=<email> --name-only --pretty=format: HEAD -- backend/Modules frontend/src/app/modules
```

Keep the files that still exist and leave out migrations. If the list is empty, say that
there is no committed code to ask about yet, and stop.

## 3. Choosing five nodes

1. Read `docs/knowledge-base/INDEX.md`. Every listed lesson is a node; the `README.md`
   files are not.
2. Apply the focus, when the input gives one. `klijent`, `server` and `testovi` keep the
   nodes under that directory; a longer path keeps the nodes under it. With a focus,
   never ask outside it, even if the round ends up shorter than five.
3. Keep the nodes the student's files can illustrate. Judge from the index line and the
   kind of file: an aggregate for the domain lessons, a service or queries class for the
   application lessons, a configuration, repository or migration for the infrastructure
   lessons, a controller for the API lessons, a test class for the testing lessons, a
   page, component, service or routes file for the client lessons. A node with no such
   file is not eligible.
4. Order the eligible nodes with `log.jsonl`:
   - first those never asked in a `study` entry;
   - then those whose latest outcome is `after_push` or `revealed`;
   - then the least recently asked.

   Within one of these tiers, put first the nodes that appear in an `ask` entry, and the
   nodes behind a decision tagged `agent` in the student's specs in `.workspace/specs/`
   (`Tok korišćenja` and the client lessons, `Domenski model` and the domain lessons,
   `Operacije` and the application lessons, `Testovi` and the testing lessons).
5. Take the first five, each a different node. If fewer are eligible, ask those and say
   why the round is shorter.

## 4. One question

Prepare each question before asking it:

- Read the node's lesson in full, and the `AGENTS.md` of the tier the code is in. The
  lesson gives the concept and the terms; the tier instructions say what is correct in
  this project, where it differs from the lesson's simplified example.
- Pick a snippet of at most about thirty lines from the student's files that shows the
  concept. Confirm with `git blame` that most of its lines come from the student's
  commits.
- Write down for yourself the two to four points a good answer contains. You grade
  against these points, so that the same answer gets the same verdict every time. Do not
  show them.

Alternate the two types through the round:

- **objasni**: why the code is shaped this way. What it does can be read off the snippet;
  the question is the reason, in the lesson's terms.
- **izmeni**: what would have to change, and where, for a stated different behaviour.

Then ask, in Serbian (Latin script, ekavian, addressed as "ti"): the snippet with its
path and lines, then the one question. Plain text, never the question widget.

Grade the answer against your points:

- **All points are there.** Confirm in a sentence or two and go on. Outcome `correct`.
- **Imprecise, incomplete or wrong.** Give one push: name what is missing, or the part
  of the answer or the lines of the snippet where the problem is, without supplying the
  content. For example: "Opisao si šta metoda radi, ali nisi rekao zašto pravilo stoji u
  agregatu, a ne u servisu." "Ne znam" also gets the push, as a smaller question.
- **After the second answer.** Give the full answer in a few sentences, whatever they
  wrote, and one line `Pogledaj: docs/knowledge-base/<path>`. Outcome `after_push` if
  the second answer had all the points, otherwise `revealed`.

There is one push and no more. Do not argue a grade; if the student disputes it, say in
one sentence what was missing and go on.

When your full answer includes a concept no lesson covers, start that part on its own
line with the exact prefix `Van baze znanja:`. If you cannot tell whether a lesson covers
it, flag it.

Append the `study` entry to `log.jsonl` as soon as the question is closed, so an
interrupted round still counts.

## 5. Closing the round

Print this block and save it as `.workspace/study/plan-<YYYY-MM-DD-HHmm>.md`. The heading
and the labels are fixed.

```
Plan učenja
Datum: <YYYY-MM-DD>
Fokus: <ceo materijal | zadati fokus>

| Lekcija | Kod | Ishod |
|---|---|---|
| <putanja lekcije> | <datoteka>:<linije> | <tačno | tačno posle podsticaja | otkriven odgovor> |

Za ponavljanje:
- docs/knowledge-base/<putanja lekcije>

Pokrivenost: <n> od <m> lekcija za koje postoji tvoj kod.
```

`Za ponavljanje` lists the lessons whose outcome was not `correct`; write `Nema.` when
all five were. `Pokrivenost` counts the eligible nodes, within the focus when one was
given, that have at least one `study` entry.
