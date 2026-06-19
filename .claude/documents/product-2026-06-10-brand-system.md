# Product — Brand System

This document defines the brand model in OPA: what a brand is, how it enters the platform, what it can do, how its public profile looks, and how OPA monetizes the relationship. It covers decisions made across DB, backend, frontend, and design.

---

## What a Brand Is in OPA

A brand is a fashion label (real or emerging) that publishes garments and outfits on OPA. Brands are distinct from regular users — they have a dedicated profile layout, a product catalog, and access to a management panel.

**Key principle:** brands are content creators first. They publish outfits (looks built from their own garments) that appear in the general feed. The catalog and purchase flow come second.

A brand is NOT a separate account type — it is a regular user (`perfiles`) who has been approved as a brand owner and linked to a `marcas` row via `marcas.owner_id`.

---

## Brand Onboarding

1. A person registers a normal OPA account
2. They submit a brand application (form with brand name, category, IG handle, etc.)
3. OPA reviews and approves or rejects the application
4. On approval: OPA creates the `marcas` row and sets `marcas.owner_id = user.id`
5. The user's `perfiles.is_brand` is set to `true`

**The brand application flow (screen + backend) is not yet implemented.**

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
- Writes to `follows` table with `following_id = marca.owner_id` (current implementation) or a future `brand_follows` table

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
- `marcas.owner_id` — field exists ✅
- `perfiles.is_brand` — field exists ✅
- `stock_por_talle jsonb` on `prendas` — field exists ✅
- `size_guides.brand_id` — field exists, RLS allows brand owner to insert ✅
- Brand application table — does not exist ❌
- Sale mode per garment (`sale_mode varchar`, `external_url text` on `prendas`) — does not exist ❌
- Brand subscription / plan table — does not exist ❌
- Brand metrics aggregation — does not exist ❌
- `brand_points` for loyalty system — does not exist ❌ (see pending-features.md)

---

## Pending

- [ ] Brand application screen and flow — form + OPA approval step; creates `marcas` row and sets `is_brand = true`
- [ ] Brand profile screen — layout distinct from user profile: banner, contextual "ya lo tenés" strip, stats row, catalog tab
- [ ] Catalog tab on brand profile — grid of `prendas` filtered by `brand_id`; tapping goes to `product/[id]`
- [ ] "Ya lo tenés" banner logic — cross `prendas_armario` with `outfit_items` / `prendas.brand_id` for the viewed brand
- [ ] Brand management panel screens — garment upload/edit, outfit publishing, metrics dashboard, order management
- [ ] Add `sale_mode varchar` and `external_url text` to `prendas` — needed for hybrid sales model
- [ ] Brand application DB table — fields: applicant user_id, brand name, IG handle, category, status (pending/approved/rejected), reviewed_at
- [ ] Brand subscription / plan table — fields: brand_id, plan_type, billing_cycle, status, started_at
- [ ] Size selector shows unavailable sizes greyed out based on `stock_por_talle`
- [ ] Two-level verification flow — OPA admin sets `marcas.verified = true` after additional review
- [ ] Brand follow system — decide if `follows` table is reused (following_id = owner_id) or a new `brand_follows` table is created
- [ ] Monetization: define commission % and subscription plan tiers
