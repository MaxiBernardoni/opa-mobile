# Product — Brand System

This document defines the brand model in OPA: what a brand is, how it enters the platform, what it can do, how its public profile looks, and how OPA monetizes the relationship. It covers decisions made across DB, backend, frontend, and design.

---

## What a Brand Is in OPA

A brand is a fashion label (real or emerging) that publishes garments and outfits on OPA. Brands are distinct from regular users — they have a dedicated profile layout, a product catalog, and access to a management panel.

**Key principle:** brands are content creators first. They publish outfits (looks built from their own garments) that appear in the general feed. The catalog and purchase flow come second.

A brand IS a separate Supabase Auth account — it has its own email and password, independent from any personal user account. It is identified by `perfiles.is_brand = true`. Multiple employees can access the brand account by sharing its credentials, the same way a business Instagram account works.

A brand account cannot like, save, or follow — it only has access to brand management features (garment upload, outfit publishing, metrics, order management).

The `marcas` table links to the brand's own `perfiles` row via `profile_id` (renamed from `owner_id`).

---

## Brand Onboarding

The application is submitted from a personal user account. On approval, a separate brand account is created with the credentials the brand provided in the form.

### Step-by-step flow

1. A person logs into their personal OPA account
2. From **Settings → Registrar Marca**, they fill out a registration form that includes:
   - Brand name, category, Instagram handle
   - Email and password for the future brand account (chosen by the brand, not assigned by OPA)
3. Submitting the form creates a row in `brand_applications` with `status = 'pending'` — **no Supabase Auth account is created yet**
4. OPA reviews the application from the `opa-admin` panel
5. On **approval**: OPA calls `supabase.auth.admin.createUser()` with the email/password from the application, creates the `perfiles` row with `is_brand = true`, creates the `marcas` row, and sets `marcas.profile_id` to the new profile's id
6. On **rejection**: `brand_applications.status` is set to `rejected` with an optional `rejection_reason`; the applicant is notified

The brand then logs into OPA using the email and password they chose in the form. From that point, the brand account is completely independent from the personal account that submitted the application.

**The brand application flow (screen + backend) is not yet implemented.**

> **Demo shortcut (2026-07-13):** to have a working brand login before the onboarding backend exists, one brand account was created **by hand** in the DB, skipping the application flow. The existing **Revés** brand was reused (7 real prendas) rather than creating a new one: a Supabase Auth user was inserted directly into `auth.users` (bcrypt password via `extensions.crypt`, email confirmed), the `handle_new_user` trigger created `perfiles`, then `is_brand=true` was set and `marcas.profile_id` pointed at the new profile. Credentials (test): `reves@opa.com` / `reves1234`. This is exactly what step 5 above will automate via `supabase.auth.admin.createUser()` from `opa-admin` — the manual insert is a stopgap for demo/testing, not the real onboarding path.

---

## Brand Verification

Two levels — being approved to publish does not automatically grant the verified badge:

| Level | What it means | Badge |
|---|---|---|
| **Approved** | Can publish garments, outfits, and manage their panel | No badge |
| **Verified** | Additional step: CUIT/tax ID, active social media, minimum track record | ✅ Pink checkmark (`rosaOpa`) visible on profile and in outfit scroll |

The `marcas.verified` field in the DB corresponds to the verified level.

---

## Public Brand Profile

Designed from the Figma prototype. Differs significantly from a regular user profile.

### Header
- **Banner image** — full-width cover photo (brand campaign, lookbook, etc.); does not exist on user profiles
- **Circular logo avatar** — overlaps the bottom-left of the banner
- **Brand name** (bold, uppercase) + pink verified checkmark inline
- **`@handle · Marca`** — the `· Marca` label visually distinguishes it from a personal account
- **Bio** — short tagline (e.g. "Prendas oversized y washed con actitud street.")
- **Style tags** — chips (e.g. street, oversize, urban)

### Contextual "Ya lo tenés" Banner
- Appears only if the logged-in user has garments from this brand in `prendas_armario`
- Pink background strip: "Tenés **X prendas de MARCA** en tu armario" + arrow →
- Tapping it navigates to the wardrobe filtered by this brand
- Does not appear if user has no garments from this brand, or if not logged in

