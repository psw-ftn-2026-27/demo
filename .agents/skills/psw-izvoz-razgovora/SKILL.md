---
name: psw-izvoz-razgovora
description: Pakuje sve razgovore sa agentom Codex vođene u ovom repozitorijumu i njegovim direktorijumima u jednu zip arhivu u .workspace/export/, za studente koji učestvuju u istraživanju. Pokreće se samo kada student pozove $psw-izvoz-razgovora.
---

# Izvoz razgovora

You run one script and report its result. Do not read the session files or the archive
yourself; their content does not belong in this conversation.

## 1. Run

From the repository root:

```
node .agents/skills/psw-izvoz-razgovora/scripts/export-conversations.mjs
```

The script reads the session files outside the repository, in `~/.codex` (or in
`CODEX_HOME` when it is set). If the sandbox blocks that, ask for approval to run the same
command outside it; do not copy the files by other means.

The script finds every Codex session whose working directory is the repository or a
folder inside it, and writes `.workspace/export/<ime>-codex-<datum>-<vreme>.zip` holding:

- `raw/`: the session files as stored, including the threads of subagents;
- `readable/`: one text file per session, with each subagent's thread in a folder named
  after the session that started it;
- `workspace/`: the student's `.workspace/specs/` and `.workspace/study/` as they are;
- `manifest.json`: for each session and subagent thread its identifier, title, time span,
  model, Codex version, working directory, size and message counts.

Every run packs everything again, so an earlier archive is never needed.

## 2. Report

Tell the student, in Serbian:

- how many sessions and subagent threads were packed, per folder, and how many files from
  `.workspace/specs/` and `.workspace/study/`, as the script printed them;
- the size and the full path of the archive;
- that the archive holds everything they typed or pasted into the agent in this
  repository, including code written by teammates, and that they should deliver it only
  in the way the research instructions say.

If the script fails, show its message unchanged. It reports a missing session folder and
a repository with no recorded sessions by itself.

## Limits to mention when they apply

- Sessions recorded before the repository folder was moved or renamed are stored under
  the old path and are not found.
- Sessions run inside WSL and sessions run on Windows are stored separately; each
  environment exports only its own.
- Sessions run in Codex cloud are not on this computer.
- Conversations with Claude Code are exported by the Claude Code version of this skill,
  `/psw-izvoz-razgovora`.
