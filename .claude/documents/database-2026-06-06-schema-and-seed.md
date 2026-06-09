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
| 20260609000001 | likes_saves_follows_rls_and_triggers |
| 20260609000002 | unique_constraints_likes_and_saves |
| 20260609000003 | size_guide_system |

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
| size_guide_id | uuid | FK → size_guides.id, nullable |
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

**Constraints:** UNIQUE `(user_id, outfit_id)` — un usuario no puede guardar el mismo outfit dos veces.

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

**Constraints:** UNIQUE `(user_id, outfit_id)` — un usuario no puede likear el mismo outfit dos veces.

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

### `prendas_guardadas`
Prendas guardadas en favoritos para comprar más tarde.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → auth.users(id) ON DELETE CASCADE |
| garment_id | uuid | FK → prendas(id) ON DELETE CASCADE |
| created_at | timestamptz | default now() |

**Constraints:** UNIQUE `(user_id, garment_id)`.

**RLS:** habilitado — SELECT/INSERT/DELETE solo propio (`user_id = auth.uid()`).

**Creada:** manualmente vía MCP Supabase (no tiene migration file aún).

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

## Sistema de guías de talle

### `size_guides`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| name | varchar | 'Oversize', 'Boxy', 'Relaxed', 'Baggy', 'Straight', 'Skinny' |
| category | varchar | 'tops' \| 'bottoms' |
| fit_type | varchar | 'oversize' \| 'boxy' \| 'relaxed' \| 'baggy' \| 'straight' \| 'skinny' |
| brand_id | uuid | FK → marcas.id, nullable — NULL = guía OPA por defecto |
| created_at | timestamp | default now() |

**RLS:** SELECT público. INSERT/UPDATE solo para brand owner (`marcas.owner_id = auth.uid()`). `service_role` bypasses.

**Seed data:** 6 guías OPA por defecto (`brand_id = NULL`): Oversize, Boxy, Relaxed (tops) + Baggy, Straight, Skinny (bottoms).

---

### `size_guide_entries`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| guide_id | uuid | FK → size_guides.id ON DELETE CASCADE |
| size_label | varchar | 'XS' \| 'S' \| 'M' \| 'L' \| 'XL' \| 'XXL' |
| chest_min/max | numeric | nullable — busto cm (tops) |
| waist_min/max | numeric | nullable — cintura cm |
| hip_min/max | numeric | nullable — cadera cm |
| height_min/max | numeric | nullable — altura cm |
| thigh_min/max | numeric | nullable — muslo cm (bottoms) |
| rise_min/max | numeric | nullable — tiro cm (bottoms) |
| sort_order | int | 0=XS … 5=XXL |

**RLS:** SELECT público. INSERT solo `service_role`.

**Seed data:** 36 entries (6 por guía).

---

### `user_measurements`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | UNIQUE FK → perfiles.id ON DELETE CASCADE |
| chest | numeric | nullable — busto cm |
| waist | numeric | nullable — cintura cm |
| hip | numeric | nullable — cadera cm |
| height | numeric | nullable — altura cm |
| thigh | numeric | nullable — muslo cm |
| updated_at | timestamp | default now() |

**RLS:** habilitado — SELECT/INSERT/UPDATE/DELETE solo propio (`user_id = auth.uid()`). Una fila por usuario (UNIQUE en `user_id`).

---

### Función `get_recommended_size(guide_id uuid, p_user_id uuid)`

Devuelve `TABLE(size_label varchar, fit_preference varchar)`.

- Busca las medidas del usuario en `user_measurements`
- Encuentra la entry donde el pecho (tops) o cintura (bottoms) del usuario cae en el rango
- Calcula `fit_preference`: `'ajustado'` si está cerca del máximo, `'holgado'` si está cerca del mínimo, `'justo'` en el medio
- Devuelve vacío si el usuario no tiene medidas cargadas
- `SECURITY DEFINER` — `GRANT EXECUTE TO authenticated`

---

## Pendientes

- [ ] Completar perfil y outfits de `@chechuabb` (Celina Abelson)
- [ ] Subir imágenes reales de outfits y prendas al bucket `assets`
- [x] RLS policies en `outfit_likes`, `outfits_guardados`, `follows` — completas
- [ ] Auditar RLS policies en tablas nuevas (`productos_carrito`, `orders`, `productos_orden`, `reseñas`)
- [ ] Agregar `position_x` / `position_y` a `outfit_items` si se implementan labels flotantes precisos
- [ ] Restaurar `size`, `color`, `source` en `prendas_armario` cuando se implemente flujo de compra
- [ ] Crear migration file para `prendas_guardadas` (actualmente solo existe en DB remota, sin archivo de migración)
- [x] Edge Functions para likes/saves — reemplazadas por triggers atómicos
- [ ] Completar info de marcas ficticias (Forma, Revés, Capas, Sole) con datos de contacto
- [ ] Asignar `size_guide_id` a las 25 prendas seed existentes
