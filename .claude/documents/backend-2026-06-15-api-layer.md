# Backend — API Layer (Hono on Supabase Edge Functions)

This document covers the OPA API layer: its purpose, stack, structure, endpoints, and how it relates to the rest of the architecture.

---

## Purpose

The API sits between the clients (opa-mobile, opa-web) and Supabase. It handles server-side business logic that cannot or should not run on the client — purchase flow, brand management operations, and future operations requiring rate limiting or server-side validation.

Supabase is still called directly from opa-mobile for read-heavy operations (feed, follows, profiles) and for *reading* like/save state. As of 2026-08-10, the like/save *toggle* (the write) goes through the API instead — see the Social section below. The API is not a proxy for everything — only for operations that need server-side control (rate limiting, or enforcing a rule that RLS alone can't).

---

## Stack

| | |
|---|---|
| **Runtime** | Deno (Supabase Edge Functions) |
| **Framework** | Hono v4 |
| **Auth** | Supabase JWT validation via `supabase.auth.getUser(token)` |
| **Deploy** | Supabase Edge Functions — no separate infra needed |
| **Location** | `functions/api/` in the separate repo `opa-organization/opa-backend` (no longer in `opa-mobile`) |

---

## File Structure

```
functions/api/
├── deno.json              # Deno import map (Hono + Supabase JS)
├── index.ts               # Entry point: app setup, global middleware, route registration
├── middleware/
│   ├── auth.ts            # JWT auth middleware
│   └── rateLimit.ts       # Postgres-backed rate limiter (see below — NOT in-memory, NOT Deno KV)
└── routes/
    ├── health.ts          # Liveness check
    ├── brands.ts          # Brand management (for opa-web)
    ├── orders.ts          # Order / purchase flow
    └── social.ts          # Like / save toggle (2026-08-10)
```

---

## Global Middleware

Applied to all requests in `index.ts`:

| Middleware | What it does |
|---|---|
| `logger` | Logs every request to Edge Function logs |
| `cors` | Allows requests from `localhost:3000` (opa-web dev), the opa-web production domain, and `localhost:8090` (opa-mobile web dev — Expo web preview, port pinned in `opa-mobile/.claude/launch.json`) |

Auth middleware is applied per route group, not globally — public routes like `/health` do not require a token. Rate limiting (`middleware/rateLimit.ts`) is applied per route group too, and **must be mounted after `authMiddleware`** for that same group — `c.get('user')` needs to already be populated, or the limiter silently never triggers (this exact bug shipped once already, see Pending history below).

---

## Auth Middleware (`middleware/auth.ts`)

Applied to all protected route groups (`/brands/*`, `/orders/*`).

1. Reads `Authorization: Bearer <token>` header
2. Validates the JWT against Supabase via `supabase.auth.getUser(token)`
3. On success: attaches `user` and `supabase` client to the Hono context (`c.set('user', user)`)
4. On failure: returns `401` immediately, request never reaches the route handler

Downstream handlers access the authenticated user via `c.get('user')`.

---

## Rate Limit Middleware (`middleware/rateLimit.ts`)

Backed by a `rate_limits` table + `increment_rate_limit(p_key, p_window_ms, p_max)` Postgres function (migration `20260810113941_add_rate_limits_table_and_function`). Not in-memory, and **not Deno KV** — two things were tried and ruled out first, both confirmed empirically on 2026-08-10:

1. **Plain in-memory `Map`** (the original approach, `app.use('*', ...)` in `index.ts`) — Supabase Edge Functions do **not** keep module-level state warm across invocations. A `Map` declared at module scope got a *fresh instance on every single request*, even in a tight sequential burst from one client. This is why the rate limiter was a silent no-op — not just because of the auth-ordering bug (which was real too and got fixed at the same time), but because the counter itself could never accumulate regardless of ordering.
2. **`Deno.openKv()`** — throws `TypeError: Deno.openKv is not a function`. Supabase's Edge Function runtime is its own edge-runtime, not raw Deno Deploy, and Deno KV isn't available on it.

Postgres via the same service-role client already attached to `c` (`c.get('supabase')`) is the only persistence layer actually available here. `increment_rate_limit()` does an atomic `INSERT ... ON CONFLICT DO UPDATE` (single round trip, no race condition — an improvement over the old in-memory get-then-set too) and returns `true`/`false` for whether the request is within the limit. The middleware fails open on an unexpected DB error (a broken limiter shouldn't take down real traffic).

Applied:
- `/orders/*` — max 20 requests / 60s per user
- `/outfits/*` (like/save) — max 60 requests / 60s per user

---

## Endpoints

### Public

| Method | Path | Status | Description |
|---|---|---|---|
| GET | `/api/health` | ✅ | Returns `{ status: 'ok', service: 'opa-api', timestamp }` |

### Brand Management (requires auth)

| Method | Path | Status | Description |
|---|---|---|---|
| GET | `/api/brands/me` | ✅ | Returns the brand owned by the authenticated user (`marcas.profile_id = auth.uid()`) |
| PATCH | `/api/brands/me` | ✅ | Updates brand info; whitelisted fields: `name`, `description`, `instagram_handle`, `website`, `location`, `tags` |
| GET | `/api/brands/me/metrics` | ✅ | Aggregates likes + saves across outfits containing brand garments. Returns `note` explaining that visit/click tracking is not yet in DB. |
| GET | `/api/brands/me/prendas` | ✅ | Lists all garments for the authenticated brand, ordered by `created_at DESC` |
| POST | `/api/brands/me/prendas` | ✅ | Creates a garment for the brand; validates `external_url` required when `sale_mode = 'redirect'` |
| PATCH | `/api/brands/me/prendas/:id` | ✅ | Updates a garment; verifies ownership via `brand_id`; same `sale_mode` / `external_url` validation |

### Social — Like / Save (requires auth, 2026-08-10)

| Method | Path | Status | Description |
|---|---|---|---|
| POST | `/api/outfits/:id/like` | ✅ | Idempotent (repeat calls just return `{liked: true}`, unique-constraint violation is treated as success). 403 if the authenticated account is a brand (`perfiles.is_brand`) — brands "cannot like, save, or follow" per the product rule, enforced here instead of only hiding the button client-side. 404 if `:id` isn't a real outfit (FK violation). |
| DELETE | `/api/outfits/:id/like` | ✅ | Idempotent unlike. |
| POST | `/api/outfits/:id/save` | ✅ | Same shape as like, writes to `outfits_guardados`. |
| DELETE | `/api/outfits/:id/save` | ✅ | Same shape as unlike. |

The DB triggers `on_outfit_like` / `on_outfit_save` keep `outfits.likes_count` / `saves_count` in sync regardless of who performs the insert/delete, so `routes/social.ts` only does the insert/delete itself — no count bookkeeping needed here.

`opa-mobile`'s `hooks/useLike.ts` / `hooks/useSave.ts` call these via a new `lib/api.ts` client (the *first* time `opa-mobile` has called this API at all — every other read/write, including the initial liked/saved state check, still goes direct to Supabase). Reading the current liked/saved state on mount stayed a direct Supabase read — it's not a write, RLS already allows it publicly, and routing it through the API would add latency for no security benefit.

### Orders / Purchase Flow (requires auth)

| Method | Path | Status | Description |
|---|---|---|---|
| GET | `/api/orders` | ✅ | Returns all orders for the authenticated user, including `productos_orden` items |
| POST | `/api/orders` | ✅ | Full checkout: reads cart, validates `stock_por_talle`, calculates total, creates `orders` + `productos_orden`, decrements stock, clears cart |
| PATCH | `/api/orders/:id/status` | ✅ | Brand owner only — verifies ownership via garments in the order; valid values: `pending`, `shipped`, `delivered` |

---

## What the API Does NOT Cover

These are still handled by direct Supabase calls from opa-mobile:

- Outfit feed (`useOutfits`)
- Reading like/save state (`useLike`/`useSave`'s initial-state check — only the toggle write goes through the API, see Social above)
- Follows (`useFollow`)
- Profiles (`useProfile`)
- Wardrobe (`useWardrobe`)
- Size guides and measurements (`useSizeGuide`, `useUserMeasurements`, `useRecommendedSize`)

---

## Deploy

**Deployed** to Supabase Edge Functions with `verify_jwt: false` (JWT validation handled internally by `middleware/auth.ts`).

**Production URL:** `https://vecnktrbjolahcalkbml.supabase.co/functions/v1/api`

Health check: `GET https://vecnktrbjolahcalkbml.supabase.co/functions/v1/api/health` → `{ status: 'ok', service: 'opa-api', timestamp }`

## Standalone Repo

The API source lives exclusively in `opa-organization/opa-backend`. Confirmed independent on 2026-07-03: redeployed the `api` Edge Function using only `opa-backend`'s code (version 2), verified via health check, and tested `opa-mobile` end-to-end with no local `backend/` folder. `backend/` was removed from `opa-mobile`. Both `opa-mobile` and `opa-backend` were transferred into the `opa-organization` GitHub org on 2026-07-03 (confirmed via `git remote -v` on both repos).

## Pending

- [ ] Add CORS origin for confirmed opa-web production domain (currently `https://opa-web.vercel.app` placeholder)
- [ ] `GET /api/brands/me/metrics` — visit/click/conversion tracking requires new DB tables; open question for Database chat

## Resolved (kept for history — these were real bugs, not obvious in hindsight)

- [x] **Rate limiter was a no-op — fixed 2026-08-10.** Two independent causes, both found while building the like/save endpoints: (1) it was registered as `app.use('*', ...)` *before* `authMiddleware`, so `c.get('user')` was always `undefined` — fixed by mounting it per route group, after that group's `authMiddleware`. (2) Even with correct ordering, the in-memory `Map` it used never actually accumulated state — Supabase Edge Functions don't keep module-level state warm between invocations (confirmed empirically: a fresh `Map` instance on every single request). Moving to Deno KV (the originally planned fix) turned out not to be possible either — `Deno.openKv()` isn't available on this runtime. Ended up backed by Postgres instead (`rate_limits` table + `increment_rate_limit()` function) — see the Rate Limit Middleware section above.
