# Database — Schema & Seed Data

This document covers the Supabase database schema, seed data, storage buckets, and auth trigger for the OPA project.

---

## Supabase Project

- **Project ID:** `vecnktrbjolahcalkbml`
- **URL:** `https://vecnktrbjolahcalkbml.supabase.co`

---

## Tables

### `perfiles`
Extends `auth.users`. Created automatically via trigger on registration.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| username | text | unique, lowercase |
| display_name | text | nullable |
| bio | text | nullable |
| avatar_url | text | nullable |
| tags | text[] | personal style tags |
| followers_count | int | default 0 |
| following_count | int | default 0 |
| outfits_count | int | default 0 |
| is_brand | bool | default false |
| created_at | timestamptz | |

**Trigger:** `handle_new_user()` — on insert into `auth.users`, extracts `username` and `display_name` from `raw_user_meta_data` and creates the profile automatically.

---

### `marcas`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| description | text | nullable |
| logo_url | text | nullable |
| owner_id | uuid | FK → perfiles.id, nullable |
| instagram_handle | text | nullable |
| website | text | nullable |
| location | text | nullable (multiple locations separated by /) |
| tags | text[] | |
| created_at | timestamptz | |

**Current seed data:**

| Name | Logo | IG | Site | Location |
|---|---|---|---|---|
| Midway | `avatars/brands/midway_avatar.png` | midway.ar | midway.com.ar | Argerich 448 |
| Doble V | `avatars/brands/doblev_avatar.png` | doblev.oficial | ladoblev.mitiendanube.com | Bogotá 3156 |
| Batuk | `avatars/brands/batuk_avatar.jfif` | batukba | batuk.com.ar | Av Santa Fe 2074 / Av. Cabildo 1939 / Av. Avellaneda 2980 |
| Pull&Bear | — picsum placeholder — | | | |
| Stradivarius | — picsum placeholder — | | | |

Real logos are in the `avatars` bucket (public). Base URL:
`https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/avatars/`

---

### `prendas`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| brand_id | uuid | FK → marcas.id |
| name | text | |
| price | numeric | |
| category | text | nullable (torso/piernas/calzado/extras) |
| image_url | text | nullable |
| color | text | nullable |
| available_sizes | text[] | |
| created_at | timestamptz | |

---

### `outfits`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| creator_id | uuid | FK → perfiles.id, nullable |
| title | text | nullable |
| cover_image_url | text | nullable |
| occasion | text | nullable |
| style | text | nullable |
| likes_count | int | default 0 |
| created_at | timestamptz | |

---

### `outfit_items`
Links outfits to garments, with position for floating labels.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| outfit_id | uuid | FK → outfits.id |
| garment_id | uuid | FK → prendas.id |
| position_x | numeric | X position of floating label (0–1) |
| position_y | numeric | Y position of floating label (0–1) |

---

### `outfit_likes`
| Column | Type |
|---|---|
| user_id | uuid (FK → perfiles.id) |
| outfit_id | uuid (FK → outfits.id) |

---

### `outfit_saves`
| Column | Type |
|---|---|
| user_id | uuid (FK → perfiles.id) |
| outfit_id | uuid (FK → outfits.id) |

---

### `prendas_armario`
User's personal wardrobe.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid | FK → perfiles.id |
| garment_id | uuid | FK → prendas.id |
| size | text | nullable |
| color | text | nullable |
| source | text | 'purchase' or 'manual' |

---

## Storage Buckets

| Bucket | Access | Contents |
|---|---|---|
| `assets` | public | Navigation icons (`nav/`), logos, app images |
| `avatars` | public | Brand avatars (`brands/`), user avatars |

**Navigation icon paths:**
- `assets/nav/home.png` / `home_rosa.png`
- `assets/nav/outfit.png` / `outfit_rosa.png`
- `assets/nav/search.png` / `search_rosa.png`
- `assets/nav/armario.png` / `armario_rosa.png`
- `assets/nav/user.png` / `user_rosa.png`

---

## Auth

- Provider: Email/Password (Supabase Auth)
- Persistence: `AsyncStorage` via `@supabase/supabase-js`
- On sign up, `username` and `display_name` can be passed in `options.data`
- The `handle_new_user()` trigger creates the profile automatically

---

## Pending

- [ ] Upload real outfit and garment images to the `assets` bucket
- [ ] Load seed data for outfits and garments for Midway, Doble V, and Batuk
- [ ] Complete or replace Pull&Bear and Stradivarius entries
- [ ] Audit RLS policies on all tables
