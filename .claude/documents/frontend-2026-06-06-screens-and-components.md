# Frontend — Screens and Components

This document covers all implemented screens, components, design tokens, and relevant technical configuration for the OPA app.

---

## Stack

- React Native + Expo SDK 54 (managed workflow)
- Expo Router v6 (file-based routing)
- NativeWind installed (but `StyleSheet` is used primarily)
- Expo Image (`expo-image`) for images with caching
- React Native Reanimated for animations
- Zustand for global state

---

## Route Structure

```
app/
  _layout.tsx          # Root layout: fonts, auth init, Stack navigator
  (tabs)/
    _layout.tsx        # Tab layout with custom BottomNavBar
    index.tsx          # Home
    outfits.tsx        # Outfit Scroll (TikTok-style)
    search.tsx         # Search funcional
    wardrobe.tsx       # Armario personal con datos reales
    profile.tsx        # Profile
  auth/
    index.tsx          # Login/Signup con validación por campo
  settings.tsx         # Settings screen
  user-outfits.tsx     # Scroll de outfits de un usuario específico
  saved-outfits.tsx    # Scroll de outfits guardados en favoritos
  measurements.tsx     # Mis medidas — inputs numéricos de medidas corporales
  product/
    [id].tsx           # Detalle de prenda con SizeGuideSheet
  outfit/
    [id].tsx           # Detalle de outfit con prendas por slot
  user/
    [id].tsx           # Perfil de otro usuario (no el propio) — solo lectura + follow
  marca/
    [id].tsx           # Perfil público de marca (banner + catálogo); modo isOwn para la propia marca logueada
```

---

## Implemented Screens

### Home (`app/(tabs)/index.tsx`)
- Header: transparent OPA logo (left) + white truck icon (right)
- **Outfit Carousel** with depth effect:
  - `Animated.FlatList` horizontal, `snapToInterval`
  - `scrollX` interpolated → `scale` (0.84→1→0.84) and `opacity` (0.65→1→0.65)
  - Cards: 220×370px, radius 15, shadow
  - Side padding = `(screenWidth - 220) / 2` to center cards
- **Latest Garments**: horizontal scroll, 120×150 cards, name + pink price
- **Brands**: horizontal scroll, 110×110 square cards with black border. Shows logo if available, name otherwise
- **Recently Viewed**: 4 grey placeholder cards (110×150)
- Connected to real data via `useOutfits()`

### Outfit Scroll (`app/(tabs)/outfits.tsx`)
- Full-screen `FlatList` with `pagingEnabled` — vertical TikTok-style scroll. En web, `snapToInterval` es un no-op (react-native-web 0.21.2); el snap real lo da `pagingEnabled`. El `FlatList` fuerza `style={{ height: pageH }}` (viewport == alto de cada item) para que el snap no quede desalineado.
- `pageH = SH - tabBarHeight`: cada item mide el alto de ventana menos el alto real de `BottomNavBar` (que se dibuja encima del contenido, no reserva espacio) — si no se descuenta, la barra de precio queda tapada por la nav.
- Floating header: camión (`assets/camion_blanco.png`, imagen real — no emoji) a la izquierda + tabs "tus marcas / Descubrir" al centro (sin separador "/", sin pill oscuro de fondo — texto plano sobre la foto con subrayado rosa 2px en la tab activa) + botón "+" a la derecha (solo el signo, sin círculo/borde)
- `OutfitScrollItem` por item: imagen full-bleed (sin overlay oscuro de gradiente) + UI superpuesta
- Chips de prenda flotantes (thumbnail + nombre + precio) con líneas conectoras en forma de codo hacia un punto en la prenda; el ancla se deriva del `slot` de cada prenda (no hay coordenadas `position_x/position_y` en la DB — ver limitación en pending-features.md)
- Botones de acción (like/save/share): iconos blancos sin círculo de fondo, 34×34px, gap 20, sobre la foto directamente (sin contador numérico visible)
- Info del creador (avatar + nombre + título del outfit) abajo a la izquierda — sigue mostrando el **creador**, no la marca, hasta que exista onboarding de cuentas de marca con outfits propios
- Barra de precio flotante (no pegada al fondo): ícono de bolsa rosa + "Precio total" + monto + botón "Ver outfit"
- Connected to `useOutfits()`

