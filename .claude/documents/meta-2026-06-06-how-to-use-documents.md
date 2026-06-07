# Meta — How to Use the Documents in .claude/documents/

> ⚠️ This document has been superseded by `meta-2026-06-07-documentation-style-guide.md` for style and creation guidelines. The content below remains valid for understanding the overall system.

This document explains the documentation system for the OPA project so that any Claude Code instance can read, interpret, update, and create documents correctly.

---

## Purpose of this folder

`.claude/documents/` contains technical documentation of the current project state. It is meant to be read by Claude Code at the start of a session or task, so it can understand what was built, what decisions were made, and what remains to be done — without needing to explore the entire codebase from scratch.

---

## Filename format

All documents follow this format:

```
{category}-{date}-{title}.md
```

| Part | Description | Example |
|---|---|---|
| `{category}` | Document category (see valid categories below) | `database` |
| `{date}` | Creation date in `YYYY-MM-DD` format | `2026-06-06` |
| `{title}` | Descriptive title in kebab-case | `schema-and-seed` |

**Full example:** `database-2026-06-06-schema-and-seed.md`

### Valid categories

| Category | Contents |
|---|---|
| `database` | Table schema, migrations, seed data, storage, auth |
| `backend` | Supabase integration, hooks, stores, types, Edge Functions |
| `frontend` | Screens, components, routes, animations, technical config |
| `design` | Visual system: colors, typography, spacing, UI components |
| `meta` | Documentation about the documentation system itself |

If a new category is needed, it must be a single lowercase word.

---

## How to read the documents

1. **Start with this file (`meta-`)** to understand the system.
2. Read the documents relevant to the current task. There is no need to read all of them.
3. Inside each document, the structure is:
   - **Area summary** at the top
   - **Current state** with technical details
   - **Pending** at the end (list of unimplemented tasks)

The `Pending` section at the end of each document is especially important: it indicates what is not yet done and must not be assumed as implemented.

---

## How to create a new document

Create a new document when:
- Something significant was implemented that is not covered by any existing document
- A new category of functionality was added
- An existing document for that category has become too long to be useful

### Steps

1. Determine the correct category (see categories table above)
2. Use today's date in `YYYY-MM-DD` format
3. Choose a descriptive title in kebab-case
4. Create the file in `.claude/documents/` with the correct name
5. Follow the section format described in `meta-2026-06-07-documentation-style-guide.md`
6. Commit and push together with the related code changes

---

## When to edit an existing document vs. create a new one

| Situation | Action |
|---|---|
| Something was added or changed within the area the document already covers | **Edit the existing document** — update affected sections and Pending |
| The area grew so much that the document is hard to navigate | **Create a new document** with an updated date and archive the old one |
| A completely new area was implemented | **Create a new document** with the appropriate category |
| A Pending item was completed | **Edit the existing document** — move the item from Pending to the relevant section |

**General rule:** edit over create. Only create a new one if the scope is clearly distinct or the existing document is no longer manageable.

---

## Internal document format

All documents must follow this base structure:

```markdown
# {Category} — {Descriptive Title}

Short paragraph explaining what this document covers.

---

## {Section 1}

Content...

---

## {Section N}

Content...

---

## Pending

- [ ] Unimplemented item
- [ ] Another pending item
```

### Formatting rules

- Use tables to compare options or list fields with multiple attributes
- Use code blocks (` ``` `) for SQL, TypeScript, file paths, and commands
- Section titles must be descriptive, not generic ("Tables", not "Data")
- The `Pending` section is **mandatory** and always goes at the end
- Do not include decisions without justification: if something was done a specific way for a technical reason, explain it briefly

---

## How to resolve conflicts between documents

If two documents contain contradictory information about the same topic:

1. **The document with the most recent date takes precedence** over the older one
2. Update the older document to be consistent with the newer one
3. If the contradiction is intentional (a technical decision change), add a note to the old document:
   ```
   > ⚠️ This section was superseded. See `{new-document}.md` for the current state.
   ```

---

## What NOT to include in documents

- Complete file contents (relevant snippets only)
- Decisions pending user approval (those stay in the conversation)
- Vague TODOs without context ("improve performance")
- Information already in the code and obvious from identifiers

---

## Current documents

| File | Covers |
|---|---|
| `database-2026-06-06-schema-and-seed.md` | Table schema, seed data, storage buckets, auth trigger |
| `backend-2026-06-06-supabase-integration.md` | Supabase client, auth flow, data hooks, TypeScript types |
| `frontend-2026-06-06-screens-and-components.md` | Screens, components, design tokens, technical config |
| `design-2026-06-06-visual-system.md` | Color palette, typography, cards, Storage resources, principles |
| `meta-2026-06-06-how-to-use-documents.md` | This file |
| `meta-2026-06-07-documentation-style-guide.md` | Authoritative style guide for creating and editing documents |
| `meta-2026-06-07-chat-structure.md` | Chat roles, domain boundaries, and initialization prompts |
