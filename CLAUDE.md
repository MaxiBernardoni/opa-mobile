# CLAUDE.md

Este archivo es la **única fuente de contexto persistente** para cualquier sesión de Claude Code que se abra en este repo. La mayoría de las sesiones son locales y residuales (corren en compus de la escuela, que están freezadas — no queda historial ni memoria de una sesión a la otra). Esto significa que **este documento tiene que alcanzar por sí solo** para que una sesión nueva entienda el proyecto completo, sepa qué está hecho, qué falta, y cómo trabajar conmigo. No asumas que existe contexto previo fuera de lo que está escrito acá y en `.claude/documents/`.

---

## Cómo trabajar conmigo (instrucciones para la IA)

- **Hablame siempre en español.** El código y los comentarios en inglés están bien, pero la conversación conmigo es en español.
- **Explicá el por qué**, no solo el qué. Si tomás una decisión técnica no obvia, decí brevemente el motivo (no hace falta un ensayo, una línea alcanza).
- **Preguntame antes de actuar, no asumas, en estos casos puntuales:**
  - Cualquier decisión de producto o UX, aunque parezca chica (cambia cómo se ve o comporta la app para el usuario final)
  - Cuando hay ambigüedad técnica — más de una forma razonable de resolver algo y no es obvio cuál preferís
  - **Nunca asumas que algo de una sesión anterior ya se aplicó.** Las sesiones no comparten memoria entre sí — verificá siempre en el código actual antes de decir "esto ya está hecho" o de construir sobre un supuesto de un sync/handoff previo
- Fuera de esos casos, con ambigüedad baja o tareas mecánicas, podés avanzar sin preguntar.
- Soy estudiante (no tengo background profesional de ingeniería de software) — priorizá explicaciones claras sobre jerga, pero no me subestimes: entiendo código y decisiones técnicas si me las explicás.

---

## Cómo funciona el proyecto ahora (modelo de sesiones)

Hasta el 2026-07-01 OPA se desarrollaba con 4 chats especializados en la nube (Frontend+Backend, Design, Database, Documentation) que se coordinaban mediante `.claude/documents/` y un skill `/sync`. **Ese modelo quedó descontinuado** (ver `.claude/documents/_archive/meta-2026-06-07-chat-structure.md` para referencia histórica).

Modelo actual:
- **Sesiones locales**: cada apertura de Claude Code en la compu de la escuela es una sesión de un solo uso, sin separación de roles — la sesión hace de frontend, backend, y lo que haga falta dentro de este repo. Al cerrar, ese contexto se pierde.
- **Un chat en la nube** (este) se mantiene activo para pulir y coordinar cosas más grandes o que requieran contexto acumulado.
- Por eso: **todo cambio relevante tiene que quedar escrito en el repo** (código + `.claude/documents/` + este archivo) antes de terminar una sesión. Si no está escrito, no existe para la próxima sesión.

---

## ¿Qué es OPA?

App mobile de descubrimiento de moda centrada en **outfits** como unidad principal de contenido (TikTok/Pinterest para moda). Tres pilares: descubrimiento de outfits, armario personal, compra contextual.

El repo también contiene `backend/` — infraestructura Supabase + Edge Functions + Hono API compartida entre opa-mobile y opa-web. Ya fue extraída a `maxibernardoni/opa-backend`; `backend/` se mantiene acá hasta confirmar que el repo nuevo funciona de forma independiente.

### Qué NO es OPA (valores y decisiones descartadas)

- **No es un catálogo de e-commerce.** El outfit (contenido) va primero, la compra es contextual y viene después. Nunca se prioriza layout tipo tienda sobre layout tipo feed.
- **No es un feed genérico de moda.** Los pilares son descubrimiento + armario personal + compra — no se agregan features que no sirvan a alguno de los tres.
- **Las marcas no son "vendedores" pasivos** — son creadores de contenido primero (publican outfits armados con sus propias prendas). El catálogo y la venta son secundarios a eso. (Ver `.claude/documents/product-2026-06-10-brand-system.md`.)
- **Decisión descartada:** asignar talles de vendedor por defecto sin guía — se optó por el sistema de `size_guides` + `user_measurements` + recomendación automática en su lugar.
- **Decisión descartada:** un solo modo de venta uniforme — se optó por modelo híbrido (`direct` vs `redirect`) porque no todas las marcas quieren procesar pagos dentro de OPA.

