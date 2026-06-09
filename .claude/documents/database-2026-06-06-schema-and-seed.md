# Database — Schema & Seed Data

_Última actualización: 2026-06-09_

## Proyecto Supabase
- **Project ID:** `vecnktrbjolahcalkbml`
- **URL:** `https://vecnktrbjolahcalkbml.supabase.co`

---

## Migraciones aplicadas

| Versión | Nombre |
|---|---|
| 20260515134052 | add_missing_columns_and_tables |
| 20260515141552 | rename_garments_to_prendas |
| 20260515141944 | rename_tables_to_spanish |
| 20260515142208 | rename_more_tables_to_spanish |
| 20260601111853 | add_public_read_policies |
| 20260601114335 | create_storage_bucket_assets |
| 20260601114442 | fix_storage_anon_upload_policy |
| 20260601114756 | perfiles_auth_rls_policies |
| 20260609xxxxxx | likes_saves_follows_rls_and_triggers |

---

## Tablas

### `perfiles`
Extiende `auth.users`. Se crea automáticamente via trigger al registrarse.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| username | varchar | único |
| display_name | varchar | nullable |
| bio | text | nullable |
| avatar_url | text | nullable |
| instagram_handle | varchar | nullable |
| tags | text[] | nullable — estilo personal |
| followers_count | int | default 0 |
| following_count | int | default 0 |
| outfits_count | int | default 0 |
| is_brand | bool | default false |
| created_at | timestamp | default now() |

**Trigger:** `handle_new_user()` — al insertar en `auth.users`, extrae `username` y `display_name` de `raw_user_meta_data` y crea el perfil automáticamente.

**RLS:** habilitado. Policies auditadas en migración `perfiles_auth_rls_policies`.

**Usuarios seed (3 filas):**

| Username | Nombre | Estado |
|---|---|---|
| `@vale.rios` | Valentina Ríos | ✅ Completo |
| `@mateo.h` | Mateo Herrera | ✅ Completo |
| `@chechuabb` | Celina Abelson | ⏳ Pendiente |

---

### `marcas`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| name | varchar | |
| description | text | nullable |
| logo_url | text | nullable |
| owner_id | uuid | FK → perfiles.id, nullable |
| instagram_handle | varchar | nullable |
| website | varchar | nullable |
| location | varchar | nullable (múltiples locales separados por /) |
| tags | text[] | nullable |
| created_at | timestamp | default now() |

**RLS:** habilitado.

**Seed data (7 marcas):**

| Nombre | Logo | IG | Sitio | Ubicación | Tipo |
|---|---|---|---|---|---|
| Midway | `avatars/brands/midway_avatar.png` | midway.ar | midway.com.ar | Argerich 448 | Real |
| Doble V | `avatars/brands/doblev_avatar.png` | doblev.oficial | ladoblev.mitiendanube.com | Bogotá 3156 | Real |
| Batuk | `avatars/brands/batuk_avatar.jfif` | batukba | batuk.com.ar | Av Santa Fe 2074 / Av. Cabildo 1939 / Av. Avellaneda 2980 | Real |
| Forma | `avatars/brands/forma_avatar.png` | — | — | — | Ficción |
| Revés | `avatars/brands/reves_avatar.png` | — | — | — | Ficción |
| Capas | `avatars/brands/capas_avatar.png` | — | — | — | Ficción |
| Sole | `avatars/brands/sole_avatar.png` | — | — | — | Ficción |

> Pull&Bear y Stradivarius fueron reemplazados por marcas ficticias propias. Ónix fue creada y eliminada (joyería pasó a ser referencia visual únicamente).

Los logos reales están en el bucket `avatars` (público). URL base:
`https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/avatars/`

---

