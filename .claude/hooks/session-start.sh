#!/bin/bash

# Only run in remote (web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install /sync global command if it doesn't exist
SYNC_CMD="$HOME/.claude/commands/sync.md"
if [ ! -f "$SYNC_CMD" ]; then
  mkdir -p "$HOME/.claude/commands"
  cat > "$SYNC_CMD" << 'EOF'
# /sync — OPA cross-chat briefing generator

Use this command when you want to brief another OPA chat about what happened in the current session. It generates a structured prompt you can paste directly into the target chat.

## Instructions for Claude

When the user runs `/sync`, do the following:

1. Ask which chat to brief:
   - **Frontend + Backend** chat
   - **Design & UI/UX** chat
   - **Database** chat

2. Ask what to include (can be multiple):
   - Decisions made this session
   - Files written or changed (paths + one-line description)
   - Documents updated in `.claude/documents/`
   - Things the other chat needs to act on
   - Open questions for the other chat

3. Generate a ready-to-paste prompt using this template, filled with real content from the current session. Never leave placeholder text.

---

## Briefing prompt template

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

Paste the generated prompt at the start of a new message in the target chat.
EOF
fi

# Install npm dependencies
cd "$CLAUDE_PROJECT_DIR"
if [ ! -d "node_modules" ]; then
  npm install --legacy-peer-deps --prefer-offline
fi