---

## Mapa de repos

OPA vive en 4 repos separados. Si una tarea necesita tocar otro repo, decilo explícitamente — esta sesión probablemente no tiene ese repo clonado ni en su scope de acceso.

| Repo | Stack | Rol | Estado |
|---|---|---|---|
| `opa-mobile` (este repo) | React Native + Expo SDK 54 | App para usuarios finales (consumidores) | Activo, es el más avanzado |
| `opa-backend` (`maxibernardoni/opa-backend`) | Supabase + Edge Functions + Hono API | Infraestructura compartida entre opa-mobile y opa-web | Extraído de `backend/` en este repo; pendiente confirmar deploy 100% independiente |
| `opa-admin` (`maxibernardoni/opa-admin`) | Next.js 14 + shadcn/ui + Tailwind | Panel interno del equipo OPA (moderación, aprobar marcas, KPIs) — NO es para marcas ni usuarios finales | En desarrollo inicial |
| `opa-web` | Next.js (planeado) | Panel de gestión para marcas (analytics, stock, pedidos) — para uso desde desktop | No iniciado |

Todos comparten el mismo proyecto Supabase (`vecnktrbjolahcalkbml`) y el mismo schema en español.

---

## Comandos de desarrollo

```bash
# Mobile / Web
npx expo start --web --clear   # Web en browser — funciona en cualquier red
npx expo start --clear          # Expo Go en celular — misma WiFi, SDK 54

# IMPORTANTE: siempre usar --legacy-peer-deps en npm install
npm install --legacy-peer-deps

# API (Deno / Supabase Edge Functions)
cd backend/
supabase functions serve api    # Dev local
supabase functions deploy api   # Deploy a producción
```

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 (managed workflow) |
| Navegación | Expo Router v6 (file-based routing) |
| Estado global | Zustand (`store/useAuthStore.ts`) |
| Imágenes | Expo Image |
| Backend | Supabase (Project ID: `vecnktrbjolahcalkbml`) |
| API server | Hono v4 en Deno (Supabase Edge Functions) — `backend/functions/api/` |
| Lenguaje | TypeScript (mobile) / TypeScript en Deno (API) |

---

## Design tokens

```ts
// colors.ts
rosaOpa: '#EB006B'         // primario, acciones
negro: '#000000'
blanco: '#FFFFFF'
grisClaro: '#838383'       // texto secundario
grisBorde: '#F2F2F2'       // bordes
grisMedio: '#D9D9D9'       // placeholders
grisOscuro: '#4E4E4E'      // texto terciario
bordeTag: '#A6A6AC'

// fonts.ts — mergeOne (títulos), palanquinDark (botones, usernames)
// radius.ts — card:15, chip:10, button:8, tag:8, avatar:9999
// spacing.ts — xs:4, sm:8, md:12, lg:16, xl:24, xxl:32
```

Assets en Supabase Storage: `https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets/`
Los nombres de archivo son **case-sensitive**: `Grid.png` (G mayúscula), iconos de nav en subcarpeta `nav/`.

---

## Esquema de base de datos

Tablas y columnas en **español**:

