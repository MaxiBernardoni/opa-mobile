# Meta — Pending Features & Ideas

Single source of truth for everything that is not yet implemented in OPA. Items are grouped by layer (DB, Backend, Frontend, Design) and tagged with status. Product ideas discussed but not yet scoped for implementation are listed at the end.

> **Rule:** when a pending item is implemented, remove it from this document and add it to the relevant layer document. Do not leave completed items here.

---

## Repository Structure

OPA lives across four repositories:

| Repo | Stack | Status |
|---|---|---|
| `opa-mobile` | React Native + Expo | Active — current repo, under `opa-organization` |
| `opa-backend` | Supabase + Edge Functions + Hono API | ✅ extracted — `opa-organization/opa-backend` |
| `opa-web` | Next.js (planned) | Not started — create directly under `opa-organization` |
| `opa-admin` | Next.js 14 + Tailwind (no shadcn CLI actually installed) | ✅ `opa-organization/opa-admin` — functional locally against real Supabase data (confirmed 2026-08-03 by reading the cloned repo, see `## opa-admin` section below), not deployed |

`opa-backend` is the shared infrastructure for both mobile and web clients.

- [x] Extract `backend/` folder to standalone `opa-backend` repo — ✅ done and confirmed independent (2026-07-03): redeployed the `api` Edge Function in production using only `opa-backend`'s code (version 2, verified via `GET /api/health`), tested `opa-mobile` end-to-end against Supabase (home carousels, outfit deep-link, like/follow) with no local `backend/` folder. `backend/` deleted from `opa-mobile`. Found and fixed two issues during verification, both committed to `opa-backend`: (1) `functions/api/index.ts` rate-limiter was registered on the invalid path `/orders/POST` and never matched any request — fixed to a `'*'` middleware checking method+path; (2) migration `20260701150747_rls_policies_cart_orders_reviews_wardrobe` was applied directly to the live DB but missing from git history in both repos — reconstructed from live RLS policies and added to `opa-backend/supabase/migrations/`.
- [x] Migrate `opa-mobile` and `opa-backend` into the `opa-organization` GitHub org — ✅ done and confirmed (2026-07-03, re-verified 2026-08-03 via `git remote -v` on both local repos): both point to `github.com/opa-organization/...`; push/fetch tested working. First attempt failed using GitHub's "Import a repository" tool (clone-based, needs credentials); the fix was using "Transfer ownership" (Settings → Danger Zone → Transfer) instead, which is native and doesn't clone.
- [x] Confirm whether `opa-admin` has been transferred into `opa-organization` — ✅ confirmed by user 2026-08-03: it's under `opa-organization/opa-admin`. Not independently re-verified via `git remote -v` (repo not cloned in this environment); the user plans to clone it in for a future session so its actual dev/code state can be checked.
- [x] Initialize `opa-admin` repo with Next.js 14 + Supabase client — ✅ done, confirmed 2026-08-03 (see `## opa-admin` section below for the full breakdown; not shadcn/ui specifically, see that section)
- [ ] Define `opa-web` stack and initialize repo — brand panel for desktop (analytics, stock management, order management, automation); create under `opa-organization`. Not started — deliberately deprioritized (2026-08-03), pick up later.
- [x] Design the API layer in `opa-backend` that `opa-web` will consume — ✅ effectively already done (found 2026-08-03 while reviewing pendings): `opa-backend/functions/api/routes/brands.ts` is explicitly commented "for opa-web brand panel" and already covers brand info CRUD (`GET/PATCH /brands/me`), garment/stock management (`GET/POST /brands/me/prendas`, `PATCH /brands/me/prendas/:id` incl. `stock_por_talle`), and metrics (`GET /brands/me/metrics`); `orders.ts` covers order management (`GET /orders`, `PATCH /orders/:id/status` with brand-ownership check). It's REST (not tRPC). CORS in `index.ts` already whitelists `localhost:3000` + a placeholder opa-web prod domain. Remaining gaps are already tracked separately below: metrics only cover likes/saves (no visit/click/conversion tables yet), and the CORS prod domain is still a placeholder.

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
- [x] Assign `size_guide_id` to the 25 existing seed `prendas` — ✅ done 2026-08-03. Found 8 already assigned from an undocumented earlier pass (7 calzado + 1 cinturón); assigned the remaining 17 (6 piernas, 10 torso, 1 extras/bolso) via a name/style-based heuristic (e.g. "Oversized" in the name → guide `Oversize`; "Slim"/"Wide Leg" → `Skinny`/`Baggy`; ambiguous tops default to `Relaxed`, the middle option). Low-confidence call: "Slip Dress Negro" and "Trench Camel" don't map cleanly to any of the 3 tops guides (boxy/oversize/relaxed) — both went to `Relaxed` as the safest default; revisit if it looks wrong in the size selector.
- [x] Add `foot_length` column to `user_measurements` — ✅ done 2026-08-03 (migration `add_foot_length_to_user_measurements`, version `20260803120322`). `get_recommended_size()` now does `coalesce(u.foot_length, u.height)` for calzado — uses the real measurement when present, falls back to the old height-proxy otherwise so existing users aren't broken. Added the field to `app/measurements.tsx` (`FIELDS` array — "Largo de pie (cm)") and `types/index.ts` (`UserMeasurements.foot_length`). Verified with `tsc --noEmit`: no new errors vs. baseline.
- [x] Restore `size`, `color`, `source` columns to `prendas_armario` — ✅ done 2026-08-07, user decided to add them now despite no purchase flow yet. Migration `20260807141330_add_size_color_source_to_prendas_armario` (all 3 nullable `varchar`, no check constraint). Table had 0 rows, so no backfill was needed/possible. `types/index.ts` `WardrobeItem` updated to match. Still unused until the purchase flow / wardrobe-editing UI exists.
- [ ] Add `position_x numeric` and `position_y numeric` to `outfit_items` — **decided 2026-08-07: not hand-placed by us.** The user ruled out manually placing x/y for the 7 seed outfits by hand — instead, brands will set garment position visually themselves through a UI when creating/editing a garment (a visual "place this garment on the photo" step), most likely to live in `opa-web` (the not-yet-started brand panel) or possibly `opa-admin`. So this becomes: (a) add the nullable `position_x`/`position_y` columns whenever that visual editor is actually being built (schema-only ahead of time has no value per the earlier note), (b) build the visual placement UI in whichever panel ends up owning garment creation, (c) update `OutfitScrollItem`'s connector-line rendering in `opa-mobile` to consume real coordinates instead of the current `slot`-based anchors, with a fallback to the slot anchor when a garment has no coordinates set yet (since old/seed data won't have them). Not started — blocked on `opa-web` scoping (or a decision to put garment creation in `opa-admin` instead).
- [x] Audit RLS policies for `productos_carrito`, `orders`, `productos_orden`, `reseñas`, `prendas_armario` — ✅ done: found already applied live but missing from git history, reconstructed as `opa-backend/supabase/migrations/20260701150747_rls_policies_cart_orders_reviews_wardrobe.sql` (2026-07-03)
- [x] Complete metadata for fictional brands (Forma, Revés, Capas, Sole) — ✅ done: `website`/`location`/`description`/`tags` ya estaban cargados; `instagram_handle` completado el 2026-07-06 desde `opa-admin` (`reves.oficial`, `forma.oficial`, `capas.oficial`, `sole.oficial`). Nota: `profile_id` sigue `NULL` en todas las marcas (falta onboarding de cuentas de marca)
- [ ] DB schema for brand loyalty points system — new table `brand_points` (user_id, brand_id, points, updated_at) and logic to award points when a user purchases a 100%-single-brand outfit; requires purchase flow to be implemented first
- [ ] **Investigate `admin_impersonation_log` table** — found unexpectedly 2026-08-03 while checking `list_migrations` (migration `admin_impersonation_log`, version `20260803115219`, applied same day, right before this session's own DB work). Columns: `admin_profile_id`, `brand_id`, `brand_profile_id`, `created_at`. RLS enabled with zero policies (service_role only). Not referenced anywhere in `opa-mobile`, `opa-backend`, or `opa-admin`'s own docs/checklists as of this session. Looks like an "admin impersonates a brand account" audit-log feature, likely built in an undocumented `opa-admin` session. Nothing was changed — just flagging that it exists and needs to be documented (or investigated if unexpected) in `product-2026-06-15-admin-panel.md` / `opa-admin/CLAUDE.md`. See `database-2026-06-06-schema-and-seed.md` for full detail.

---

## Backend

- [x] `useSizeGuide` integration in `app/product/[id].tsx` — ✅ implemented: drives SizeGuideSheet table and `entries` display
- [x] `useRecommendedSize` integration in `app/product/[id].tsx` — ✅ implemented: highlights recommended size chip and shows hint text
- [x] `useUserMeasurements` integration in settings screen — ✅ implemented: `app/measurements.tsx`, reachable from Settings → "Mis medidas"
- [ ] `useOutfitsBySimilarMeasurements` hook (new) — query `useOutfits` or new hook that prioritizes outfits from creators whose `user_measurements` are similar to the authenticated user's; define "similar" threshold (e.g. ±5 cm on waist and chest)
- [ ] Fit preference option for size recommendation — let user choose ajustado/bien/suelto; pass preference to `get_recommended_size` and adjust matching logic
- [ ] "Ya lo tenés" data logic — cross-reference `outfit_items` with `prendas_armario` for the authenticated user to determine which garments in an outfit are already owned; expose as hook or computed field in `useOutfits`
- [ ] "Este look en tu talle" suggestion logic — for a given outfit, find equivalent garments in the user's size using `size_guide_id` + `user_measurements`; requires `available_sizes` and `size_guide_id` on `prendas` to be populated
- [x] Brand collections in feed — ✅ done 2026-08-07: `app/(tabs)/outfits.tsx` "tus marcas" tab now filters to outfits with ≥1 garment from a followed brand (user-decided threshold). Turned out `follows` on brands was **not** actually a blocker — `marca/[id].tsx`'s Seguir button already targets `brand.profile_id` through the same `follows` table used for user-to-user follows, since a brand's `perfiles.id` IS its `marcas.profile_id`. New hook `hooks/useFollowedBrandIds.ts`. See `frontend-2026-06-06-screens-and-components.md` for full detail.
- [ ] Edge Functions for server-side like/save logic — currently handled by client + DB trigger; Edge Functions would add rate limiting and abuse prevention
- [ ] Realtime subscriptions for live like/save counts
- [ ] Full-text search on outfits and garments
- [ ] Cursor-based pagination in `useOutfits` — currently `LIMIT 20`; needs infinite scroll support

### API (Hono — code now in `opa-backend/functions/api/`, separate repo)
- [x] Deploy to Supabase Edge Functions — ✅ deployed; `GET /api/health` responding in production (`vecnktrbjolahcalkbml.supabase.co/functions/v1/api/health`)
- [ ] `GET /api/brands/me/metrics` — visit/click/conversion tracking requires new DB tables; currently returns likes + saves only (with note)
- [x] `POST /api/orders` — ✅ implemented: stock validation, total calculation, `stock_por_talle` decrement, order + `productos_orden` creation, cart cleared
- [x] `PATCH /api/orders/:id/status` — ✅ implemented: verifies brand ownership via garments in the order; valid values: pending/shipped/delivered
- [x] Brand garment management routes — ✅ implemented: `GET/POST /api/brands/me/prendas`, `PATCH /api/brands/me/prendas/:id`
- [x] Rate limiting middleware — implemented but currently a no-op: it's registered as `app.use('*', ...)` before `authMiddleware` runs, so `c.get('user')` is always empty at that point and the limit never triggers. Found during opa-backend independence verification (2026-07-03). Needs the middleware moved to run after auth, or to key off something available pre-auth (e.g. IP).
- [ ] Update CORS origin with confirmed opa-web production domain (currently placeholder `https://opa-web.vercel.app`)
- [ ] Move rate limiter to Deno KV for persistence across Edge Function instances
- [x] **Bug found and fixed 2026-08-07:** `marca/[id].tsx`'s "Seguidores" count didn't update after using the Seguir/Siguiendo button (`useBrand`'s `followersCount` was fetched once on mount, never adjusted on follow toggle). Fixed with an optimistic ±1: `useBrand` now also returns `adjustFollowersCount(delta)`; `marca/[id].tsx` wraps `toggleFollow` in a local `handleToggleFollow` that calls `adjustFollowersCount(following ? -1 : 1)` before triggering the toggle (same optimistic-without-rollback pattern already used by `useLike`/`useSave`). Verified in browser: logged in as `sole@opa.com`, followed Capas (1→2 Seguidores instantly, no remount needed), unfollowed (2→1). No leftover `follows` rows after the test.

---

## Frontend

### Screens to build
- [x] `app/user/[id].tsx` — ✅ implemented: read-only profile view for any other user (was a real gap — before this, tapping a creator always skipped straight to `user-outfits.tsx`, there was no way to view anyone's profile but your own). Avatar + stats (no "Guardados", that's private), name/bio/tags, Seguir/Siguiendo button (`useFollow`), single grid tab of their outfits → `user-outfits.tsx`. Redirects to `/(tabs)/profile` if viewing your own id. Entry points updated: `outfit/[id].tsx` creator row, `OutfitScrollItem` creator avatar/name, `search.tsx` creator handle.
- [x] `app/product/[id].tsx` — ✅ implemented: garment image, brand info, size selector chips, SizeGuideSheet bottom sheet with per-category measurement table, recommended size highlighted in rosaOpa, add to cart / redirect CTA
- [x] `app/outfit/[id].tsx` — ✅ implemented: cover image, creator row, garment list by slot, slot thumbnail grid, total price + "Ver outfit" CTA
- [x] `app/(tabs)/search.tsx` — ✅ implemented: debounced text query (350ms), outfits/prendas tabs, tag filter chips (#style/#occasion), 2-col grid results
- [x] `app/(tabs)/wardrobe.tsx` — ✅ implemented: real data from useWardrobe, slot filter chips, 3-col grid, tap navigates to product detail
- [x] Body measurements input screen — ✅ implemented: `app/measurements.tsx`, numeric inputs for height, chest, waist, hip, thigh in cm; persists via `useUserMeasurements().save()`. Not yet linked from first use of the size guide.
- [x] Settings → "Registrar Marca" — ✅ implemented: row shown in `app/settings.tsx` when `perfiles.is_brand = false`, opens a modal form (brand name, Instagram, category) that inserts into `brand_applications`
- [x] `app/marca/[id].tsx` — ✅ implemented (2026-07-06): public brand profile, layout distinct from user profile (banner + circular logo avatar, name + `verificado_ondas` badge when `marcas.verified`, `@handle · Marca`, bio, tags, stats **Seguidores/Outfits/Prendas**, full-width Seguir, two icon-only tabs Grid/Catálogo). New hook `useBrand(marcaId)`. "Ya lo tenés" strip crosses `useWardrobe` with `garment.brand_id`. Catalog tab = 3-col `prendas` grid → `product/[id]`. Entry points wired: home "Marcas" slider (`app/(tabs)/index.tsx`) + brand row in `app/product/[id].tsx`. Still pending: wardrobe filtered by brand (banner currently opens wardrobe unfiltered), brand follow system decision.
- [x] Brand login + "own brand profile" — ✅ implemented (2026-07-13): a real brand account now exists and can log in and see its own brand profile. Reused the existing **Revés** brand (`220cc733-dd7c-4f4f-912d-72d465e1196e`, 7 real prendas) instead of a fresh empty one. Created the Supabase Auth user by hand via SQL (insert into `auth.users` with `extensions.crypt(...)` password hash, tokens set to `''`, email confirmed) — the `handle_new_user` trigger created `perfiles`, then `perfiles.is_brand=true` + `marcas.profile_id` were set. **Credentials (test/seed): `reves@opa.com` / `reves1234`.** Frontend: new hook `hooks/useMyBrand.ts` (marca where `profile_id = userId`); `app/(tabs)/profile.tsx` `<Redirect>`s to `/marca/[id]` when `profile.is_brand`; `app/marca/[id].tsx` gained an `isOwn` mode (`brand.profile_id === session.user.id`) → settings gear (→ `/settings`, where logout lives) instead of share/menu, no "Seguir" button, "perfil" nav tab active. Verified at the DB level (password hash valid, role/confirmed/tokens OK, marca↔profile↔7 prendas linked) and via `tsc`; **browser render NOT verified this session** — the Expo dev server would not stay alive in this environment (bundle requests `ERR_CONNECTION_REFUSED`, process-spawn issues). Now that Revés has a real `profile_id`, its Outfits grid / Seguidores / Seguir are live (but it has 0 outfits + 0 followers seeded, so they read 0); the **other** `marcas` still have `profile_id = NULL` and keep the old caveat. See `product-2026-06-10-brand-system.md`.
- [x] Block like/save/follow for brand accounts — ✅ done 2026-08-07. Scope widened from the original wording per user decision: brand accounts don't just lose the like/save/follow buttons, they lose **access to the feed tab entirely** ("el vendedor ni tenga acceso a la sección de feed"). `app/(tabs)/outfits.tsx` now `<Redirect href="/(tabs)/profile" />`s away when `profile?.is_brand` (covers tab press, deep links from Home, and direct URL nav in one place); `components/navigation/BottomNavBar.tsx` hides the "outfits" tab icon for brand accounts. Follow buttons hidden for brand viewers on `app/marca/[id].tsx` and `app/user/[id].tsx` (plus their standalone nav bars also hide the "outfits" icon). `components/outfit/OutfitScrollItem.tsx` hides like/save/follow (keeps share) for brand viewers as defense-in-depth, since it's still reachable outside the feed tab via `user-outfits.tsx` / `saved-outfits.tsx`. Verified in browser logged in as `capas@opa.com`: direct nav to `/(tabs)/outfits` redirects to own marca profile, nav bar has 4 icons (no outfits), Sole's marca profile has no Seguir button, `vale.rios`'s user profile has no Seguir button.
- [x] Multi-account switcher (personal ⇄ brand) — ✅ done 2026-08-07, scoped as "remembered accounts on this device" rather than a true Instagram-style linked-account switch (there's no DB relationship between a personal profile and a brand account to link — confirmed with the user before building). New `lib/rememberedAccounts.ts` persists `{userId, email, username, displayName, avatarUrl, isBrand, accessToken, refreshToken, updatedAt}` per account (same SecureStore/localStorage split as `lib/supabase.ts`, whose `storage` adapter is now exported and reused). `app/_layout.tsx`'s central `onAuthStateChange` listener upserts the active account's tokens on every `SIGNED_IN`/`TOKEN_REFRESHED` (needed because Supabase rotates refresh tokens — a stale copy would fail on switch-back) and removes the entry on `SIGNED_OUT` (logout means "leave this device" per its own UI copy, so it drops out of the switcher and needs a password again). New screen `app/switch-account.tsx` lists remembered accounts (active one marked, others tappable) + "Agregar cuenta" → `/auth`; switching calls `supabase.auth.setSession({access_token, refresh_token})` — no password, no network round-trip to re-auth. If a stored refresh token turns out invalid (revoked/expired), the entry is dropped and the user is prompted to log in again. Entry point: new "Cambiar de cuenta" row in `app/settings.tsx` (CUENTA section) — no fitting icon exists in Storage (checked via the bucket's `list` API), so it uses a plain text glyph (`⇄`) instead of an emoji/image. Verified end-to-end in browser: logged in as Capas, added Sole via "Agregar cuenta", switched Sole→Capas and back with no re-auth, logged out of Capas → it disappeared from the switcher while Sole stayed and still switched in fine afterward.
- [ ] Settings sub-screens: edit profile (display name, bio, avatar, tags), security (change password, 2FA), notifications preferences, style preferences

### Features on existing screens
- [ ] "Seguís a X y N más en común" in `app/user/[id].tsx` — mutual connections (people the logged-in user follows who also follow the visited profile). Requires a new intersection query across both `follows` lists; no precedent in the codebase. Explicitly scoped out when building `app/user/[id].tsx` (2026-07-03).
- [ ] "Siguiendo" button with notification bell in `app/user/[id].tsx` — requires a new column on `follows` (e.g. `notify boolean default true`) and extending `useFollow`. Explicitly scoped out when building `app/user/[id].tsx` (2026-07-03); the button currently reuses the plain Seguir/Siguiendo toggle already used in the outfit scroll.
- [ ] Share (↑) and menu (···) actions in `app/user/[id].tsx` — visual only for now, no functionality (share profile, report, block are undefined).
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

All items below are for the `opa-organization/opa-admin` repo (separate session). See `product-2026-06-15-admin-panel.md` for full screen specs.

> **Corrected 2026-08-03** — this section previously said "not started" / "initial dev", which was wrong. Verified directly against the cloned repo (`C:\Users\devandroid\opa-admin`): file tree, `git log` (8 real commits), and `git remote -v` (→ `opa-organization/opa-admin`, confirming the org transfer independently of the user's report). The panel is **functional locally against real Supabase data**, just not deployed yet.

- [x] Initialize repo with Next.js 14 (App Router) + TypeScript + Supabase client — ✅ done. Not shadcn/ui — its own `CLAUDE.md` notes the declared stack says shadcn but the actual UI components are custom Tailwind (`components/`), no shadcn CLI installed
- [x] Configure Supabase client — ✅ `lib/supabase/server.ts` (`createServiceRoleClient()`, service_role, server-only) + `lib/supabase/client.ts` (browser client for auth)
- [x] Implement Next.js middleware auth gate — ✅ `middleware.ts`: checks Supabase session, then `perfiles.is_admin` (service_role) on first request, caches the result in an `httpOnly` cookie `opa_is_admin` for 8h to avoid a DB roundtrip per request
- [x] Dashboard screen — ✅ `app/(admin)/dashboard/`: global KPIs (users, outfits, prendas, marcas, orders/revenue) + top 5 outfits by likes
- [ ] Brand Management: solicitudes pendientes screen + approve/reject flow — ❌ still missing (requires `brand_applications` table, which exists in DB but has no admin UI yet). Verified via grep: no reference to `brand_applications` anywhere in the opa-admin codebase.
- [x] Brand Management: lista de marcas + detalle/edición + toggle verified — ✅ `app/(admin)/marcas/` (list + search) and `app/(admin)/marcas/[id]/` (inline field edit, verified toggle, add/remove prendas for that brand)
- [x] User Management: lista de usuarios + perfil + acciones (suspend/ban/delete) — ✅ `app/(admin)/usuarios/` (list) and `app/(admin)/usuarios/[id]/` (detail: outfits, orders, stats + suspend/ban/delete via `user-actions.tsx`)
- [x] Content Moderation: delete outfits, prendas, reseñas (no pre-approval) — ✅ `app/(admin)/moderacion/{outfits,prendas,reseñas}/`, each with brand filter + text search + delete; hover-preview of the image on garment/outfit name
- [ ] Statistics: per-brand, sales, content trends — ❌ still missing; dashboard only has the global KPIs + top-5-outfits above, no dedicated stats screens
- [ ] Pagination in long lists (usuarios/outfits/prendas) — uses a fixed `.limit()`, no real pagination yet
- [ ] Deploy to Vercel — not deployed; needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` env vars set there
- [ ] Assign `is_admin = true` to the first real admin user in production Supabase
- [ ] Decide whether to formally adopt shadcn/ui (per the originally declared stack) or keep the current custom Tailwind components as the standard

---

## Pending

- [ ] Migrate all pre-2026-06-07 documents from Spanish to English on next substantive edit
- [ ] Remove pending items from `frontend-2026-06-06-screens-and-components.md` and `database-2026-06-06-schema-and-seed.md` that are now tracked here — avoid duplication