### `prendas`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| brand_id | uuid | FK → marcas.id |
| name | varchar | |
| description | text | nullable |
| price | numeric | |
| image_url | text | |
| category | varchar | nullable — torso/piernas/calzado/extras |
| color | varchar | |
| style | varchar | nullable |
| available_sizes | text[] | nullable |
| stock_por_talle | jsonb | nullable — `{"XS": 10, "S": 10, "M": 10, ...}` |
| created_at | timestamp | default now() |

**Columnas eliminadas:** `talle` (redundante con `available_sizes` y `stock_por_talle`).

**RLS:** habilitado.

**Seed data:** 25 prendas. Las 5 prendas legacy con `style: null` fueron eliminadas.

**Convención de imágenes:** `prendas/{marca}/{prenda}_{marca}_{coleccion}.png`
Ejemplo: `prendas/forma/remera_forma_verano25.png`

---

### `outfits`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| creator_id | uuid | FK → perfiles.id, nullable |
| title | varchar | nullable |
| description | text | nullable |
| cover_image_url | text | nullable |
| occasion | varchar | nullable |
| style | varchar | nullable |
| likes_count | int | default 0 — mantenido por trigger `on_outfit_like` |
| saves_count | int | default 0 — mantenido por trigger `on_outfit_save` |
| created_at | timestamp | default now() |

**RLS:** habilitado.

**Seed data (12 outfits):**

*Valentina `@vale.rios` (4 outfits):*
- Minimal Everyday — *clásico pero tuyo*
- Street — *todo negro, nada aburrido*
- Elevated — *noche sin esfuerzo*
- Transitional — *otoño en Palermo*

*Mateo `@mateo.h` (3 outfits):*
- *capas y punto*
- *todo gris*
- *negro de noche*

**Convención de imágenes:** `outfits/users/{username}/outfit_{username}_{nombre}.png`
Ejemplo: `outfits/users/vale.rios/outfit_vale.rios_minimal-everyday.png`

---

### `outfit_items`
Relaciona outfits con prendas. Los labels flotantes se posicionan por slot lógico (no coordenadas flotantes).

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| outfit_id | uuid | FK → outfits.id, nullable |
| garment_id | uuid | FK → prendas.id, nullable |
| slot | varchar | nullable — torso/piernas/calzado/extras |

> **Cambio respecto al diseño original:** `position_x` y `position_y` (coordenadas 0-1) fueron reemplazados por `slot` categórico. Si se necesita posicionamiento preciso de labels flotantes en el futuro, agregar `position_x numeric` y `position_y numeric`.

**RLS:** habilitado.

**Seed data:** 25 outfit_items.

---

### `outfits_guardados`
Reemplaza el nombre original `outfit_saves`.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → perfiles.id, nullable |
| outfit_id | uuid | FK → outfits.id, nullable |
| created_at | timestamp | default now() |

**RLS:** habilitado — SELECT público, INSERT/DELETE solo propio (`user_id = auth.uid()`).

**Trigger:** `on_outfit_save` → llama `handle_outfit_save()` → actualiza `outfits.saves_count` ±1.

---

### `outfit_likes`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → perfiles.id, nullable |
| outfit_id | uuid | FK → outfits.id, nullable |
| created_at | timestamp | default now() |

**RLS:** habilitado — SELECT público, INSERT/DELETE solo propio (`user_id = auth.uid()`).

**Trigger:** `on_outfit_like` → llama `handle_outfit_like()` → actualiza `outfits.likes_count` ±1.

---

### `follows`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| follower_id | uuid | FK → perfiles.id, nullable |
| following_id | uuid | FK → perfiles.id, nullable |
| created_at | timestamp | default now() |

**Constraints:** UNIQUE `(follower_id, following_id)` — no se puede seguir dos veces al mismo usuario.

**RLS:** habilitado — SELECT público, INSERT solo propio (`follower_id = auth.uid()`), DELETE solo propio.

**Trigger:** `on_follow` → llama `handle_follow()` → actualiza `perfiles.following_count` en el follower y `perfiles.followers_count` en el following, ±1.