```
perfiles        — extiende auth.users; trigger handle_new_user() crea fila al registrarse
marcas          — brands; profile_id FK → perfiles
prendas         — garments; brand_id FK → marcas; sale_mode ('direct'|'redirect'), external_url, size_guide_id
outfits         — creator_id FK → perfiles; likes_count/saves_count mantenidos por triggers
outfit_items    — outfit_id + garment_id + slot ('torso'|'piernas'|'calzado'|'extras')
outfit_likes    — UNIQUE(user_id, outfit_id); trigger actualiza outfits.likes_count
outfits_guardados — UNIQUE(user_id, outfit_id); trigger actualiza outfits.saves_count
prendas_guardadas — UNIQUE(user_id, garment_id); prendas en favoritos para comprar
follows         — UNIQUE(follower_id, following_id); trigger actualiza followers/following_count
prendas_armario — armario personal del usuario
productos_carrito — fuente para el checkout (POST /api/orders lo consume y vacía)
orders          — status: pending/shipped/delivered
productos_orden — items de una orden
size_guides     — guías de talle; brand_id nullable (NULL = OPA default)
size_guide_entries — entradas por talle con rangos de medidas
user_measurements — medidas del usuario; RLS estricto (solo fila propia)
brand_applications — solicitudes para ser marca
```

---

## Arquitectura del código

### Mobile (`app/`)

```
app/
  _layout.tsx         — fonts, auth init, Stack navigator
  (tabs)/
    index.tsx         — Home: carousels de outfits, prendas, marcas
    outfits.tsx       — Outfit Scroll TikTok-style; acepta ?outfitId para deep-link
    profile.tsx       — Perfil: header horizontal, 3 tabs (grid/favoritos/pedidos), sub-tabs
    search.tsx        — búsqueda funcional: texto + tabs + tag filters
    wardrobe.tsx      — armario personal con datos reales
  auth/index.tsx      — Login/Signup con validación por campo en tiempo real
  settings.tsx        — Logout, eliminar cuenta, "Mis medidas", "Registrar Marca" (si !is_brand)
  measurements.tsx    — inputs numéricos (altura/pecho/cintura/cadera/muslo cm), persiste via useUserMeasurements().save()
  user-outfits.tsx    — Scroll de outfits de un usuario; params: userId, startIndex
  saved-outfits.tsx   — Scroll de outfits guardados; param: startIndex
  outfit/[id].tsx     — detalle de outfit con prendas por slot, precio total, CTA
  product/[id].tsx    — detalle de prenda con SizeGuideSheet, selector de talle, CTA
```

**Flujo de auth:** `_layout.tsx` llama `supabase.auth.getSession()` + `onAuthStateChange()` → popula `useAuthStore` (session + profile). `initialized` previene flashes de UI.

**Deep-link Home → Outfit Scroll:** Home pasa `outfitId` como param a `/(tabs)/outfits`. El scroll usa `getItemLayout` + `scrollToIndex` / `scrollToOffset`. Índice 0: `scrollToOffset({ offset: 0 })`.

**Toggle like/save:** INSERT optimista en `outfit_likes` / `outfits_guardados`. Si error `23505` (unique constraint) → ya existía, tratar como éxito. DELETE para deshacer.

### Hooks (`hooks/`)

| Hook | Retorna |
|---|---|
| `useOutfits(creatorId?)` | outfits del feed o de un usuario |
| `useProfile(userId)` | perfil de un usuario |
| `useSavedOutfits(userId)` | outfits guardados — expone `refetch()` |
| `useSavedGarments(userId)` | prendas guardadas — expone `refetch()` |
| `useWardrobe(userId)` | armario personal |
| `useLike(outfitId, initialCount)` | like toggle con optimistic update |
| `useSave(outfitId, initialCount)` | save toggle con optimistic update |
| `useFollow(targetUserId)` | follow toggle |
| `useSizeGuide(guideId?)` | guide + entries ordenadas por sort_order |
| `useUserMeasurements()` | measurements + `save()` con UPSERT |
| `useRecommendedSize(guideId?)` | llama `supabase.rpc('get_recommended_size')` |

### API (`backend/functions/api/`)

Hono v4 en Deno. Base path: `/api`. Auth middleware en todas las rutas protegidas — lee `Authorization: Bearer <token>`, valida con `supabase.auth.getUser()`, expone `c.get('user')` y `c.get('supabase')`.

