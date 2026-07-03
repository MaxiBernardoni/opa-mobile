# Backend — API Layer (Hono on Supabase Edge Functions)

This document covers the OPA API layer: its purpose, stack, structure, endpoints, and how it relates to the rest of the architecture.

---

## Purpose

The API sits between the clients (opa-mobile, opa-web) and Supabase. It handles server-side business logic that cannot or should not run on the client — purchase flow, brand management operations, and future operations requiring rate limiting or server-side validation.

Supabase is still called directly from opa-mobile for read-heavy operations (feed, likes, saves, follows, profiles). The API is not a proxy for everything — only for operations that need server-side control.

---

## Stack

| | |
|---|---|
| **Runtime** | Deno (Supabase Edge Functions) |
| **Framework** | Hono v4 |
| **Auth** | Supabase JWT validation via `supabase.auth.getUser(token)` |
| **Deploy** | Supabase Edge Functions — no separate infra needed |
| **Location** | `functions/api/` in the separate repo `maxibernardoni/opa-backend` (no longer in `opa-mobile`) |

---

## File Structure

```
functions/api/
├── deno.json              # Deno import map (Hono + Supabase JS)
├── index.ts               # Entry point: app setup, global middleware, route registration
├── middleware/
│   └── auth.ts            # JWT auth middleware
└── routes/
    ├── health.ts          # Liveness check
    ├── brands.ts          # Brand management (for opa-web)
    └── orders.ts          # Order / purchase flow
```

---

## Global Middleware

Applied to all requests in `index.ts`:

| Middleware | What it does |
|---|---|
| `logger` | Logs every request to Edge Function logs |
| `cors` | Allows requests from `localhost:3000` (opa-web dev) and the opa-web production domain |

Auth middleware is applied per route group, not globally — public routes like `/health` do not require a token.

---

## Auth Middleware (`middleware/auth.ts`)

Applied to all protected route groups (`/brands/*`, `/orders/*`).

1. Reads `Authorization: Bearer <token>` header
2. Validates the JWT against Supabase via `supabase.auth.getUser(token)`
3. On success: attaches `user` and `supabase` client to the Hono context (`c.set('user', user)`)
4. On failure: returns `401` immediately, request never reaches the route handler

Downstream handlers access the authenticated user via `c.get('user')`.

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
- Likes and saves (`useLike`, `useSave`)
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

The API source lives exclusively in `maxibernardoni/opa-backend`. Confirmed independent on 2026-07-03: redeployed the `api` Edge Function using only `opa-backend`'s code (version 2), verified via health check, and tested `opa-mobile` end-to-end with no local `backend/` folder. `backend/` was removed from `opa-mobile`.

## Pending

- [ ] **Rate limiter is a no-op** — registered as `app.use('*', ...)` in `index.ts`, but runs *before* `authMiddleware`, so `c.get('user')` is always `undefined` there and the limit never triggers. Found 2026-07-03 while verifying opa-backend's independence. Fix: move the middleware registration after auth, or key it off something available pre-auth.
- [ ] Add CORS origin for confirmed opa-web production domain (currently `https://opa-web.vercel.app` placeholder)
- [ ] `GET /api/brands/me/metrics` — visit/click/conversion tracking requires new DB tables; open question for Database chat
- [ ] Move rate limiter Map to Deno KV for persistence across Edge Function instances (current in-memory Map resets on cold start)
