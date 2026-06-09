# OPA — Contexto para Claude Code

## ¿Qué es OPA?

App mobile de descubrimiento de moda centrada en **outfits** como unidad principal de contenido. La experiencia debe sentirse como TikTok o Instagram Reels aplicado a la moda: visual, inmersiva, fluida y aspiracional.

**Tres pilares del producto:**
1. Descubrimiento de outfits
2. Armario personal inteligente
3. Compra contextual (comprar lo que falta para completar un look)

**OPA NO es:** una tienda online tradicional, un catálogo frío de productos, ni una app corporativa sobrecargada.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 (managed workflow) |
| Navegación | Expo Router v6 (file-based routing) |
| Estado global | Zustand |
| Estilos | NativeWind (Tailwind para React Native) |
| Imágenes | Expo Image |
| Animaciones | React Native Reanimated |
| Backend | Supabase (Project ID: `vecnktrbjolahcalkbml`) |
| Lenguaje | TypeScript |

---

## Design tokens

```ts
// colors.ts
export const colors = {
  rosaOpa: '#EB006B',               // Color primario, acciones, acentos
  rosaOpaLight: 'rgba(235, 0, 107, 0.2)', // Highlight nav activo
  negro: '#000000',
  blanco: '#FFFFFF',
  grisClaro: '#838383',             // Texto secundario
  grisBorde: '#F2F2F2',             // Bordes, fondos secundarios
  grisMedio: '#D9D9D9',             // Placeholders, skeletons
  grisOscuro: '#4E4E4E',            // Texto terciario
  bordeTag: '#A6A6AC',              // Bordes de tags de estilo
}

// fonts.ts — Merge One (títulos) y Palanquin Dark (botones, usernames)
// radius.ts — card:15, chip:10, button:8, tag:8, avatar:9999
// spacing.ts — xs:4, sm:8, md:12, lg:16, xl:24, xxl:32
```

**Fuente Merge One:** no está en npm como `@expo-google-fonts`. Hay que descargar `MergeOne-Regular.ttf` de Google Fonts, colocarla en `assets/fonts/` y descomentar la línea en `app/_layout.tsx`.

---

## Esquema de base de datos (Supabase)

```sql
-- perfiles: id, username, display_name, bio, avatar_url, instagram_handle, tags[], followers_count, following_count, outfits_count
-- marcas: id, name, logo_url, verified
-- prendas: id, brand_id, name, price, slot (torso/piernas/calzado/extras), image_url, colors[], sizes[], style_tags[]
-- outfits: id, creator_id, title, description, cover_image_url, likes_count, saves_count, occasion[], style_tags[]
-- outfit_items: outfit_id, garment_id, position_x, position_y  ← coordenadas de los labels flotantes
-- outfit_likes: user_id, outfit_id
-- outfits_guardados: user_id, outfit_id, created_at  ← outfits guardados en favoritos
-- prendas_guardadas: id, user_id, garment_id, created_at  ← prendas guardadas en favoritos (para comprar)
-- follows: follower_id, following_id
-- wardrobe: id, user_id, garment_id, size, color, source (purchase/manual)
```

**Nota:** nombres de tablas y columnas en español (perfiles, prendas, marcas, etc.).

---

## Pantallas de la Demo 1

### Home (`app/(tabs)/index.tsx`)
- Header: logo OPA (rosa, izquierda) + ícono camión (derecha)
- Sección "OUTFITS >" → carousel horizontal de OutfitCards (200×356px, radius 15)
- Sección "ÚLTIMAS PRENDAS >" → scroll horizontal (115×144px)
- Sección "LAS MARCAS QUE LA GENTE ELIGE >" → logos de marcas (115×115px, borde negro)
- Sección "LO ÚLTIMO QUE VISTE" → placeholders grises si vacío

### Outfit Scroll (`app/(tabs)/outfits.tsx`)
- FlatList full-screen con `pagingEnabled` — scroll vertical tipo TikTok
- Header flotante: camión (izq) + tabs "tus marcas / Descubrir" (centro) + botón + (der)
- Labels flotantes de prendas: chip blanco con thumbnail circular + nombre + precio
- Botones de acción derecha: Like · Guardar · Compartir (con estado local)
- Info marca abajo izquierda: avatar + nombre + tick verificado + título outfit
- Bottom bar blanco (radius 15): precio total + descuento + botón "Ver outfit" rosa