### Profile (`app/(tabs)/profile.tsx`)
Four states:

1. **Initializing** (`!initialized`): centered `ActivityIndicator`
2. **No session** (`!session`): Auth gate con logo OPA + botones iniciar sesión / crear cuenta
3. **Cuenta de marca** (`profile.is_brand === true`): `<Redirect>` a `/marca/[id]` (con `id` = la marca via `useMyBrand`) — la cuenta de marca nunca ve este layout de perfil personal
4. **Con sesión (personal)**: full profile
   - Header horizontal: avatar 80×80 (izquierda) + username / nombre / bio / ig handle / tags (derecha)
   - Settings icon (arriba derecha) → `app/settings.tsx`
   - Stats: Seguidores · Seguidos · Outfits · Guardados (valor real de `outfits_guardados`)
   - **3 tabs con iconos PNG** del bucket `assets`:
     - **Grid** (`Grid.png` / `Grid_rosa.png`): grilla 3 columnas de outfits propios → tap → `user-outfits.tsx`
     - **Favoritos** (`estrella_gris.png` / `estrella_negra.png`): 2 sub-tabs:
       - **Outfits** (`nav/outfit_v2.png`): grid de outfits guardados → tap → `saved-outfits.tsx`
       - **Prendas** (`percha_negra.png`): grid 4 columnas de `prendas_guardadas`
     - **Pedidos** (`caja_negra.png` / `caja_rosa.png`): empty state
   - Al activar Favoritos se hace `refetch()` de outfits y prendas guardadas

### Product Detail (`app/product/[id].tsx`)
- Parámetro: `id` (garment ID)
- Fetch directo a `prendas` con join `brand:marcas(*)` vía `supabase.maybeSingle()`
- Usa `useSizeGuide(garment.size_guide_id)` y `useRecommendedSize(garment.size_guide_id)`
- **Header:** botón back + nombre de prenda centrado
- **Imagen:** full-width, aspect ratio 1:1.1, `expo-image` con `contentFit: 'cover'`
- **Brand row:** logo circular 28px (o inicial si sin logo) + nombre de marca
- **Precio:** `rosaOpa`, formato `toLocaleString('es-AR')`
- **Selector de talle:** chips horizontales con wrap; estado: default / selected (negro) / recomendado (borde `rosaOpa` 2px). Botón "ⓘ Guía de talles" → abre `SizeGuideSheet`. Hint de talle recomendado debajo.
- **Tags:** categoría + estilo como chips con borde `bordeTag`
- **CTA sticky:** `sale_mode === 'redirect'` → "Ver en tienda →"; `direct` → "Agregar al carrito" (deshabilitado si no hay talle seleccionado y hay talles disponibles)
- **`SizeGuideSheet` (inline):** `Modal` con `animationType: 'slide'`, `transparent`, overlay semitransparente. Tabla horizontal scrolleable con columnas adaptadas por categoría: `calzado` → pie; `piernas`/`bottoms` → cintura/cadera/muslo; default → busto/cintura/cadera. Fila del talle recomendado destacada en `rosaOpaLight` con texto `rosaOpa`. Banner inferior con el talle recomendado.

### Outfit Detail (`app/outfit/[id].tsx`)
- Parámetro: `id` (outfit ID)
- Fetch a `outfits` con join `creator:perfiles(id, username, avatar_url)` + `garments:outfit_items(*, garment:prendas(*, brand:marcas(*)))`
- **Header:** botón back + título del outfit centrado
- **Cover image:** full-width, aspect ratio 1:1.25
- **Creator row:** avatar 32px + `@username` → tap navega a `user-outfits?userId=...&startIndex=0`
- **Tags:** `occasion` + `style` como chips
- **Stats:** likes_count + saves_count
- **Lista de prendas (PRENDAS):** `GarmentRow` por prenda — thumbnail 60×60 + nombre + marca + slot label + precio `rosaOpa` → tap navega a `product/[id]`
- **Slot grid:** thumbnails 72×90 agrupados por slot (Torso / Piernas / Calzado / Extras); slots vacíos no se renderizan
- **CTA sticky:** total price izquierda + botón "Ver outfit completo" derecha