---

### `prendas_armario`
Armario personal del usuario.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → perfiles.id, nullable |
| garment_id | uuid | FK → prendas.id, nullable |
| added_at | timestamp | default now() |

> **Columnas eliminadas vs. diseño original:** `size`, `color`, `source` ('purchase'/'manual') — simplificadas en esta iteración. Agregar cuando se implemente el flujo de compra.

**RLS:** habilitado.

---

### `productos_carrito`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → perfiles.id, nullable |
| garment_id | uuid | FK → prendas.id, nullable |
| quantity | int | default 1 |
| size | varchar | nullable |
| added_at | timestamp | default now() |

**RLS:** habilitado.

---

### `orders`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → perfiles.id, nullable |
| status | varchar | default 'pending' |
| total | numeric | |
| discount | numeric | default 0, nullable |
| shipping_address | text | nullable |
| tracking_code | varchar | nullable |
| estimated_delivery | date | nullable |
| created_at | timestamp | default now() |
| updated_at | timestamp | default now() |

**RLS:** habilitado.

---

### `productos_orden`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| order_id | uuid | FK → orders.id, nullable |
| garment_id | uuid | FK → prendas.id, nullable |
| quantity | int | default 1 |
| size | varchar | nullable |
| unit_price | numeric | |

**RLS:** habilitado.

---

### `reseñas`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → perfiles.id, nullable |
| order_id | uuid | FK → orders.id, nullable |
| garment_id | uuid | FK → prendas.id, nullable |
| rating | int | CHECK 1–5, nullable |
| comment | text | nullable |
| created_at | timestamp | default now() |

**RLS:** habilitado.

---

## Storage Buckets

| Bucket | Acceso | Contenido |
|---|---|---|
| `assets` | público | Iconos de navegación (`nav/`), imágenes de outfits (`outfits/`) e imágenes de prendas (`prendas/`) |
| `avatars` | público | Avatares de marcas (`brands/`), avatares de usuarios (`users/`) |

### Convenciones de naming

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Imagen de prenda | `prendas/{marca}/{prenda}_{marca}_{coleccion}.png` | `prendas/forma/remera_forma_verano25.png` |
| Imagen de outfit | `outfits/users/{username}/outfit_{username}_{nombre}.png` | `outfits/users/vale.rios/outfit_vale.rios_minimal-everyday.png` |
| Avatar de usuario | `avatars/users/{username}_avatar.png` | `avatars/users/vale.rios_avatar.png` |
| Logo de marca | `avatars/brands/{marca}_avatar.png` | `avatars/brands/forma_avatar.png` |
| Ícono de nav | `assets/nav/{nombre}.png` / `{nombre}_rosa.png` | `assets/nav/home.png` |

URL base pública: `https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/`

---

## Auth

- Proveedor: Email/Password (Supabase Auth)
- Persistencia: `AsyncStorage` via `@supabase/supabase-js`
- Al registrarse se pasan `username` y `display_name` en `options.data`
- El trigger `handle_new_user()` crea el perfil automáticamente

---

## Pendientes

- [ ] Completar perfil y outfits de `@chechuabb` (Celina Abelson)
- [ ] Subir imágenes reales de outfits y prendas al bucket `assets`
- [x] RLS policies en `outfit_likes`, `outfits_guardados`, `follows` — completas
- [ ] Auditar RLS policies en tablas nuevas (`productos_carrito`, `orders`, `productos_orden`, `reseñas`)
- [ ] Agregar `position_x` / `position_y` a `outfit_items` si se implementan labels flotantes precisos
- [ ] Restaurar `size`, `color`, `source` en `prendas_armario` cuando se implemente flujo de compra
- [ ] Edge Functions para lógica de likes/saves (incrementar contadores atómicamente)
- [ ] Completar info de marcas ficticias (Forma, Revés, Capas, Sole) con datos de contacto