### Perfil (`app/(tabs)/profile.tsx`)
- Header horizontal: avatar 80×80 (izquierda) + username / nombre / bio / ig handle / tags (derecha)
- Stats: Seguidores · Seguidos · Outfits · Guardados (valor real de `outfits_guardados`)
- 3 tabs con iconos PNG del storage: Grid (`Grid.png`) · Favoritos (estrella) · Pedidos (caja)
- **Tab Grid:** grilla 3 columnas de outfits propios → tap navega a `app/user-outfits.tsx`
- **Tab Favoritos:** 2 sub-tabs:
  - Outfits (`nav/outfit_v2.png`): grid de outfits guardados → tap navega a `app/saved-outfits.tsx`
  - Prendas (`percha_negra.png`): grid 4 columnas de prendas guardadas en `prendas_guardadas`
- **Tab Pedidos:** empty state
- Tocar el tab Favoritos hace refetch automático de outfits y prendas guardadas
- Icono de settings (arriba derecha) → navega a `app/settings.tsx`
- Gate screen si no hay sesión: logo OPA + botones iniciar sesión / crear cuenta

### Outfits del usuario (`app/user-outfits.tsx`)
- Scroll full-screen TikTok para los outfits de un perfil específico
- Parámetros: `userId`, `startIndex`
- Sin header flotante (no camión, no tabs, no botón +)
- Botón back circular translúcido (arriba izquierda)

### Outfits guardados (`app/saved-outfits.tsx`)
- Scroll full-screen TikTok para los outfits guardados en favoritos del usuario de sesión
- Parámetro: `startIndex`
- Mismo layout que `user-outfits.tsx`

### Configuración (`app/settings.tsx`)
- Card de perfil (avatar + username + email)
- Secciones: CUENTA · PREFERENCIAS · APLICACIÓN
- Logout con confirmación (`supabase.auth.signOut({ scope: 'local' })`)
- Modal de eliminar cuenta (pide contraseña, llama `supabase.rpc('delete_user')`)

---

## Decisiones técnicas tomadas