### Search (`app/(tabs)/search.tsx`)
- Búsqueda con debounce de 350ms sobre `query` + `activeTag` + `tab`
- **Search bar:** input con `backgroundColor: grisBorde`, icono 🔍, botón ✕ para limpiar
- **Tabs:** Outfits / Prendas — cambia el target de búsqueda; borde inferior `rosaOpa` en activo
- **Tag filters:** horizontal `FlatList` con 13 tags fijos (`STYLE_TAGS` + `OCCASION_TAGS`); un tag activo a la vez; tap en activo lo deselecciona
- **Query outfits:** `.ilike('title', ...)` + `.or('style.ilike...,occasion.ilike...')` — `LIMIT 30`, ordenado por `likes_count DESC`
- **Query prendas:** `.ilike('name', ...)` + `.ilike('style', ...)` — `LIMIT 30`, ordenado por `created_at DESC`
- **Grid resultados:** 2 columnas, cards con imagen + título/nombre + creator/brand; tap navega a `outfit/[id]` o `product/[id]`
- Estado vacío inicial: ícono 👗 + texto descriptivo. Sin resultados: mensaje con el query.
- Nota: búsqueda client-side con `.ilike()` — no usa `to_tsvector`; full-text search queda como mejora futura

### Wardrobe (`app/(tabs)/wardrobe.tsx`)
Mismo tab/ruta para las dos audiencias; el componente rama según `profile.is_brand` (2026-08-07):

**Usuarios normales — `PersonalWardrobeView`**
- Usa `useWardrobe(session.user.id)` — datos de `prendas_armario`
- Auth gate: si no hay sesión, empty state con mensaje "Iniciá sesión para ver tu armario"
- **Header:** "Mi Armario" + contador de prendas
- **Filtro por slot:** horizontal `FlatList` con chips (Todo / Torso / Piernas / Calzado / Extras); filtra client-side sobre `item.slot`
- **Grid:** 3 columnas, `WardrobeCard` — imagen + nombre + marca; tap navega a `product/[id]`
- Empty state por slot: mensaje contextual diferenciado (armario vacío vs. slot sin prendas)
- Nota: el filtro depende de que `prendas_armario` tenga columna `slot`; si no existe, siempre muestra "Todo" sin romper

**Cuentas de marca (`profile.is_brand`) — `BrandCatalogView`**
- Reemplaza por completo la función de armario: una marca no tiene armario personal, tiene inventario propio.
- Resuelve la marca de la cuenta logueada con `useMyBrand(session.user.id)`, y reusa `useBrand(brand.id)` (mismo hook que `app/marca/[id].tsx`) para traer `garments` y `outfits`.
- **Header:** "Catálogo" + contador según la sub-tab activa.
- **Dos sub-tabs** (mismo patrón visual que `BRAND_TABS` de `app/marca/[id].tsx`, pero con label de texto en vez de ícono): **Prendas** y **Outfits**.
  - **Prendas:** grid de 3 columnas, `GarmentStockCard` — imagen + nombre + **stock total** (`Object.values(garment.stock_por_talle).reduce(sum)`), en rosa "Sin stock" si da 0. Tap navega a `product/[id]` (solo lectura — no hay pantalla de edición de prendas en esta app, eso vive en `opa-web`, sin iniciar).
  - **Outfits:** grid de 3 columnas con los outfits creados por esa marca (`creator_id = marcas.profile_id`, vía `useBrand`); si la marca no tiene `profile_id` o no publicó outfits, queda vacío (mismo gap conocido de `marca/[id].tsx`).
- Solo lectura en ambas sub-tabs — es un espejo interno del catálogo público con un dato extra privado (stock), no un panel de gestión.

### Measurements (`app/measurements.tsx`)
Accessible from Settings → "Mis medidas" row.