### Stats Row
Brands show different stats than users:

| Brands | Users |
|---|---|
| Seguidores | Seguidores |
| Outfits | Seguidos |
| Prendas | Outfits |
| — | Guardados |

Brands do not follow other accounts — no "Seguidos" stat.

### Follow Button
- Full-width pink button, same pattern as following a user
- Writes to `follows` table with `following_id = marca.profile_id` (current implementation) or a future `brand_follows` table

### Tabs
Two tabs, icon-only (no text labels):

| Tab | Icon | Content |
|---|---|---|
| Outfits | Grid (⊞) | 3-column grid of outfits published by this brand; tapping navigates to the outfit scroll |
| Catálogo | Shopping bag (🛍) | Grid of the brand's garments (`prendas`); tapping navigates to `product/[id]` |

The catalog tab is exclusive to brand profiles — regular users do not have it.

---

## What a Brand Can Do (Management Panel)

The panel is accessible to the brand owner from their profile. **Not yet implemented.**

| Feature | Description |
|---|---|
| Upload and edit garments | Name, description, price, category, images, available sizes, stock per size (`stock_por_talle` jsonb) |
| Publish outfits | Build looks from their own garments; outfits appear in the general feed |
| Create custom size guides | Brand-specific `size_guides` rows linked to their `marcas.id`; override OPA default guides |
| Configure sale mode | Per-garment: sell directly through OPA or redirect to external URL (Tienda Nube, website, etc.) |
| Set external redirect URL | If sale mode = redirect, provide the URL per garment or per brand |
| View metrics | Likes, saves, profile visits, product clicks, conversion rate |
| Manage orders | View and update order status for direct sales; not applicable for redirect mode |
| Manage discounts | Strike-through price + discounted price; or promotional codes |
| Respond to reviews | Reply to user reviews on purchased garments |
| Upload brand content | Campaign photos and lookbooks visible in the "Las marcas que la gente elige" section on Home |

---

## Sales Model

**Hybrid** — each brand chooses per garment whether to sell directly through OPA or redirect to an external URL.

| Mode | How it works | OPA's role |
|---|---|---|
| **Direct** | User completes the purchase inside OPA; OPA processes payment and transfers to the brand minus commission | Payment processor, order manager |
| **Redirect** | Tapping "Comprar" opens the brand's external URL (Tienda Nube, web, IG DM, etc.); OPA does not process payment | Discovery and referral only |

---

## Stock Management

For direct-sale garments, the brand manages stock per size inside OPA using the `stock_por_talle jsonb` column on `prendas` (e.g. `{"XS": 10, "S": 5, "M": 0}`).

- OPA decrements stock automatically when a direct sale is confirmed
- If a size reaches 0, it appears as unavailable in the size selector
- For redirect-mode garments, stock is managed by the external store; OPA shows all sizes as available unless the brand manually marks otherwise

---

## Monetization (OPA charges brands)

**Mixed model:**

| Revenue stream | Description |
|---|---|
| **Commission per direct sale** | OPA takes a % of each purchase processed inside the app; brands using redirect mode do not pay commission |
| **Monthly subscription** | Optional paid plan with additional benefits: higher feed visibility, advanced metrics, featured placement in "Las marcas que la gente elige", priority support |

Exact commission percentage and subscription tiers are not yet defined.

---

## Data Model Implications

Current DB supports brands partially. Gaps to fill:

- `marcas.verified` — field exists ✅
- `perfiles.is_brand` — field exists ✅
- `stock_por_talle jsonb` on `prendas` — field exists ✅
- `size_guides.brand_id` — field exists, RLS allows brand profile to insert ✅
- `brand_applications` table — exists ✅ (fields: `applicant_id`, `brand_name`, `instagram_handle`, `category`, `status`, `rejection_reason`, `reviewed_by`, `reviewed_at`)
- `sale_mode text` and `external_url text` on `prendas` — exist ✅
- `marcas.profile_id` — ✅ renamed from `owner_id` (migration `20260629000001_rename_marcas_owner_id_to_profile_id.sql` applied)
- Brand subscription / plan table — does not exist ❌
- Brand metrics aggregation — does not exist ❌
- `brand_points` for loyalty system — does not exist ❌ (see pending-features.md)

