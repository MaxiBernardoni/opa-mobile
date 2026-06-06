# Database — Schema & Seed Data

## Proyecto Supabase
- **Project ID:** `vecnktrbjolahcalkbml`
- **URL:** `https://vecnktrbjolahcalkbml.supabase.co`

---

## Tablas

### `perfiles`
Extiende `auth.users`. Se crea automáticamente via trigger al registrarse.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| username | text | único, lowercase |
| display_name | text | nullable |
| bio | text | nullable |
| avatar_url | text | nullable |
| tags | text[] | estilo personal |
| followers_count | int | default 0 |
| following_count | int | default 0 |
| outfits_count | int | default 0 |
| is_brand | bool | default false |
| created_at | timestamptz | |

**Trigger:** `handle_new_user()` — al insertar en `auth.users`, extrae `username` y `display_name` de `raw_user_meta_data` y crea el perfil automáticamente.

---

### `marcas`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| description | text | nullable |
| logo_url | text | nullable |
| owner_id | uuid | FK → perfiles.id, nullable |
| instagram_handle | text | nullable |
| website | text | nullable |
| location | text | nullable (múltiples locales separados por /) |
| tags | text[] | |
| created_at | timestamptz | |

**Seed data actual:**

| Nombre | Logo | IG | Sitio | Ubicación |
|---|---|---|---|---|
| Midway | `avatars/brands/midway_avatar.png` | midway.ar | midway.com.ar | Argerich 448 |
| Doble V | `avatars/brands/doblev_avatar.png` | doblev.oficial | ladoblev.mitiendanube.com | Bogotá 3156 |
| Batuk | `avatars/brands/batuk_avatar.jfif` | batukba | batuk.com.ar | Av Santa Fe 2074 / Av. Cabildo 1939 / Av. Avellaneda 2980 |
| Pull&Bear | — picsum placeholder — | | | |
| Stradivarius | — picsum placeholder — | | | |

Los logos reales están en el bucket `avatars` (público). URL base:
`https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/avatars/`

---

### `prendas`
| Columna | Tipo | Notas |
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
| Columna | Tipo | Notas |
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
Relaciona outfits con prendas (con posición para labels flotantes).

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| outfit_id | uuid | FK → outfits.id |
| garment_id | uuid | FK → prendas.id |
| position_x | numeric | posición X del label flotante (0-1) |
| position_y | numeric | posición Y del label flotante (0-1) |

---

### `outfit_likes`
| Columna | Tipo |
|---|---|
| user_id | uuid (FK → perfiles.id) |
| outfit_id | uuid (FK → outfits.id) |

---

### `outfit_saves`
| Columna | Tipo |
|---|---|
| user_id | uuid (FK → perfiles.id) |
| outfit_id | uuid (FK → outfits.id) |

---

### `prendas_armario`
Armario personal del usuario.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid | FK → perfiles.id |
| garment_id | uuid | FK → prendas.id |
| size | text | nullable |
| color | text | nullable |
| source | text | 'purchase' o 'manual' |

---

## Storage Buckets

| Bucket | Acceso | Contenido |
|---|---|---|
| `assets` | público | Iconos de navegación (`nav/`), logos, imágenes de la app |
| `avatars` | público | Avatares de marcas (`brands/`), avatares de usuarios |

**Paths de íconos de navegación:**
- `assets/nav/home.png` / `home_rosa.png`
- `assets/nav/outfit.png` / `outfit_rosa.png`
- `assets/nav/search.png` / `search_rosa.png`
- `assets/nav/armario.png` / `armario_rosa.png`
- `assets/nav/user.png` / `user_rosa.png`

---

## Auth

- Proveedor: Email/Password (Supabase Auth)
- Persistencia: `AsyncStorage` via `@supabase/supabase-js`
- Al registrarse se pueden pasar `username` y `display_name` en `options.data`
- El trigger `handle_new_user()` crea el perfil automáticamente

---

## Pendientes

- [ ] Subir imágenes de outfits y prendas reales al bucket `assets`
- [ ] Cargar seed data de outfits y prendas para Midway, Doble V y Batuk
- [ ] Completar info de Pull&Bear y Stradivarius o reemplazarlos
- [ ] Verificar RLS policies en todas las tablas