- **5 numeric fields:** Altura (cm) · Pecho (cm) · Cintura (cm) · Cadera (cm) · Muslo (cm)
- Each field: `TextInput` with `keyboardType="decimal-pad"`, `maxLength=5`, strips non-numeric/non-dot chars on change
- Data loaded from `useUserMeasurements()` on mount; converts numbers to strings for display, empty string if null
- Save: converts string values back to `Number` (or `null` if empty) → calls `save(payload)` with UPSERT
- Success indicator: "Medidas guardadas ✓" text in `rosaOpa` shown after successful save
- Layout: `KeyboardAvoidingView` wrapper (`padding` on iOS), `ScrollView` content; fields inside a white card with `borderBottomWidth` separators

### User Profile (`app/user/[id].tsx`)
- Perfil de lectura de **otro usuario** (no marca separada — reusa el mismo layout para cualquier `perfiles` no propio). Antes de este screen, la app no tenía forma de ver el perfil de nadie más que uno mismo: tocar un creador saltaba directo al scroll de sus outfits.
- Param: `id` (userId). Si `id` === el usuario logueado, redirige a `/(tabs)/profile` (este screen es exclusivamente para perfiles ajenos).
- Top bar: flecha de volver (`flecha.png`) y compartir (`compartir.png`), ambos assets reales de Supabase Storage — **no** texto/emoji. El ícono de menú (`···`) sí quedó como texto porque no hay ningún asset de menú/opciones en el bucket `assets/` (se buscó explícitamente).
- Header: avatar + stats (Seguidores/Seguidos/Outfits — sin "Guardados", que es privado), nombre, handle, bio, ig, tags.
- Botón **Seguir/Siguiendo** con `useFollow` (mismo hook que el scroll de outfits, sin campanita de notificaciones — ver pendientes).
- Un solo tab (grid, sin favoritos/pedidos — esos son privados del dueño), **centrado** en la tab bar (no pegado a la izquierda), sección "Outfits creados", grid 3 columnas con like count, tap → `user-outfits.tsx` con `userId` + `startIndex`.
- Iconos de compartir y menú arriba a la derecha son solo visuales por ahora, sin acción — ver pendientes.
- **Bottom navbar standalone**: esta pantalla vive fuera del `Tabs` navigator (es un stack screen bajo `app/`), así que no puede reusar `components/navigation/BottomNavBar.tsx` directamente (ese componente depende de `state`/`navigation` de `@react-navigation/bottom-tabs`). Se armó una versión propia dentro del mismo archivo, calcada visualmente (mismos ícono paths en `assets/nav/`, mismo `iconWrap` con fondo rosa cuando activo), con "perfil" siempre marcado como activo y cada ícono navegando con `router.push` a la ruta del tab real (`/(tabs)`, `/(tabs)/outfits`, etc.). Si se agrega otra pantalla standalone que necesite esta navbar, vale la pena extraer esto a un componente compartido en vez de copiar el bloque de nuevo.
- Puntos de entrada actualizados para navegar acá en vez de saltar directo al scroll: fila de creador en `outfit/[id].tsx`, avatar/nombre del creador en `OutfitScrollItem` (scroll principal), y `@username` en resultados de `search.tsx`.

### Brand Profile (`app/marca/[id].tsx`)
Perfil público de una marca — layout distinto al de usuario (banner + avatar-logo circular, badge `verificado_ondas.png` si `marcas.verified`, `@handle · Marca`, bio, tags, stats Seguidores/Outfits/Prendas, tabs icon-only Grid/Catálogo). Hook `useBrand(marcaId)`.

- **Modo `isOwn`** (`brand.profile_id === session.user.id`, agregado 2026-07-13): engranaje de configuración (→ `/settings`) en vez de compartir/menú, sin botón "Seguir", tab "perfil" de la navbar activo. Es el layout que ve una cuenta de marca logueada de sí misma (ver Profile arriba).
- **Modo ajeno**: banner "Ya lo tenés" si el usuario logueado tiene prendas de esa marca en el armario (cruza `useWardrobe` con `garment.brand_id`), botón Seguir.
- Igual que `app/user/[id].tsx`, vive fuera del `Tabs` navigator — bottom navbar standalone propia.
- **Limitación conocida:** todas las `marcas` menos Revés tienen `profile_id = NULL` (falta onboarding de cuentas de marca), así que Outfits/Seguidores quedan vacíos y Seguir es inerte para esas marcas; el catálogo sí trae datos reales siempre.