```
GET  /api/health                       — liveness check
GET  /api/brands/me                    — brand del usuario autenticado
PATCH /api/brands/me                   — actualiza brand info
GET  /api/brands/me/metrics            — likes + saves (visit/click pendiente de tablas DB)
GET  /api/brands/me/prendas            — lista prendas de la marca
POST /api/brands/me/prendas            — crea prenda; external_url requerido si sale_mode='redirect'
PATCH /api/brands/me/prendas/:id       — actualiza prenda con verificación de ownership
GET  /api/orders                       — órdenes del usuario
POST /api/orders                       — checkout: valida stock, crea order, decrementa stock, vacía carrito
PATCH /api/orders/:id/status           — brand owner cambia status (pending/shipped/delivered)
```

Rate limiter in-memory en `POST /orders`: ventana 60s, max 20 req/user.

---

## Decisiones técnicas críticas

- **`--legacy-peer-deps` obligatorio** en todos los `npm install` — conflictos de peer deps de Expo SDK 54.
- **`newArchEnabled: false`** — incompatible con react-native-screens@4.16.0 en RN 0.81.5.
- **`"updates": { "enabled": false }`** en app.json — sin esto Expo Go descarga el bundle remoto en vez del servidor local.
- **`pointerEvents` como style prop** — en `app/(tabs)/outfits.tsx` el SafeAreaView flotante usa `style={{ pointerEvents: 'box-none' }}`. En RN 0.71+ como prop directo está deprecado.
- **Supabase Auth storage:** `expo-secure-store` en nativo, `localStorage` en web. Configurado en `lib/supabase.ts`.
- **Fuente Merge One:** `assets/fonts/MergeOne-Regular.ttf` cargada con `expo-font`. No está en `@expo-google-fonts`.

### Gotchas de proceso (no solo técnicos)

- **No confíes en un checklist `[x]` sin verificar el código.** Ya pasó que un sync entre chats marcó pantallas como "implementadas y mergeadas" cuando en realidad eran stubs — el commit real llegó después. Antes de decir "esto ya está hecho", leé el archivo.
- **`.claude/documents/` puede desactualizarse.** Es la mejor fuente disponible, pero no es infalible — si algo no cuadra con lo que ves en el código, el código manda y hay que corregir el doc.
- **Commits/PRs:** rama de trabajo `claude/trusting-fermi-jfr1ix`, PRs como draft primero, squash merge a `main` cuando estén listos.

---

## Glosario de dominio

| Término | Significado |
|---|---|
| **outfit** | Unidad de contenido principal — un "look" armado con varias prendas, publicado con imagen de portada |
| **prenda** | Garment individual (remera, pantalón, zapatilla, etc.), pertenece a una marca |
| **slot** | Categoría de posición de una prenda dentro de un outfit: `torso`, `piernas`, `calzado`, `extras` |
| **marca** | Brand — cuenta de Supabase Auth separada de las personales, `perfiles.is_brand = true` |
| **armario** | Wardrobe personal del usuario — prendas que ya tiene, guardadas en `prendas_armario` |
| **guardar / guardado** | Save — bookmarking de un outfit o prenda (no es "like", es para volver a ver/comprar) |
| **talle recomendado** | Size calculado por `get_recommended_size()` en base a `user_measurements` del usuario y el `size_guide` de la prenda |
| **sale_mode** | Modo de venta de una prenda: `direct` (checkout dentro de OPA) o `redirect` (external_url a la tienda de la marca) |

---

## Documentación interna

Los documentos de referencia viven en `.claude/documents/`:

