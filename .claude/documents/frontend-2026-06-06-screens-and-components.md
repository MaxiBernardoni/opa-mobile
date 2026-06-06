# Frontend — Pantallas y Componentes

## Stack
- React Native + Expo SDK 54 (managed workflow)
- Expo Router v6 (file-based routing)
- NativeWind instalado (pero se usa principalmente StyleSheet)
- Expo Image (`expo-image`) para imágenes con caché
- React Native Reanimated para animaciones
- Zustand para estado global

---

## Estructura de rutas

```
app/
  _layout.tsx          # Root layout: fuentes, auth init, Stack navigator
  (tabs)/
    _layout.tsx        # Tab layout con BottomTabBar custom
    index.tsx          # Home
    outfits.tsx        # Outfit Scroll (TikTok-style)
    search.tsx         # Búsqueda (placeholder)
    wardrobe.tsx       # Armario (placeholder)
    profile.tsx        # Perfil
  auth/
    index.tsx          # Login/Signup modal
```

---

## Pantallas implementadas

### Home (`app/(tabs)/index.tsx`)
- Header: logo OPA transparente (izquierda) + ícono camión blanco (derecha)
- **Outfit Carousel** con efecto de profundidad:
  - `Animated.FlatList` horizontal, `snapToInterval`
  - `scrollX` interpolado → `scale` (0.84→1→0.84) y `opacity` (0.65→1→0.65)
  - Tarjetas: 220×370px, radio 15, sombra
  - Padding lateral = `(screenWidth - 220) / 2` para centrar
- **Últimas Prendas**: scroll horizontal, tarjetas 120×150, nombre + precio rosa
- **Marcas**: scroll horizontal, tarjetas 110×110 cuadradas con borde negro. Muestra logo si existe, nombre si no
- **Lo Último que Viste**: 4 tarjetas grises placeholder (110×150)
- Conectado a datos reales via `useOutfits()`

### Outfit Scroll (`app/(tabs)/outfits.tsx`)
- `FlatList` full-screen con `pagingEnabled` — scroll vertical tipo TikTok
- Header flotante: camión (izq) + tabs "Tus marcas / Descubrir" (centro) + botón + (der)
- `OutfitScrollItem` por item: imagen full-screen + UI superpuesta
- Labels flotantes de prendas con thumbnail + nombre + precio
- Botones de acción: Like · Guardar · Compartir (estado local)
- Info de marca abajo izquierda: avatar + nombre + título outfit
- Bottom bar: precio total calculado de las prendas + "Ver outfit"
- Conectado a `useOutfits()`

### Perfil (`app/(tabs)/profile.tsx`)
Tiene tres estados:

1. **Inicializando** (`!initialized`): `ActivityIndicator` centrado
2. **Sin sesión** (`!session`): Auth gate
   - Logo OPA, título "Tu perfil te espera", subtítulo
   - Botón "Iniciar sesión" (rosa) + "Crear cuenta" (borde rosa)
   - Ambos navegan a `/auth`
3. **Con sesión**: perfil completo
   - Avatar circular 110×110 (inicial si no hay foto)
   - Username, nombre, bio, style tags
   - Stats: Seguidores · Seguidos · Outfits · Guardados
   - Navbar interna: Grid · Favoritos · Pedidos
   - Grid 3 columnas de outfits (130×231px) con contador likes
   - Botón logout (ícono ⚙ arriba derecha)

### Auth (`app/auth/index.tsx`)
- Modal con `presentation: 'modal'`, `animation: 'slide_from_bottom'`
- Switcher login / signup
- Login: email + password → `supabase.auth.signInWithPassword`
- Signup: username + nombre + email + password → `supabase.auth.signUp`
- Validación básica (campos vacíos, password mínimo 6 chars)
- Redirige a `/(tabs)` al completar

---

## Componentes

### Navegación
**`components/navigation/BottomTabBar.tsx`**
- 5 tabs: Home · Outfits (centro) · Search · Wardrobe · Profile
- Iconos PNG desde Supabase Storage (`assets/nav/`)
- Tab central (Outfits): fondo rosa (`#EB006B`), elevado `marginTop: -18`, sombra rosa
  - Usa `Image` de React Native (no expo-image) con `tintColor: 'white'` para el ícono
- Tabs regulares: `expo-image`, activo muestra ícono `_rosa.png` + fondo `rosaOpaLight`
- Sin etiquetas de texto

### Home
- **`SectionHeader`**: título UPPERCASE bold (Merge One) + flecha → rosa clickeable
- **`HorizontalSlider`**: wrapper genérico de `ScrollView` horizontal
- **`BrandsSlider`**: slider específico de marcas

### Outfit
- **`OutfitScrollItem`**: item completo del feed vertical
- **`OutfitCard`**: tarjeta de outfit para el carousel
- **`OutfitGarmentLabel`**: chip flotante con thumbnail circular + nombre + precio
- **`OutfitBottomBar`**: barra inferior blanca con precio total + botón "Ver outfit"

### Profile
- **`ProfileHeader`**: avatar + username + nombre + bio + tags
- **`ProfileStats`**: fila de estadísticas
- **`ProfileNavbar`**: tabs internos Grid/Favoritos/Pedidos con indicador activo
- **`OutfitGrid`**: grid 3 columnas de outfits

### UI primitivos
- **`Button`**: botón primario/secundario con variantes
- **`Tag`**: chip de estilo con borde
- **`Avatar`**: imagen circular con fallback a inicial
- **`Badge`**: indicador numérico

---

## Design Tokens

Definidos en `constants/`:

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
mergeOne: 'MergeOne-Regular'      // Títulos y secciones
palanquinDark: 'PalanquinDark'    // Botones, usernames

// radius.ts
card: 15, chip: 10, button: 8, tag: 8, avatar: 9999

// spacing.ts
xs:4, sm:8, md:12, lg:16, xl:24, xxl:32
```

**Fuente Merge One:** archivo `assets/fonts/MergeOne-Regular.ttf` cargado con `expo-font` en `_layout.tsx`.

---

## Configuración técnica relevante

- `newArchEnabled: false` en `app.json` (incompatible con RN 0.81.5)
- `"updates": { "enabled": false }` en `app.json` (evita que Expo Go descargue bundle remoto)
- `--legacy-peer-deps` requerido en todos los `npm install`
- `pointerEvents` como prop de style (no como prop directo) en RN 0.71+
- `babel.config.js` y `metro.config.js` son obligatorios

---

## Pendientes

- [ ] Pantalla de búsqueda funcional
- [ ] Pantalla de armario con lógica real
- [ ] Pantallas de detalle: `outfit/[id]` y `product/[id]`
- [ ] Marcar prendas del armario que ya tiene el usuario en el outfit scroll
- [ ] Animaciones de like/guardar
- [ ] Skeleton loading en lugar de ActivityIndicator