### User Outfits (`app/user-outfits.tsx`)
- Scroll full-screen TikTok para los outfits de un perfil específico
- Parámetros: `userId`, `startIndex`
- Sin header flotante (no camión, no tabs, no botón +)
- Botón back circular translúcido (arriba izquierda)
- Navegar desde el grid del perfil propio o desde `app/user/[id].tsx`

### Saved Outfits (`app/saved-outfits.tsx`)
- Scroll full-screen TikTok para los outfits guardados en favoritos
- Parámetro: `startIndex` (usa `useAuthStore` para el userId)
- Mismo layout que `user-outfits.tsx`
- Navegar desde el sub-tab Favoritos > Outfits del perfil

### Auth (`app/auth/index.tsx`)
- Modal con `presentation: 'modal'`, `animation: 'slide_from_bottom'`
- Logo OPA (`logoOPA-transparente.png` desde Supabase Storage)
- Login / signup switcher — `switchMode()` limpia todos los errores y campos
- Login: email + password → `supabase.auth.signInWithPassword`
- Signup: username + email + password → `supabase.auth.signUp`
- **Validación por campo en tiempo real:**
  - Username: regex `/^[a-z0-9._]+$/` — error si tiene mayúsculas, espacios o caracteres especiales
  - Email: regex básico de formato
  - Password: mínimo 6 caracteres
  - Login: banner de error sobre el botón si credenciales inválidas
- Botón bloqueado si hay errores activos
- Borde rojo (`inputError` style) en campos inválidos

### Settings (`app/settings.tsx`)
Accessible from the ⚙ icon in Profile. Requires active session.

**Implemented ✅**
- Header with back button
- Profile card: avatar + username + "Ver mi perfil" link
- Section list: CUENTA · PREFERENCIAS · APLICACIÓN (UI only — no screens behind items yet)
- **Cerrar sesión**: calls `supabase.auth.signOut()` + clears Zustand store → redirects to `/(tabs)`
- **Eliminar cuenta**: modal with password confirmation
  - Button disabled until password is typed
  - Verifies password via `supabase.auth.signInWithPassword`
  - Error in red below input if password is wrong
  - Calls `supabase.rpc('delete_user')` on success → signOut → redirect
  - Spinner during verification and deletion

**Also implemented ✅**
- **Mis medidas** row in PREFERENCIAS section → navigates to `app/measurements.tsx`
- **Registrar Marca** row — shown only when `perfiles.is_brand = false`. Opens a modal with fields: Nombre de marca (free text), Instagram (free text), Categoría (free text varchar, no constraint). On submit: inserts into `brand_applications` table with `profile_id`, `brand_name`, `instagram_handle`, `category`. Modal state vars: `showBrandModal`, `brandName`, `brandInstagram`, `brandCategory`, `brandError`, `brandLoading`.

**Not implemented yet ❌**
- Editar perfil (edit name, bio, avatar, tags)
- Seguridad (change password, 2FA)
- Email y notificaciones
- Preferencias de estilo
- Talles preferidos
- Notificaciones (push)
- Privacidad
- Ayuda y soporte
- ~~`delete_user()` SQL function in Supabase~~ ✅ Created (migration `create_delete_user_function`)

---

## Components

### Navigation
**`components/navigation/BottomNavBar.tsx`**
- 5 flat equal tabs: Home · Outfits · Search · Wardrobe · Profile
- PNG icons from Supabase Storage (`assets/nav/`)
- All tabs are the same size — no elevated center button
- Active tab: `rosaOpaLight` background on `48×48` icon container (`borderRadius: 8`) + `_rosa.png` icon variant
- Inactive tab: no background, default icon
- Thin gray top border (`grisBorde`)
- `paddingBottom` via `useSafeAreaInsets().bottom` (not hardcoded)
- No text labels
- Registered in `app/(tabs)/_layout.tsx` as `tabBar={(props) => <BottomNavBar {...props} />}`
- **Ícono condicional del tab Wardrobe (2026-08-07):** lee `profile.is_brand` de `useAuthStore`. Si es una cuenta de marca, el tab `wardrobe` muestra `assets/bag_negra.png` / `bag_rosa.png` (mismos assets que el tab "Catálogo" de `app/marca/[id].tsx`) en vez de `assets/nav/armario.png` / `armario_rosa.png` — la ruta sigue siendo `wardrobe`, solo cambia el ícono; el contenido detrás lo resuelve `app/(tabs)/wardrobe.tsx` (ver sección Wardrobe más arriba).