| Archivo | Contenido |
|---|---|
| `frontend-2026-06-06-screens-and-components.md` | Pantallas, componentes, design tokens |
| `backend-2026-06-06-supabase-integration.md` | Auth flow, hooks, tipos TypeScript |
| `backend-2026-06-15-api-layer.md` | Endpoints de la API Hono, estado de implementación |
| `database-2026-06-06-schema-and-seed.md` | Schema completo, migraciones, seed data |
| `design-2026-06-06-visual-system.md` | Sistema visual |
| `product-2026-06-10-brand-system.md` | Modelo de marcas: onboarding, verificación, monetización |
| `meta-2026-06-10-pending-features.md` | **Fuente de verdad de pendientes** — actualizar cuando se implementa algo |
| `_archive/` | Documentos obsoletos del modelo multi-chat anterior — solo referencia histórica, no seguir sus instrucciones |

**Regla:** cuando se completa un pendiente, eliminarlo de `pending-features.md` y marcarlo como hecho en el documento de la capa correspondiente. Al terminar una sesión, si hiciste un cambio relevante, actualizá el doc correspondiente y este `CLAUDE.md` antes de irte — la próxima sesión no va a tener otra forma de saberlo.

---

## Estado actual

**Resumen en prosa (2026-07-01):** la app mobile tiene el flujo principal completo y funcional contra Supabase real — auth, home, outfit scroll estilo TikTok, perfil, búsqueda, armario, detalle de outfit y de prenda con guía de talles, y "Mis medidas". Settings tiene logout, borrado de cuenta, acceso a medidas y el formulario de "Registrar Marca" (que solo inserta una solicitud en `brand_applications`, todavía no crea la cuenta de marca — eso lo hace `opa-admin` a futuro). La API en Hono está desplegada y sin 501s pendientes. `backend/` fue extraído a `opa-backend` pero todavía convive en este repo hasta confirmar que el nuevo repo despliega solo. Lo que falta es sobre todo features de producto avanzadas (ver Pendientes) y las sub-pantallas de Settings que no son core.

- [x] Setup + design tokens + BottomNavBar custom
- [x] Home screen con carousels horizontales
- [x] Outfit Scroll TikTok-style (like/save/follow funcionales)
- [x] Profile screen (header horizontal, 3 tabs, sub-tabs favoritos)
- [x] user-outfits.tsx y saved-outfits.tsx
- [x] Auth screen con validación por campo en tiempo real
- [x] Settings screen (logout, eliminar cuenta)
- [x] Deep-link Home → Outfit Scroll con scroll al índice correcto
- [x] Supabase Auth funcional (signup, login, logout)
- [x] Hooks: useLike, useSave, useFollow, useSavedOutfits, useSavedGarments
- [x] Sistema de guías de talle (tablas + hooks useSizeGuide, useUserMeasurements, useRecommendedSize)
- [x] API Hono: todos los endpoints implementados (sin 501s pendientes)
- [x] `prendas_guardadas` en DB con RLS
- [x] `app/product/[id].tsx` — detalle de prenda con imagen, selector de talle, SizeGuideSheet, CTA
- [x] `app/outfit/[id].tsx` — detalle de outfit con prendas por slot, precio total, CTA
- [x] `app/(tabs)/search.tsx` — búsqueda funcional: texto + tabs + tag filters
- [x] `app/(tabs)/wardrobe.tsx` — armario con datos reales, filtro por slot
- [x] `app/measurements.tsx` — pantalla "Mis medidas", accesible desde Settings
- [x] Settings → botón "Registrar Marca" + form de solicitud (inserta en `brand_applications`)
- [x] Fuente Merge One en `assets/fonts/MergeOne-Regular.ttf` — cargada en `_layout.tsx`
- [x] Extracción de `backend/` a `maxibernardoni/opa-backend`

## Pendientes principales

- [ ] Confirmar deploy independiente de `opa-backend` y luego eliminar `backend/` de este repo
- [ ] Settings sub-screens: editar perfil, seguridad, notificaciones, preferencias de estilo
- [ ] Replicar este formato de `CLAUDE.md` (secciones "Cómo trabajar conmigo", mapa de repos, valores, glosario, snapshot en prosa) en `opa-admin` y a futuro en `opa-backend` / `opa-web`
