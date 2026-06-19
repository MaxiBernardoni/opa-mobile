# OPA — Backend

This directory contains all backend infrastructure for OPA. It will be extracted into its own repository (`opa-backend`) once the mobile app is stable.

## Repository Architecture

OPA is split into three repositories:

| Repo | Stack | Audience |
|---|---|---|
| `opa-mobile` | React Native + Expo | End users and brands on mobile |
| `opa-backend` | Supabase + Edge Functions + API | Shared infrastructure for all clients |
| `opa-web` | Next.js (planned) | Brands on desktop — management panel, analytics, automation |

`opa-backend` is the shared core: both `opa-mobile` and `opa-web` consume the same Supabase DB and API layer. The `api/` folder is reserved for the Node.js API that `opa-web` will require for server-side operations beyond what Supabase exposes directly.

## Structure

```
backend/
├── supabase/
│   ├── migrations/   # SQL migrations — applied in order by version prefix
│   └── seed/         # Seed data SQL (brands, garments, outfits, profiles)
├── functions/        # Supabase Edge Functions (Deno/TypeScript)
└── api/              # Future: Node.js/Fastify API layer
```

## Supabase Project

- **Project ID:** `vecnktrbjolahcalkbml`
- **URL:** `https://vecnktrbjolahcalkbml.supabase.co`

## Migrations

Migrations are named `{version}_{name}.sql` and must be applied in order.
The version prefix is a timestamp (`YYYYMMDDHHMMSS`).

To apply a new migration via Supabase MCP, use `apply_migration` with the
file contents. Do NOT run them manually against the DB unless in a local dev environment.

## Edge Functions

Not yet implemented. When created, each function lives in its own subfolder:
```
functions/
└── my-function/
    └── index.ts
```

## API

Reserved for a future Node.js API layer. Empty for now.
