# Design — Sistema Visual

## Concepto
OPA es una app de descubrimiento de moda. La experiencia visual es lo primero: inmersiva, aspiracional y fluida. Se siente más cercana a TikTok/Pinterest que a una tienda online tradicional.

**Tres pilares:**
1. Descubrimiento de outfits
2. Armario personal inteligente
3. Compra contextual (completar un look)

---

## Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `rosaOpa` | `#EB006B` | Color primario: botones, acentos, precios, indicadores activos |
| `rosaOpaLight` | `rgba(235, 0, 107, 0.2)` | Fondo de tab activo en navbar |
| `negro` | `#000000` | Textos principales, bordes de tarjetas de marcas |
| `blanco` | `#FFFFFF` | Fondos, textos sobre fondo oscuro |
| `grisClaro` | `#838383` | Textos secundarios, placeholders |
| `grisBorde` | `#F2F2F2` | Bordes, fondos secundarios |
| `grisMedio` | `#D9D9D9` | Skeletons, placeholders de imagen |
| `grisOscuro` | `#4E4E4E` | Textos terciarios |
| `bordeTag` | `#A6A6AC` | Bordes de chips de estilo |

---

## Tipografía

| Font | Uso |
|---|---|
| **Merge One** (serif) | Títulos de sección, logo OPA en text, headings |
| **Palanquin Dark** (sans) | Botones, usernames, textos de UI |
| System default | Precios, descripciones cortas |

**Carga de fuentes:**
- `MergeOne-Regular.ttf` → `assets/fonts/MergeOne-Regular.ttf`
- `PalanquinDark` → via `@expo-google-fonts/palanquin-dark`
- Cargadas con `useFonts` en `app/_layout.tsx`

---

## Espaciado y radios

```
Spacing: xs=4, sm=8, md=12, lg=16, xl=24, xxl=32
Radius:  card=15, chip=10, button=8, tag=8, avatar=9999
```

---

## Componentes de diseño clave

### Bottom Tab Bar
- 5 tabs sin texto, solo íconos PNG
- Tab central (Outfits) elevado `marginTop: -18`
- Fondo rosa `#EB006B` + sombra rosa + radio 14
- Ícono central blanco (`tintColor: white` via RNImage)
- Tabs activos: fondo `rosaOpaLight` + ícono `_rosa.png`

### Cards de Outfit
- **Carousel Home**: 220×370px, radio 15, sombra `negro` 8px
- **Feed vertical**: full-screen (100vw × 100vh)
- **Grid perfil**: 130×231px (ratio 9:16)
- **Card outfits tab**: 200×356px

### Cards de Prendas
- Home: 120×150px, radio 15, nombre + precio rosa
- Armario: pendiente

### Cards de Marcas
- Home: 110×110px cuadradas, borde negro 1.5px, radio 15
- Muestra logo si existe, nombre uppercase si no

### Labels flotantes en Outfit Scroll
- Chip blanco con thumbnail circular + nombre + precio
- Posicionados con coordenadas `position_x / position_y` (0 a 1) relativas a la imagen
- Aparecen al interactuar (tap para revelar)

### Botones de acción (Outfit Scroll)
- Columna vertical a la derecha
- Like ♡ · Guardar · Compartir
- Estado local con animación al activar

### Bottom Bar del Outfit
- Panel blanco radio 15 en la parte inferior
- Precio total calculado de la suma de prendas
- Botón "Ver outfit" rosa full-width

---

## Recursos en Supabase Storage

### Bucket `assets` (público)
```
assets/
  logoOPA-transparente.png   # Logo para header home (fondo transparente)
  logoOPA-blanco.png         # Logo blanco para fondos oscuros
  camion_blanco.png          # Ícono de delivery
  nav/
    home.png / home_rosa.png
    outfit.png / outfit_rosa.png
    search.png / search_rosa.png
    armario.png / armario_rosa.png
    user.png / user_rosa.png
```

### Bucket `avatars` (público)
```
avatars/
  brands/
    midway_avatar.png
    doblev_avatar.png
    batuk_avatar.jfif
```

**URL base:** `https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/`

---

## Principios de diseño

- **Content first**: la imagen siempre es lo más importante, la UI es secundaria
- **No sobrecargar**: información progresiva, revelar al interactuar
- **Tap para revelar**: en el outfit scroll la info aparece al tocar
- **Sin fricción**: el camino inspiración → compra debe ser lo más corto posible
- **Aspiracional**: la app debe sentirse como un feed de moda curado, no un catálogo

---

## Pendientes

- [ ] Skeleton loaders para estados de carga
- [ ] Animaciones de like/guardar (spring, bounce)
- [ ] Micro-interacciones en bottom tab bar
- [ ] Modo oscuro (no planificado para Demo 1)
- [ ] Pantalla de detalle de outfit con labels interactivos
- [ ] Imágenes reales de outfits y prendas (Midway, Batuk, Doble V)
