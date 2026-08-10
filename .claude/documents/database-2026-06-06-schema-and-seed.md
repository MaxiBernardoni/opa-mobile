# Database — Schema & Seed Data

_Última actualización: 2026-07-13_

## Proyecto Supabase
- **Project ID:** `vecnktrbjolahcalkbml`
- **URL:** `https://vecnktrbjolahcalkbml.supabase.co`

---

## Migraciones aplicadas

> **Corregido 2026-08-03:** esta tabla tenía versiones inventadas/aproximadas (no las reales) desde su creación — se reemplazaron todas por las que devuelve `list_migrations` contra la DB real. Si vas a buscar una migración por versión (ej. para `supabase migration repair` o para diffear contra los archivos locales en `opa-backend/supabase/migrations/`), usá esta tabla, no los nombres de archivo locales — ya vimos al menos un caso (`rename_marcas_owner_id_to_profile_id`) donde el archivo local tiene un prefijo de fecha distinto al que quedó aplicado en la DB.

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
| 20260608111420 | create_delete_user_function |
| 20260609135539 | likes_saves_follows_rls_and_triggers |
| 20260609140121 | unique_constraints_likes_and_saves |
| 20260609151300 | size_guide_system |
| 20260609153111 | size_guide_calzado_extras |
| 20260622115551 | add_admin_columns_to_perfiles |
| 20260622145756 | add_verified_to_marcas |
| 20260626142434 | admin_and_status_columns_on_perfiles |
| 20260626142440 | sale_mode_and_external_url_on_prendas |
| 20260626142443 | create_brand_applications |
| 20260629142025 | rename_marcas_owner_id_to_profile_id |
| 20260701150747 | rls_policies_cart_orders_reviews_wardrobe |
| 20260803115219 | admin_impersonation_log |
| 20260803120322 | add_foot_length_to_user_measurements |
| 20260807141330 | add_size_color_source_to_prendas_armario |
| 20260810110614 | add_full_text_search_outfits_prendas |

> **`admin_impersonation_log` (2026-08-03) — ya identificada (2026-08-03), no es un misterio.** Tabla de auditoría (`id`, `admin_profile_id`, `brand_id`, `brand_profile_id`, `created_at`) del feature "login como marca sin password" de `opa-admin` (ver nota completa en `CLAUDE.md` → "Login como marca sin password"). RLS habilitado sin policies públicas — solo accesible vía `service_role`, por diseño (es un log de auditoría, no algo que la app deba leer).

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
| is_admin | bool | default false — gate para opa-admin |
| status | text | default 'active' — CHECK: 'active' \| 'suspended' \| 'banned' |
| created_at | timestamp | default now() |

**Trigger:** `handle_new_user()` — al insertar en `auth.users`, extrae `username` y `display_name` de `raw_user_meta_data` y crea el perfil automáticamente.

**RLS:** habilitado. Policies auditadas en migración `perfiles_auth_rls_policies`.

**Usuarios seed (3 filas):**

| Username | Nombre | Estado |
|---|---|---|
| `@vale.rios` | Valentina Ríos | ✅ Completo |
| `@mateo.h` | Mateo Herrera | ✅ Completo |
| `@chechuabb` | Celina Abelson | ⏳ Pendiente |

**Cuenta de marca (2026-07-13):** además de los 3 usuarios seed de arriba, existe un 4to `auth.users`/`perfiles` para la cuenta de marca de prueba `reves@opa.com` (`is_brand = true`), creada a mano vía SQL (no vino de una migración) y vinculada a `marcas.profile_id` de Revés. Credenciales de prueba: `reves@opa.com` / `reves1234`. Ver `product-2026-06-10-brand-system.md` para el detalle del atajo de onboarding.

---

### `marcas`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| name | varchar | |
| description | text | nullable |
| logo_url | text | nullable |
| profile_id | uuid | FK → perfiles.id, nullable |
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

> **`profile_id` (2026-07-13):** Revés es la única marca con `profile_id` seteado (apunta a la cuenta de marca `reves@opa.com` creada a mano, ver tabla de usuarios seed arriba) — su grilla de Outfits y Seguidores están "vivos" en `app/marca/[id].tsx` aunque lean 0 (no tiene outfits ni followers seed). Las otras 6 marcas siguen con `profile_id = NULL`.

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
| sale_mode | text | default 'direct' — CHECK: 'direct' \| 'redirect' |
| external_url | text | nullable — URL externa si sale_mode = 'redirect' |
| search_vector | tsvector | nullable — full-text search (2026-08-10), ver nota abajo |
| created_at | timestamp | default now() |

**Columnas eliminadas:** `talle` (redundante con `available_sizes` y `stock_por_talle`).

**`search_vector` (2026-08-10):** indexa `name + description + nombre de marca` (config `'spanish'`), con índice GIN. A diferencia de `outfits.search_vector`, **no** es una columna `GENERATED` porque el nombre de marca vive en otra tabla (`marcas`) — es mantenida por dos triggers: `prendas_search_vector_trigger` (recalcula al crear/editar una prenda) y `marcas_search_vector_sync_trigger` (recalcula las prendas de una marca cuando se le cambia el `name`). Consultada en `app/(tabs)/search.tsx` vía `.textSearch('search_vector', query, { type: 'websearch', config: 'spanish' })` — reemplazó el `.ilike('name', ...)` anterior, que no encontraba nada al buscar por marca o por texto de la descripción.

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
| search_vector | tsvector | `GENERATED ALWAYS AS (...) STORED` — full-text de `title + description` (2026-08-10), índice GIN |
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

