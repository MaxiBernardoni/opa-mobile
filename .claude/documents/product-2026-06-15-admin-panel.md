# Product — Admin Panel (opa-admin)

This document defines the OPA internal admin panel: its purpose, stack, screens, and access model. It is a separate web application from `opa-web` (the brand management panel).

---

## What It Is

`opa-admin` is an internal tool for the OPA team. It provides a visual interface over the Supabase database for operations that would otherwise require direct SQL access — approving brands, moderating content, managing users, and monitoring platform metrics.

It is NOT accessible to brands or regular users. Access is restricted to OPA staff.

---

## What It Is NOT

- **Not `opa-web`** — `opa-web` is for brand owners managing their own store. `opa-admin` is for OPA's internal team managing the whole platform.
- **Not a public-facing product** — no SEO, no marketing pages, no onboarding flow.

---

## Stack

| | |
|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **UI** | Tailwind CSS + custom components (declared stack said shadcn/ui, but no shadcn CLI is actually installed — real, per opa-admin's own `CLAUDE.md`; decide whether to formally adopt shadcn or keep this) |
| **Auth** | Supabase Auth (`@supabase/ssr`) — admin users only, gated by `perfiles.is_admin` in `middleware.ts`; `service_role` key for privileged DB operations, server-only |
| **Deploy** | Vercel — not deployed yet, runs locally against real Supabase data |
| **Repo** | `opa-organization/opa-admin` (separate repo — org transfer confirmed 2026-08-03 both by the user and independently via `git remote -v` on the cloned repo) |

---

## Access Model

- Admin users are a subset of Supabase `auth.users` — identified by a role or flag (e.g. `perfiles.is_admin` boolean, to be added)
- Login via email/password through Supabase Auth
- All DB operations use the `service_role` key server-side (Next.js Server Actions or API routes) — never exposed to the browser
- No admin user can access the panel from `opa-mobile`

---

## Screens

### Dashboard (Home)
Global platform metrics at a glance:
- Total users, active users (last 30 days)
- Total outfits published, total prendas, total marcas
- Total orders, total revenue, OPA commissions earned
- Top content: most liked outfits, most saved prendas, most followed brands

### Brand Management

| Screen | Description |
|---|---|
| **Solicitudes pendientes** | List of brand applications awaiting review: brand name, applicant username, IG handle, submission date |
| **Revisar solicitud** | Detail view of a single application; buttons to Approve or Reject with optional reason message |
| **Lista de marcas** | All active brands with status (approved / verified), owner, prendas count, outfits count |
| **Detalle de marca** | Full brand profile: info, prendas, outfits, orders, metrics; edit any field; toggle verified status |

### User Management

| Screen | Description |
|---|---|
| **Lista de usuarios** | All profiles: username, email, registration date, is_brand flag, status (active / suspended / banned) |
| **Perfil de usuario** | Full detail: outfits, prendas guardadas, armario, order history, followers/following |
| **Acciones sobre usuario** | Suspend (block access, keep data), ban (permanent block), or delete account (calls `delete_user()` RPC) |

> **Goal:** everything that can be done from the DB should be doable visually from this panel — no SQL access required for day-to-day operations.

### Content Moderation

| Screen | Description |
|---|---|
| **Outfits** | List of all published outfits with creator info; delete any outfit |
| **Prendas** | List of all garments with brand info; delete any prenda |
| **Reseñas** | List of all reviews with user + product info; delete any review |

> Prendas do NOT require admin approval before publishing — brands can publish freely. Moderation is reactive.

### Statistics

| Screen | Description |
|---|---|
| **Dashboard general** | Platform-wide KPIs (see Dashboard section above) |
| **Por marca** | Per-brand performance: profile visits, outfit likes, saves, product clicks, sales, revenue |
| **Ventas** | All orders across the platform: total revenue, OPA commission, order status breakdown, top-selling prendas |
| **Contenido** | Most liked outfits, most saved prendas, most followed brands, trending style tags |

---

## Implemented ✅

> Verified 2026-08-03 directly against the cloned repo (file tree + `git log`), not just against opa-admin's own docs. See `meta-2026-06-10-pending-features.md` for the authoritative per-item breakdown.

- Next.js 14 + Supabase client (anon for auth, `service_role` server-only for privileged ops)
- Admin auth gate (`middleware.ts`): session check + `perfiles.is_admin`, cached in an 8h `httpOnly` cookie
- `is_admin` and `status` columns on `perfiles` (migration `add_admin_columns_to_perfiles`)
- Dashboard: global KPIs (users, outfits, prendas, marcas, orders/revenue) + top 5 outfits by likes
- Brand list + detail (inline edit, verified toggle, add/remove prendas for that brand)
- User list + profile detail (outfits, orders, stats) + suspend/ban/delete
- Content moderation: outfits, prendas, reseñas — each with brand filter + text search + delete, hover-preview of images
- Loading animation (`components/spinner.tsx` + shared `app/(admin)/loading.tsx`)

## Pending

- [ ] **Brand solicitudes screen + approve/reject flow** — the `brand_applications` table exists in the DB but has no admin UI at all yet (confirmed via grep — zero references in the opa-admin codebase). This is the one Brand Management screen from the spec below that's genuinely missing.
- [ ] Statistics screens (per-brand, sales, content trends) — dashboard only has the global KPIs + top-5-outfits, no dedicated stats screens
- [ ] Pagination in long lists (usuarios/outfits/prendas) — fixed `.limit()`, not real pagination
- [ ] Deploy to Vercel
- [ ] Assign `is_admin = true` to the first real admin user in production
- [ ] Decide whether to formally adopt shadcn/ui or keep the current custom Tailwind components
