# /sync — Cross-chat briefing generator

Use this command when you want to brief another OPA chat about what happened in the current session. It generates a structured prompt you can paste directly into the target chat.

## Instructions for Claude

When the user runs `/sync`, do the following:

1. Ask the user which chat they want to brief:
   - **Frontend + Backend** chat
   - **Design & UI/UX** chat
   - **Database** chat

2. Ask what to include in the briefing (select all that apply):
   - Decisions made this session
   - Code written or changed (file paths + brief description)
   - Documents updated
   - Things the other chat needs to act on
   - Open questions for the other chat

3. Generate a ready-to-paste prompt using the template below. Fill in every section with real content from the current session. Do not leave placeholder text.

---

## Briefing prompt template

```
## OPA Sync Briefing — {source chat name} → {target chat name}
**Date:** {today's date}

### What happened this session

{2–4 sentences summarizing the main work done. Be specific: what was built, what was changed, what was decided.}

### Decisions that affect your domain

{Bullet list of decisions made in this session that the target chat needs to know about. If none, write "None."}

### Files changed that overlap with your domain

{List of file paths changed, with one-line description of what changed. If none, write "None."}

### Documents updated

{List of .claude/documents/ files that were updated this session. The target chat should re-read these before starting work.}

### Action items for you

{Bullet list of concrete things the target chat should do, check, or be aware of. Be specific enough to act on without asking follow-up questions.}

### Open questions

{Bullet list of things this session couldn't resolve that the target chat might be able to answer. If none, write "None."}

---
*Paste this at the start of a new message in the target chat. The target chat will read the relevant documents and incorporate this context before responding.*
```

---

## Usage example

User types: `/sync`

Claude asks: "Which chat do you want to brief, and what should I include?"

User answers: "The Database chat. We added a `saves_count` column to outfits in the frontend types but it doesn't exist in the real schema yet."

Claude generates the filled briefing prompt, ready to paste.
