# Meta — Pending Features & Ideas

Single source of truth for everything that is not yet implemented in OPA. Items are grouped by layer (DB, Backend, Frontend, Design) and tagged with status. Product ideas discussed but not yet scoped for implementation are listed at the end.

> **Rule:** when a pending item is implemented, remove it from this document and add it to the relevant layer document. Do not leave completed items here.

---

## Repository Structure

OPA lives across four repositories:

| Repo | Stack | Status |
|---|---|---|
| `opa-mobile` | React Native + Expo | Active — current repo |
| `opa-backend` | Supabase + Edge Functions + Hono API | Structured in `backend/` folder, to be extracted |
| `opa-web` | Next.js (planned) | Not started — brand management panel for desktop |
| `opa-admin` | Next.js 14 + shadcn/ui (planned) | Not started — internal OPA team panel |

`opa-backend` is the shared infrastructure for both mobile and web clients. Extraction is **blocked** until: all pending DB migrations are applied, all API endpoints are implemented (no 501s), and the API is deployed to Supabase Edge Functions.

- [ ] Extract `backend/` folder to standalone `opa-backend` repo — blocked by API completion and deploy
- [ ] Initialize `opa-admin` repo (`maxibernardoni/opa-admin`) with Next.js 14 + shadcn/ui + Tailwind + Supabase client
- [ ] Define `opa-web` stack and initialize repo — brand panel for desktop (analytics, stock management, order management, automation)
- [ ] Design the API layer in `opa-backend` that `opa-web` will consume (REST or tRPC over Supabase)

---

## Database

### Bloqueantes para extracción de opa-backend (prioridad alta)
- [x] Migration: `ALTER TABLE perfiles ADD COLUMN is_admin boolean DEFAULT false` — ✅ aplicado
- [x] Migration: `ALTER TABLE perfiles ADD COLUMN status varchar DEFAULT 'active'` — ✅ aplicado
- [x] Migration: `ALTER TABLE prendas ADD COLUMN sale_mode text DEFAULT 'direct'` — ✅ aplicado
- [x] Migration: `ALTER TABLE prendas ADD COLUMN external_url text` — ✅ aplicado
- [x] Create `brand_applications` table — ✅ aplicado
- [x] Migration: renombrar `marcas.owner_id` a `marcas.profile_id` — ✅ aplicado (`20260629000001_rename_marcas_owner_id_to_profile_id.sql`); RLS y referencias en API actualizadas

### General
- [ ] Assign `size_guide_id` to the 25 existing seed `prendas` — currently all `NULL`
- [ ] Add `foot_length` column to `user_measurements` — currently `get_recommended_size` uses `height` as a proxy for shoe size; replace once the real measurement is available
- [ ] Restore `size`, `color`, `source` columns to `prendas_armario` — removed in current schema for simplicity; needed when the purchase flow is implemented
- [ ] Add `position_x numeric` and `position_y numeric` to `outfit_items` — removed in favor of `slot` categorical; needed if precise floating label positioning is implemented
- [ ] Audit RLS policies for `productos_carrito`, `orders`, `productos_orden`, `reseñas` — tables exist but policies have not been reviewed
- [ ] Complete `@chechuabb` (Celina Abelson) seed profile and outfits — profile row exists, no outfits seeded
- [ ] Complete metadata for fictional brands (Forma, Revés, Capas, Sole) — `instagram_handle`, `website`, `location` are all `NULL`
- [ ] DB schema for brand loyalty points system — new table `brand_points` (user_id, brand_id, points, updated_at) and logic to award points when a user purchases a 100%-single-brand outfit; requires purchase flow to be implemented first

---

## Backend

