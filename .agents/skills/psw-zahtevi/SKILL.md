---
name: psw-zahtevi
description: Razjašnjava nameru zahteva i deli ga na male funkcionalnosti kroz kratak razgovor sa studentom, pa za svaku piše odobrenu specifikaciju u .workspace/specs/. Pokreće se samo kada student pozove $psw-zahtevi.
---

# Zahtevi

Input: whatever the student wrote after `$psw-zahtevi` in the message that invoked this
skill: the requirement text, or a path to a file holding it.

You turn a requirements text into one or more small, approved feature specs in
`.workspace/specs/`. You write no code and make no design decisions; `$psw-dizajn`
designs one spec at a time. What the student should take from this skill is the habit of
reading a requirement for the benefit someone is after, and of cutting work into pieces
that can each be demonstrated alone.

Read `.claude/psw/exchange.md` now and follow it for every question you ask. Read
`.claude/psw/spec-template.md` for the format you write.

## 1. Ground

The input is the requirement text or a path to a file holding it. If it is empty, ask for
it and wait.

Requirements arrive in different shapes. Some carry low-level acceptance criteria, some
are a few sentences, some are notes from a discussion with several people who want
different things. Do not assume a shape; read what is there.

Look up what already exists, enough to know what the text adds:

- the goal of the module or modules the text concerns, in the `## Moduli` section of the
  root `README.md`;
- the module or modules the text concerns: the routes file and pages on the client, the
  use-case groups in `Application`, the aggregates in `Domain`;
- the specs already in `.workspace/specs/` for that module, so a feature is not written
  twice.

Do not read knowledge-base lessons here. No lesson covers requirements work, so a
general explanation of a requirements concept (what a benefit is, why a feature is cut
at a certain point) carries the `Van baze znanja:` prefix. A comment on the student's own
answer does not.

## 2. Grill

Four to six exchanges for the whole input, each run as `exchange.md` describes. The
first two are fixed; choose the rest where a wrong guess would cost the most.

1. **Ko i zašto.** Ask who benefits and what they are ultimately after, and what in the
   text supports that reading. Listen for a benefit that only restates the action
   ("autor želi da arhivira turu" is the action; why they want it gone from the offer is
   the benefit), and for a second role or a second benefit hiding in the text. Then ask
   how that benefit serves the module's goal from the root `README.md`. A benefit that
   serves no goal of its module, or serves another module's goal better, is worth naming.
2. **Podela.** Show the capabilities you see in the text as a plain list, without
   grouping them, and ask where the student would cut the input into features and why.
   Name each capability as something a user would ask for, not as separate create, edit
   and delete operations. Judge the answer by the slice rule below. If the cut gives more
   than three features, ask which of them would have the same design, and let the
   student merge them or defend the split. When the input is plainly one slice, say so
   in one line and skip this exchange.
3. **Ponašanje i pravila.** Two to four exchanges, each on one gap:
   - the main flow of a feature the text describes only vaguely: what the user does and
     what they see, step by step;
   - a rule the text implies but never states, turned into a statement that can be
     checked;
   - a case the text is silent about, where the system must still do something;
   - two statements in the text that cannot both hold.

   When the text already gives precise acceptance criteria, spend these exchanges on why
   a rule exists and whom it protects. When the text is a loose discussion, spend them
   on the flow.

The student is not the stakeholder, so every answer here is an inference. After each
exchange, sort what was settled:

- a wrong guess would change a detail: record it as `Pretpostavka`;
- a wrong guess would change what gets built (another role, another feature boundary, a
  rule with real consequences): record it as `Pitanje za zainteresovanu stranu` together
  with the assumption that holds until it is answered, and tell the student they may
  stop here and ask before going on.

Whatever the exchanges did not cover, draft from the text yourself. The student reviews
all of it in step 3.

### Slice rule

A feature is one slice when all three hold:

- **One role, one benefit.** If `Ko i zašto` needs an "i", it is two features.
- **About one state change.** One command, plus the queries needed to reach it and to
  see its result. A feature that is only a query (a new list or view) is also one slice.
  Creating something and listing it may share a slice, because a creation nobody can see
  cannot be demonstrated.
- **It can be demonstrated alone.** Someone can log in, do it, and see the outcome
  without another new feature existing.

A slice is too small when its design would repeat a sibling's: the same aggregate, the
same page, and no rule or role of its own. Merge it into that sibling. Editing or
deleting something therefore usually joins the slice that creates it; it becomes its own
slice when it carries its own rule (archiving a tour that already has buyers) or belongs
to another role.

When in doubt, ask whether each piece would earn its own design conversation.

A feature whose consequence depends on another module (a key point that requires a
completed game, a purchase that unlocks a tour) is one slice for the module that owns
the consequence. That module asks through the other module's contract. If the contract
does not offer what is needed, record a `Zavisnost` line and tell the student that the
two teams have to agree on it; do not design the other module's side.

## 3. Present and approve

Print every feature in the console in Serbian, using the header and the `## Zahtevi`
block of the template, one after another. Then ask the student to approve them or say
what to change.

Apply corrections and print the changed feature again. A correction is not a new
exchange: change the text and move on. If the student changes where the features are
cut, check the result against the slice rule and say so when it fails.

## 4. Write

After approval, write one file per feature with `**Status:** Zahtevi odobreni`. If a file
with that name exists, ask before replacing it.

Close with the list of files written and one line saying that the next step is
`$psw-dizajn <datoteka>` for the one feature the student will build first. The other
specs wait in the folder, for this student or for a teammate who receives the file.