- **`--legacy-peer-deps` obligatorio** en todos los `npm install`. Hay conflictos de peer deps entre múltiples dependencias de Expo SDK 54. No correr `npm install` sin este flag.
- **`newArchEnabled: false` en app.json** — la nueva arquitectura de React Native es incompatible con `react-native-screens@4.16.0` en RN 0.81.5. No cambiar a `true` hasta actualizar a RN ≥ 0.82.
- **`"updates": { "enabled": false }` en app.json** — el proyecto tiene EAS configurado (`eas.json`) pero no usa EAS Update. Sin esto, Expo Go intenta descargar el bundle desde los servidores de Expo en lugar del servidor local.
- **`package.json` main = `"expo-router/entry"`** — ya configurado, no cambiar.
- **`babel.config.js` y `metro.config.js` son obligatorios** — sin ellos Metro no puede compilar el proyecto. Usan `babel-preset-expo` y `expo/metro-config` respectivamente.
- **Mock data en `constants/mockData.ts`** — la app funciona sin Supabase para la Demo 1. Contiene 5 outfits, 5 marcas, 5 prendas con imágenes de picsum.photos.
- **`@react-native-async-storage/async-storage` está en v3** (se esperaba v2.2.0) — genera warning pero funciona. No downgradearlo sin probar.
- **Fuente Merge One** no se pudo descargar automáticamente (red corporativa bloquea fonts.gstatic.com). La línea está comentada en `app/_layout.tsx`.
- **`pointerEvents` como style prop** — en `app/(tabs)/outfits.tsx` el SafeAreaView flotante usa `style={{ pointerEvents: 'box-none' }}`. En RN 0.71+ `pointerEvents` como prop directo está deprecado y rompe en algunos entornos.
- **Dependencias peer de expo-router no estaban en package.json** — `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `expo-linking`, `expo-constants`, `expo-updates`, `react-native-worklets` y `react-native-is-edge-to-edge` son requeridas por expo-router v6 o reanimated v4 y deben estar declaradas explícitamente.
- **Supabase Auth con storage multiplataforma** — `expo-secure-store` en nativo, `localStorage` en web. Configurado en `lib/supabase.ts`.
- **`useAuthStore` (Zustand)** — mantiene `session` y `profile` globalmente. `profile` viene de la tabla `perfiles` y se carga al iniciar sesión.
- **Username validation** — regex `/^[a-z0-9._]+$/` aplicado en signup. Errores por campo (username, email, contraseña) mostrados en tiempo real en `app/auth/index.tsx`.
- **Assets en Supabase Storage** — bucket `assets` en `https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/assets/`. Los nombres de archivo son case-sensitive: `Grid.png` (G mayúscula), iconos de navegación en subcarpeta `nav/`.
- **Deep-link al outfit scroll** — Home pasa `outfitId` como param a `/(tabs)/outfits`. El scroll usa `getItemLayout` + `scrollToIndex`/`scrollToOffset` para posicionarse. Índice 0 usa `scrollToOffset({ offset: 0 })` (no `scrollToIndex`).
- **Toggle like/save con deduplicación** — INSERT optimista; si devuelve error `23505` (unique constraint) se trata como ya existente. DELETE para deshacer. Tablas: `outfit_likes`, `outfits_guardados`, `prendas_guardadas`.
- **`prendas_guardadas` creada manualmente** — no estaba en el schema original. Se creó con RLS + GRANT vía MCP Supabase. Permite guardar prendas para comprar más tarde.

## Modo de desarrollo recomendado

```bash
npx expo start --web --clear   # Web en el browser de la PC — funciona en cualquier red
npx expo start --clear          # Celular con Expo Go — requiere misma red WiFi y Expo Go SDK 54
```

En redes corporativas con restricciones de acceso a internet, usar siempre el modo web.

---

## Notas de producto

- **Content first:** la imagen siempre es lo más importante, la UI es secundaria
- **No sobrecargar:** evitar texto excesivo, información progresiva
- **Tap para revelar:** en el outfit scroll, la info aparece al interactuar
- **Compra contextual:** cuando el usuario tiene prendas en su armario que coinciden con un outfit, marcarlas como "ya tenés esto"
- **Sin fricción:** el flujo inspiración → compra debe ser lo más corto posible
- La app debe sentirse más cercana a **TikTok/Pinterest** que a cualquier tienda online

---

## Hooks disponibles

| Hook | Descripción |
|---|---|
| `useOutfits(creatorId?)` | Outfits del feed o de un usuario específico |
| `useProfile(userId)` | Perfil de un usuario |
| `useSavedOutfits(userId)` | Outfits guardados en favoritos — expone `refetch()` |
| `useSavedGarments(userId)` | Prendas guardadas en favoritos — expone `refetch()` |
| `useWardrobe(userId)` | Items del armario personal |
| `useLike(outfitId, initialCount)` | Estado like + toggle con optimistic update |
| `useSave(outfitId, initialCount)` | Estado guardado + toggle con optimistic update |
| `useFollow(targetUserId)` | Estado seguir + toggle |

---

## Estado actual

- [x] Setup del proyecto y configuración base
- [x] Design tokens (colores, tipografías, spacing, radius)
- [x] BottomTabBar custom con tab OPA destacado
- [x] Home screen con carousels horizontales
- [x] Outfit Scroll screen (full-screen, paginado vertical, like/save/follow funcionales)
- [x] Profile screen rediseñado (header horizontal, 3 tabs con iconos, sub-tabs en Favoritos)
- [x] Outfits del usuario (`user-outfits.tsx`) — scroll sin header, desde perfil
- [x] Outfits guardados (`saved-outfits.tsx`) — scroll desde tab Favoritos
- [x] Configuración (`settings.tsx`) — logout, eliminar cuenta
- [x] Auth screen con validación por campo en tiempo real y logo OPA
- [x] Deep-link Home → Outfit Scroll con scroll al outfit seleccionado
- [x] Supabase Auth funcional (signup, login, logout)
- [x] Likes, guardados y seguimiento conectados a Supabase
- [x] Tabla `prendas_guardadas` creada en Supabase con RLS
- [x] Soporte web (`npx expo start --web`)
- [x] `babel.config.js` y `metro.config.js` configurados

## Pendientes

- [ ] Fuente Merge One en `assets/fonts/MergeOne-Regular.ttf`
- [ ] Pantallas de detalle: `outfit/[id]` y `product/[id]`
- [ ] Pantalla de búsqueda funcional
- [ ] Tab Pedidos con lógica real
- [ ] Crear RPC `delete_user` en Supabase (requerida por settings.tsx)
- [ ] Lógica para guardar prendas en favoritos (UI del botón en la prenda)