- [x] `useSizeGuide` integration in `app/product/[id].tsx` — ✅ implemented: drives SizeGuideSheet table and `entries` display
- [x] `useRecommendedSize` integration in `app/product/[id].tsx` — ✅ implemented: highlights recommended size chip and shows hint text
- [ ] `useUserMeasurements` integration in settings screen — hook exists (`saveMeasurements`, `measurements`), no UI to call it
- [ ] `useOutfitsBySimilarMeasurements` hook (new) — query `useOutfits` or new hook that prioritizes outfits from creators whose `user_measurements` are similar to the authenticated user's; define "similar" threshold (e.g. ±5 cm on waist and chest)
- [ ] Fit preference option for size recommendation — let user choose ajustado/bien/suelto; pass preference to `get_recommended_size` and adjust matching logic
- [ ] "Ya lo tenés" data logic — cross-reference `outfit_items` with `prendas_armario` for the authenticated user to determine which garments in an outfit are already owned; expose as hook or computed field in `useOutfits`
- [ ] "Este look en tu talle" suggestion logic — for a given outfit, find equivalent garments in the user's size using `size_guide_id` + `user_measurements`; requires `available_sizes` and `size_guide_id` on `prendas` to be populated
- [ ] Brand collections in feed — when user is on "Tus marcas" tab, filter outfit feed to show outfits composed exclusively or primarily of garments from brands the user follows; requires `follows` on brands (currently only between users)
- [ ] Edge Functions for server-side like/save logic — currently handled by client + DB trigger; Edge Functions would add rate limiting and abuse prevention
- [ ] Realtime subscriptions for live like/save counts
- [ ] Full-text search on outfits and garments
- [ ] Cursor-based pagination in `useOutfits` — currently `LIMIT 20`; needs infinite scroll support

### API (Hono — `backend/functions/api/`)
- [x] Deploy to Supabase Edge Functions — ✅ deployed; `GET /api/health` responding in production (`vecnktrbjolahcalkbml.supabase.co/functions/v1/api/health`)
- [ ] `GET /api/brands/me/metrics` — visit/click/conversion tracking requires new DB tables; currently returns likes + saves only (with note)
- [x] `POST /api/orders` — ✅ implemented: stock validation, total calculation, `stock_por_talle` decrement, order + `productos_orden` creation, cart cleared
- [x] `PATCH /api/orders/:id/status` — ✅ implemented: verifies brand ownership via garments in the order; valid values: pending/shipped/delivered
- [x] Brand garment management routes — ✅ implemented: `GET/POST /api/brands/me/prendas`, `PATCH /api/brands/me/prendas/:id`
- [x] Rate limiting middleware — ✅ implemented: in-memory Map on `POST /orders`, window 60s, max 20 req; note: resets on cold start (Deno KV upgrade tracked separately)
- [ ] Update CORS origin with confirmed opa-web production domain (currently placeholder `https://opa-web.vercel.app`)
- [ ] Move rate limiter to Deno KV for persistence across Edge Function instances

---

## Frontend