**Creada:** manualmente vía MCP Supabase. Migration file: `opa-backend/supabase/migrations/20260609160000_create_prendas_guardadas.sql` (documentación — no re-ejecutar en producción).

---

### `prendas_armario`
Armario personal del usuario.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | FK → perfiles.id, nullable |
| garment_id | uuid | FK → prendas.id, nullable |
| added_at | timestamp | default now() |
| size | varchar | nullable, sin formato fijo (no hay check constraint) |
| color | varchar | nullable |
| source | varchar | nullable, sin formato fijo — pensado como `'purchase'`/`'manual'` pero no forzado por constraint |

> **Restauradas 2026-08-07:** `size`/`color`/`source` habían sido eliminadas en el diseño original por falta de flujo de compra que las consumiera (ver nota histórica más abajo). Se restauraron a pedido del usuario aunque el flujo de compra todavía no existe — la tabla sigue con 0 filas (nadie las llena todavía), así que no hubo backfill. Migración: `20260807141330_add_size_color_source_to_prendas_armario` (`opa-backend/supabase/migrations/`). Reflejado en `types/index.ts` (`WardrobeItem`).

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

### `brand_applications`
Solicitudes de usuarios para convertirse en dueños de marca en OPA. Revisadas y aprobadas/rechazadas por admins.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| applicant_id | uuid | FK → perfiles.id ON DELETE CASCADE |
| brand_name | varchar | |
| instagram_handle | varchar | nullable |
| category | varchar | nullable |
| status | text | default 'pending' — CHECK: 'pending' \| 'approved' \| 'rejected' |
| rejection_reason | text | nullable |
| reviewed_by | uuid | FK → perfiles.id ON DELETE SET NULL, nullable |
| reviewed_at | timestamptz | nullable |
| created_at | timestamptz | default now() |

**RLS:** habilitado.
- SELECT: solicitante ve su propia fila; admins (`is_admin = true`) ven todas.
- INSERT: solicitante crea su propia fila.
- UPDATE: solo admins (para aprobar/rechazar).

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
| name | varchar | 'Oversize', 'Boxy', 'Relaxed', 'Baggy', 'Straight', 'Skinny', 'Calzado Regular', 'Calzado Ancho', 'Cinturón', 'Bolso' |
| category | varchar | 'tops' \| 'bottoms' \| 'calzado' \| 'extras' |
| fit_type | varchar | 'oversize' \| 'boxy' \| 'relaxed' \| 'baggy' \| 'straight' \| 'skinny' \| 'regular' \| 'wide' \| 'belt' \| 'bag' |
| brand_id | uuid | FK → marcas.id, nullable — NULL = guía OPA por defecto |
| created_at | timestamp | default now() |

**RLS:** SELECT público. INSERT/UPDATE solo para brand owner (`marcas.profile_id = auth.uid()`). `service_role` bypasses.

**Seed data:** 10 guías OPA por defecto (`brand_id = NULL`):
- Tops: Oversize, Boxy, Relaxed
- Bottoms: Baggy, Straight, Skinny
- Calzado: Calzado Regular (EU 35–42), Calzado Ancho (EU 35–42)
- Extras: Cinturón (XS–XL por cintura), Bolso (XS–XL descriptivo)

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
| foot_length_min/max | numeric | nullable — largo de pie cm (calzado) |
| sort_order | int | 0=XS … 5=XXL (o número EU para calzado) |

**RLS:** SELECT público. INSERT solo `service_role`.

**Seed data:** 57 entries total:
- 36 entries originales (6 por guía de tops/bottoms)
- 8 entries × 2 guías de calzado (EU 35–42)
- 5 entries × 2 guías de extras (Cinturón y Bolso)

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
| foot_length | numeric | nullable — largo de pie cm (agregado 2026-08-03, migración `add_foot_length_to_user_measurements`) |
| updated_at | timestamp | default now() |

**RLS:** habilitado — SELECT/INSERT/UPDATE/DELETE solo propio (`user_id = auth.uid()`). Una fila por usuario (UNIQUE en `user_id`).

---

### Función `get_recommended_size(guide_id uuid, p_user_id uuid)`

Devuelve `TABLE(size_label varchar, fit_preference varchar)`.

- Busca las medidas del usuario en `user_measurements`
- Por categoría:
  - `tops`: match por pecho (chest), fit_preference ajustado/holgado/justo
  - `bottoms`: match por cintura (waist), fit_preference ajustado/holgado/justo
  - `calzado`: match por `foot_length` real si el usuario la cargó; si no, sigue usando `height` como proxy (`coalesce(u.foot_length, u.height)`, actualizado 2026-08-03), siempre devuelve `'justo'`
  - `extras`: match por cintura si tiene `waist_min` (Cinturón), sin match si no (Bolso devuelve vacío), siempre `'justo'`
- Devuelve vacío si el usuario no tiene medidas cargadas
- `SECURITY DEFINER` — `GRANT EXECUTE TO authenticated`

---

## Pendientes

> All pending database items are tracked in `meta-2026-06-10-pending-features.md`. Do not add new pending items here.
