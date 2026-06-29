# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ¿Qué es OPA?

App mobile de descubrimiento de moda centrada en **outfits** como unidad principal de contenido (TikTok/Pinterest para moda). Tres pilares: descubrimiento de outfits, armario personal, compra contextual.

El repo también contiene `backend/` — infraestructura Supabase + Edge Functions + Hono API compartida entre opa-mobile y opa-web. Está planificada su extracción a repo propio (`opa-backend`) una vez que el deploy esté completo.

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
  settings.tsx        — Logout + eliminar cuenta (supabase.rpc('delete_user'))
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
| `meta-2026-06-10-pending-features.md` | **Fuente de verdad de pendientes** — actualizar cuando se implementa algo |

**Regla:** cuando se completa un pendiente, eliminarlo de `pending-features.md` y marcarlo como hecho en el documento de la capa correspondiente.

---

## Estado actual

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

## Pendientes principales

- [ ] Pantalla de "Mis medidas" en Settings
- [ ] Settings → botón "Registrar Marca" + form de solicitud
- [ ] Fuente Merge One en `assets/fonts/MergeOne-Regular.ttf`
