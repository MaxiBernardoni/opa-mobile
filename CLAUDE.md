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
-- profiles: id, username, full_name, bio, avatar_url, style_tags[], followers_count, following_count, outfits_count
-- brands: id, name, logo_url, verified
-- garments: id, brand_id, name, price, slot (torso/piernas/calzado/extras), image_url, colors[], sizes[], style_tags[]
-- outfits: id, creator_id, brand_id, title, description, image_url, total_price, discount_percent, occasion[], style_tags[], likes_count, saves_count
-- outfit_garments: outfit_id, garment_id, position_x, position_y  ← coordenadas de los labels flotantes
-- outfit_likes: user_id, outfit_id
-- outfit_saves: user_id, outfit_id
-- wardrobe: id, user_id, garment_id, size, color, source (purchase/manual)
```

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
- Avatar circular 110×110 + username (Palanquin Dark) + nombre real + bio
- Style tags como chips con borde gris
- Stats: Seguidores · Seguidos · Outfits · Guardados
- Navbar interna: Grid · Favoritos · Pedidos (indicador rosa activo)
- Grid 3 columnas de outfits (130×231px) con contador de likes

---

## Decisiones técnicas tomadas

- **`--legacy-peer-deps` obligatorio** en todos los `npm install`. Conflicto entre `react-native@0.81.5` y `react-native-screens@4.25.0` (requiere RN ≥ 0.82). No actualizar RN sin revisar compatibilidad con Expo SDK 54.
- **`package.json` main = `"expo-router/entry"`** — ya configurado, no cambiar.
- **Mock data en `constants/mockData.ts`** — la app funciona sin Supabase para la Demo 1. Contiene 5 outfits, 5 marcas, 5 prendas con imágenes de picsum.photos.
- **`@react-native-async-storage/async-storage` está en v3** (se esperaba v2.2.0) — genera warning pero funciona. No downgradearlo sin probar.
- **Fuente Merge One** no se pudo descargar automáticamente (red corporativa bloquea fonts.gstatic.com). La línea está comentada en `app/_layout.tsx`.
- **Supabase migrations pendientes** — los schemas están definidos arriba pero aún no se aplicaron al proyecto `vecnktrbjolahcalkbml`.

---

## Notas de producto

- **Content first:** la imagen siempre es lo más importante, la UI es secundaria
- **No sobrecargar:** evitar texto excesivo, información progresiva
- **Tap para revelar:** en el outfit scroll, la info aparece al interactuar
- **Compra contextual:** cuando el usuario tiene prendas en su armario que coinciden con un outfit, marcarlas como "ya tenés esto"
- **Sin fricción:** el flujo inspiración → compra debe ser lo más corto posible
- La app debe sentirse más cercana a **TikTok/Pinterest** que a cualquier tienda online

---

## Estado actual

- [x] Setup del proyecto y configuración base
- [x] Design tokens (colores, tipografías, spacing, radius)
- [x] BottomTabBar custom con tab OPA destacado
- [x] Home screen con carousels horizontales
- [x] Outfit Scroll screen (full-screen, paginado vertical)
- [x] Profile screen con grid de outfits
- [x] Data mock (no requiere Supabase)

## Pendientes

- [ ] Fuente Merge One en `assets/fonts/MergeOne-Regular.ttf`
- [ ] `.env` con `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Migraciones de Supabase (schemas definidos arriba)
- [ ] Reemplazar mock data por queries reales
- [ ] Pantallas de detalle: `outfit/[id]` y `product/[id]`
- [ ] Pantalla de búsqueda funcional
- [ ] Pantalla de armario con lógica real
