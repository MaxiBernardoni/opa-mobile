---
name: opa-sync
description: >
  Generates structured cross-chat briefing prompts for OPA (multi-chat project) sessions.
  Use this skill whenever the user runs /sync, asks to "brief another chat", wants to
  "sync chats", "pass context to another session", or needs to generate a handoff prompt
  between OPA chats (Frontend/Backend, Design & UI/UX, Database, Documentation). Even if
  the user just says "sync" or "brief the frontend chat", trigger this skill immediately.
---

# /sync — OPA Cross-Chat Briefing Generator

This skill handles the `/sync` command in OPA multi-chat sessions. When triggered, Claude
generates a ready-to-paste briefing prompt that the user can drop into another chat.

Only runs in remote (web) environments — if `CLAUDE_CODE_REMOTE` is not `"true"`, skip
execution and inform the user this command is only available in remote OPA sessions.

---

## Step 1 — Identify target chat

Ask the user which chat they want to brief (single choice):

- **Frontend + Backend** chat
- **Design & UI/UX** chat
- **Database** chat
- **Documentation** chat

---

## Step 2 — Select content to include

Ask what to include in the briefing (can be multiple):

- Decisions made this session
- Files written or changed (paths + one-line description)
- Documents updated in `.claude/documents/`
- Things the other chat needs to act on
- Open questions for the other chat

---

## Step 3 — Generate the briefing prompt

Fill in the template below using **real content from the current session**. Never leave
placeholder text. If a section has nothing to report, write `"None."` explicitly.

```
## OPA Sync — {source chat} → {target chat}
**Date:** {today's date}

### What happened this session
{2–4 sentences. What was built, changed, or decided. Be specific.}

### Decisions that affect your domain
{Bullet list. If none, write "None."}

### Files changed that overlap with your domain
{File paths + one-line description. If none, write "None."}

### Documents updated
{List of .claude/documents/ files updated. The target chat should re-read these.}

### Action items for you
{Concrete, actionable bullets. Specific enough to act on without follow-up questions.}

### Open questions
{Things this session couldn't resolve that the target chat might answer. If none, write "None."}
```

---

## Rules

- Never invent content. Pull everything from what actually happened in the session.
- Keep "What happened" tight — 2–4 sentences max, no padding.
- Action items must be specific enough to act on without asking follow-up questions.
- Present the final prompt in a code block so the user can copy-paste it directly.
- After generating, tell the user: "Paste this at the start of a new message in the [target] chat."