> `BottomTabBar.tsx` still exists but is unused (logic stripped). `BottomNavBar.tsx` is the active component.

### Home
- **`SectionHeader`**: UPPERCASE bold title (Merge One) + clickable pink arrow →
- **`HorizontalSlider`**: generic horizontal `ScrollView` wrapper
- **`BrandsSlider`**: brand-specific slider

### Outfit
- **`OutfitScrollItem`**: full item for the vertical feed
- **`OutfitCard`**: outfit card for the carousel
- **`OutfitGarmentLabel`**: floating chip with circular thumbnail + name + price
- **`OutfitBottomBar`**: white bottom panel with total price + "View outfit" button

### Profile
- **`ProfileHeader`**: avatar + username + name + bio + tags
- **`ProfileStats`**: stats row
- **`ProfileNavbar`**: internal Grid/Favorites/Orders tabs with active indicator
- **`OutfitGrid`**: 3-column outfit grid

### UI Primitives
- **`Button`**: primary/secondary button with variants
- **`Tag`**: style chip with border
- **`Avatar`**: circular image with fallback to initial letter
- **`Badge`**: numeric indicator

---

## Design Tokens

Defined in `constants/`:

```ts
// colors.ts
rosaOpa: '#EB006B'
rosaOpaLight: 'rgba(235, 0, 107, 0.2)'
negro: '#000000'
blanco: '#FFFFFF'
grisClaro: '#838383'
grisBorde: '#F2F2F2'
grisMedio: '#D9D9D9'
grisOscuro: '#4E4E4E'
bordeTag: '#A6A6AC'

// fonts.ts
mergeOne: 'MergeOne-Regular'      // Section titles and headings
palanquinDark: 'PalanquinDark'    // Buttons, usernames

// radius.ts
card: 15, chip: 10, button: 8, tag: 8, avatar: 9999

// spacing.ts
xs:4, sm:8, md:12, lg:16, xl:24, xxl:32
```

**Merge One font:** file `assets/fonts/MergeOne-Regular.ttf` loaded with `expo-font` in `_layout.tsx`.

---

## Relevant Technical Configuration

- `newArchEnabled: false` in `app.json` — incompatible with react-native-screens@4.16.0 on RN 0.81.5; do not change to `true` until upgrading to RN ≥ 0.82
- `"updates": { "enabled": false }` in `app.json` — prevents Expo Go from downloading the remote bundle instead of the local dev server
- `--legacy-peer-deps` required for all `npm install` — peer dependency conflicts between Expo SDK 54 packages
- `pointerEvents` as a style prop (not a direct prop) in RN 0.71+
- `babel.config.js` and `metro.config.js` are mandatory — Metro cannot compile the project without them
- **`components/layout/MobileFrame.tsx`** (2026-07-06): en web, si la ventana es más ancha que un teléfono, encuadra la app en una columna centrada de 393px (`APP_MAX_WIDTH`, iPhone 16 Pro) sobre fondo gris; en móvil/Chrome responsive angosto no se aplica. Wrapper en `app/_layout.tsx` envolviendo el `<Stack>`.
- **`constants/layout.ts`** (`APP_WIDTH`): todos los cálculos de layout basados en ancho (carruseles, grillas, cards) usan `APP_WIDTH` en vez de `Dimensions.get('window').width`, para que el layout se calcule contra el ancho del "teléfono" y no del monitor. La altura sigue usando `Dimensions.get('window').height` directo. Son constantes a nivel de módulo — no se recalculan en un resize en vivo, solo en cada carga.

---

## Pending

> All pending frontend items are tracked in `meta-2026-06-10-pending-features.md`. Do not add new pending items here.