---

## Pending

### DB
- [x] Rename `marcas.owner_id` to `marcas.profile_id` — ✅ applied; RLS and API routes updated
- [x] Update RLS on `marcas` and `prendas` to use `profile_id` — ✅ applied
- [ ] Brand subscription / plan table — fields: `brand_id`, `plan_type`, `billing_cycle`, `status`, `started_at`

### Backend / API
- [ ] Brand application submission endpoint — `POST /api/brand-applications`; saves form data (brand name, IG handle, category, email, password hash or encrypted credential) to `brand_applications`; does NOT create Supabase Auth user yet
- [ ] Brand account creation on approval — called from `opa-admin` approve action; uses `supabase.auth.admin.createUser()` with stored credentials; creates `perfiles` row with `is_brand = true`; creates `marcas` row with `profile_id` = new profile id
- [ ] Gate brand management API routes by `perfiles.is_brand = true` in addition to auth check

### Frontend (opa-mobile)
- [ ] Settings → "Registrar Marca" button — visible only on personal accounts (`is_brand = false`)
- [ ] Brand registration form — fields: brand name, category, IG handle, email, password (for the future brand account); submits to `POST /api/brand-applications`
- [ ] Multi-account switcher — UI to alternate between logged-in accounts (personal + brand), similar to Instagram/TikTok account switching
- [x] Brand profile screen — ✅ implemented (2026-07-06): `app/marca/[id].tsx`, standalone route (fuera del Tabs navigator, navbar calcada como en `app/user/[id].tsx`). Layout distinto al de usuario: banner + avatar-logo circular que lo pisa, nombre en mayúscula + badge `verificado_ondas.png` (solo si `marcas.verified`), `@handle · Marca`, bio, tags, stats **Seguidores / Outfits / Prendas** (sin "Seguidos"), botón Seguir full-width, y dos tabs icon-only (Grid `GridFinal` / Catálogo `bag`). Hook nuevo `useBrand(marcaId)` carga marca + prendas + (si hay `profile_id`) outfits y followers. Entry points enganchados: slider "Marcas" del home (`app/(tabs)/index.tsx`) y la fila de marca en `app/product/[id].tsx`. **Limitación real:** como todas las `marcas` tienen `profile_id = null` (no existe onboarding de cuentas de marca todavía), la grilla de Outfits y el contador de Seguidores quedan vacíos y el botón Seguir es inerte para las marcas actuales — se activan solos cuando una marca tenga `profile_id`. El catálogo (prendas por `brand_id`) sí muestra datos reales.
- [x] Catalog tab on brand profile — ✅ implemented (2026-07-06): grid 3-col de `prendas` filtradas por `brand_id`, tap → `product/[id]`. Parte de `app/marca/[id].tsx`.
- [x] "Ya lo tenés" banner logic — ✅ implemented (2026-07-06): en `app/marca/[id].tsx` cruza `useWardrobe(session.user.id)` con `garment.brand_id === marcaId`; muestra "Tenés X prendas de MARCA en tu armario" solo si el usuario logueado tiene prendas de esa marca. Tap navega a `/(tabs)/wardrobe` (el filtro del armario por marca todavía no existe — ver abajo).
- [ ] Wardrobe filtrado por marca — el banner "Ya lo tenés" hoy abre el armario sin filtro; falta que `app/(tabs)/wardrobe.tsx` acepte un param de marca y filtre
- [ ] Brand management panel screens — garment upload/edit, outfit publishing, metrics dashboard, order management
- [ ] Size selector shows unavailable sizes greyed out based on `stock_por_talle`

### opa-admin
- [ ] Brand application review screen — shows pending applications with all submitted fields including email; approve creates the account, reject sends reason

### Product / Business
- [ ] Two-level verification flow — OPA admin sets `marcas.verified = true` after additional review (CUIT, social media, track record)
- [ ] Brand follow system — decide if `follows` table is reused (`following_id = profile_id`) or a new `brand_follows` table is created
- [ ] Monetization: define commission % and subscription plan tiers