### Screens to build
- [x] `app/product/[id].tsx` — ✅ implemented: garment image, brand info, size selector chips, SizeGuideSheet bottom sheet with per-category measurement table, recommended size highlighted in rosaOpa, add to cart / redirect CTA
- [x] `app/outfit/[id].tsx` — ✅ implemented: cover image, creator row, garment list by slot, slot thumbnail grid, total price + "Ver outfit" CTA
- [x] `app/(tabs)/search.tsx` — ✅ implemented: debounced text query (350ms), outfits/prendas tabs, tag filter chips (#style/#occasion), 2-col grid results
- [x] `app/(tabs)/wardrobe.tsx` — ✅ implemented: real data from useWardrobe, slot filter chips, 3-col grid, tap navigates to product detail
- [ ] Body measurements input screen — accessible from Settings and from first use of the size guide; numeric inputs for height, chest, waist, hip, thigh in cm; persists via `useUserMeasurements().saveMeasurements()`
- [ ] Settings sub-screens: edit profile (display name, bio, avatar, tags), security (change password, 2FA), notifications preferences, style preferences

### Features on existing screens
- [ ] "Ya lo tenés / te falta $X" in outfit bottom bar — if the user owns some garments from the outfit (via `prendas_armario`), show "Tenés N de M prendas — te falta $X para completar este look" instead of full total price
- [ ] "Este look en tu talle" — when an outfit's garments are not available in the user's measured size, surface equivalent garments in the correct size and show a swap suggestion
- [x] Highlight recommended size in the size selector — ✅ implemented in `app/product/[id].tsx`: chip with `rosaOpa` 2px border + hint text below selector
- [ ] Save garment button on garment cards — button to toggle `prendas_guardadas`; optimistic update matching the pattern used by `useSave`
- [ ] Outfit scroll filtered by similar measurements — visual indicator or feed mode that surfaces outfits from creators with `user_measurements` similar to the logged-in user ("see how it looks on someone like you")
- [ ] Face blurring / AI face removal when uploading outfit photos — optional setting; preserves garment and body, removes or blurs the face; lowers barrier to UGC

### Components to build
- [x] `SizeGuideSheet` — ✅ implemented inline in `app/product/[id].tsx`: opens from ⓘ button, table with size_label + per-category measurements (tops: bust/waist/hip, bottoms: waist/hip/thigh, calzado: foot length), highlights recommended size with rosaOpa
- [ ] Skeleton loaders — replace `ActivityIndicator` with skeleton placeholders in `OutfitCard`, `GarmentCard`, `ProfileHeader`
- [ ] Like / save spring animations — outline → filled transition with `damping: 10, stiffness: 200` on toggle
- [ ] Brand collections in feed — "Tus marcas" tab in outfit scroll header filters to outfits from followed brands; requires follow system extended to brands

---

## Design

- [ ] Dark mode — not planned for Demo 1; track here for future
- [ ] Micro-interactions in bottom tab bar — subtle bounce or scale on tab press
- [ ] Outfit detail screen design — interactive floating labels, garment grid, CTA layout
- [ ] Product detail screen design — image gallery, size selector UX, `SizeGuideSheet` bottom sheet visual
- [ ] Measurements input screen design — numeric input layout, body diagram reference illustration

---

## Product Ideas (not yet scoped)

Ideas discussed that need design + technical scoping before becoming implementation tasks.

| Idea | Summary | Dependencies |
|---|---|---|
| Brand loyalty points | Purchasing a 100%-single-brand outfit earns points toward that brand's discounts; progressive unlock mechanic (like Burger King crowns); requires one-brand pilot agreement | Purchase flow, `brand_points` DB table |
| Face blur on photo upload | AI or blur-based face removal when uploading outfit photos; optional; preserves body proportions and garment visibility | Image processing pipeline (Edge Function or client-side ML) |
| "Ya lo tenés / te falta $X" | Show users the price delta to complete a look based on what they already own in their wardrobe | `prendas_armario` populated, purchase flow |
| "Este look en tu talle" | Suggest equivalent garments in the user's measured size when the outfit's garments are not available in their size | `user_measurements`, `size_guide_id` on prendas |
| Brand collections in feed | Brands publish complete outfits using their own garments; appear in general feed as content creators; filtered in "Tus marcas" tab | Brand follow system |
| Outfit scroll by similar measurements | Feed mode that prioritizes outfits from creators with body measurements similar to the logged-in user | `user_measurements` populated, `useOutfitsBySimilarMeasurements` hook |
| Fit preference in size recommendation | User selects ajustado / bien / suelto preference; `get_recommended_size` adjusts match range accordingly | `user_measurements` UI, updated SQL function |

---

## opa-admin

All items below are for the `maxibernardoni/opa-admin` repo (separate session). See `product-2026-06-15-admin-panel.md` for full screen specs.

- [ ] Initialize repo with Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind
- [ ] Configure Supabase client — anon key for auth, service_role for DB operations (server-side only)
- [ ] Implement Next.js middleware auth gate — check `perfiles.is_admin = true` before allowing access to any route except `/login`
- [ ] Dashboard screen — aggregate queries for global KPIs (users, outfits, prendas, orders, revenue, top content)
- [ ] Brand Management: solicitudes pendientes screen + approve/reject flow (requires `brand_applications` table)
- [ ] Brand Management: lista de marcas + detalle/edición + toggle verified
- [ ] User Management: lista de usuarios + perfil + acciones (suspend/ban/delete — requires `perfiles.status` column)
- [ ] Content Moderation: delete outfits, prendas, reseñas (no pre-approval)
- [ ] Statistics: general, per-brand, sales, content trends

---

## Pending

- [ ] Migrate all pre-2026-06-07 documents from Spanish to English on next substantive edit
- [ ] Remove pending items from `frontend-2026-06-06-screens-and-components.md` and `database-2026-06-06-schema-and-seed.md` that are now tracked here — avoid duplication
