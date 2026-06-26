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
| **Location in repo** | `backend/functions/api/` |

---

## File Structure

```
backend/functions/api/
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
| GET | `/api/brands/me` | ✅ | Returns the brand owned by the authenticated user (`marcas.owner_id = auth.uid()`) |
| PATCH | `/api/brands/me` | ✅ | Updates brand info; whitelisted fields: `name`, `description`, `instagram_handle`, `website`, `location`, `tags` |
| GET | `/api/brands/me/metrics` | 🔲 501 | Placeholder — brand analytics (likes, saves, visits, clicks, conversions) |

### Orders / Purchase Flow (requires auth)

| Method | Path | Status | Description |
|---|---|---|---|
| GET | `/api/orders` | ✅ | Returns all orders for the authenticated user, including `productos_orden` items |
| POST | `/api/orders` | 🔲 501 | Placeholder — full checkout: validate stock, calculate total, decrement `stock_por_talle`, create order |
| PATCH | `/api/orders/:id/status` | 🔲 501 | Placeholder — brand owner updates order status (pending → shipped → delivered) |

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

## Pending

- [ ] Deploy to Supabase Edge Functions — run `supabase functions deploy api` from `backend/`
- [ ] `GET /api/brands/me/metrics` — aggregate likes, saves, profile visits, product clicks, conversion rate per brand
- [ ] `POST /api/orders` — full checkout: stock validation, total calculation, `stock_por_talle` decrement, order + `productos_orden` creation
- [ ] `PATCH /api/orders/:id/status` — brand owner only; validate that `marcas.owner_id = auth.uid()` for the order's garments
- [ ] Rate limiting middleware — prevent abuse on order creation and auth-adjacent endpoints
- [ ] Add brand garment management routes: `GET/POST /api/brands/me/prendas`, `PATCH /api/brands/me/prendas/:id`
- [ ] Add CORS origin for confirmed opa-web production domain (currently placeholder)
