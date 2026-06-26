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
| **UI** | shadcn/ui + Tailwind CSS |
| **Auth** | Supabase Auth — admin users only; `service_role` key for privileged DB operations |
| **Deploy** | Vercel |
| **Repo** | `maxibernardoni/opa-admin` (separate repo) |

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

## Pending

- [ ] Initialize `opa-admin` repo with Next.js 14 + shadcn/ui + Tailwind + Supabase client
- [ ] Add `is_admin boolean default false` column to `perfiles` in DB (migration needed)
- [ ] Implement admin auth gate — middleware that checks `perfiles.is_admin` before allowing access to any page
- [ ] Dashboard screen — aggregate queries for global KPIs
- [ ] Brand solicitudes screen + approve/reject flow — requires brand application table (see `product-2026-06-10-brand-system.md`)
- [ ] Brand list + detail + edit + verify screens
- [ ] User list + profile + suspend/ban/delete screens
- [ ] Content moderation screens (outfits, prendas, reseñas)
- [ ] Statistics screens (per-brand, sales, content)
- [ ] DB migration: add `status` column to `perfiles` for suspended/banned states
