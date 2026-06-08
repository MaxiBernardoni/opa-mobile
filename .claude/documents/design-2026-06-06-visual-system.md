# Design — Visual System

This document covers OPA's visual design system: color palette, typography, spacing, key UI components, Storage resources, and design principles.

---

## Concept

OPA is a fashion discovery app. The visual experience comes first: immersive, aspirational, and fluid. It feels closer to TikTok/Pinterest than a traditional online store.

**Three pillars:**
1. Outfit discovery
2. Smart personal wardrobe
3. Contextual shopping (completing a look)

---

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `rosaOpa` | `#EB006B` | Primary color: buttons, accents, prices, active indicators |
| `rosaOpaLight` | `rgba(235, 0, 107, 0.2)` | Active tab background in navbar |
| `negro` | `#000000` | Main text, brand card borders |
| `blanco` | `#FFFFFF` | Backgrounds, text on dark backgrounds |
| `grisClaro` | `#838383` | Secondary text, placeholders |
| `grisBorde` | `#F2F2F2` | Borders, secondary backgrounds |
| `grisMedio` | `#D9D9D9` | Skeletons, image placeholders |
| `grisOscuro` | `#4E4E4E` | Tertiary text |
| `bordeTag` | `#A6A6AC` | Style chip borders |

---

## Typography

| Font | Usage |
|---|---|
| **Merge One** (serif) | Section titles, OPA logo as text, headings |
| **Palanquin Dark** (sans) | Buttons, usernames, UI text |
| System default | Prices, short descriptions |

**Font loading:**
- `MergeOne-Regular.ttf` → `assets/fonts/MergeOne-Regular.ttf`
- `PalanquinDark` → via `@expo-google-fonts/palanquin-dark`
- Loaded with `useFonts` in `app/_layout.tsx`

---

## Spacing and Radius

```
Spacing: xs=4, sm=8, md=12, lg=16, xl=24, xxl=32
Radius:  card=15, chip=10, button=8, tag=8, avatar=9999
```

---

## Key Design Components

### Bottom Tab Bar

**Container:**
- `flexDirection: row`, `backgroundColor: blanco`
- `borderTopWidth: 0` — no separator line, use shadow only if needed
- `paddingBottom`: use `useSafeAreaInsets().bottom` (do NOT hardcode 24) to adapt to home indicator
- `paddingTop: 10`, `paddingHorizontal: 8`

**Regular tab (inactive):**
- `flex: 1`, `alignItems: center`, `justifyContent: center`
- `paddingVertical: 6`, `borderRadius: 10`, `marginHorizontal: 2`
- No background

**Regular tab (active):**
- `rosaOpaLight` background applied only to the icon container (`44×44px`, `borderRadius: 10`), NOT the full `flex: 1` tab
- Icon: `_rosa.png` version from Supabase Storage
- Use `expo-image` (`Image` from `expo-image`) with `contentFit="contain"`

**Center tab — Outfits (ALWAYS the same, active or not):**
- `backgroundColor: rosaOpa (#EB006B)`
- `borderRadius: 14`
- `marginTop: -18` (elevated above the nav)
- `marginHorizontal: 4`
- `paddingVertical: 14`
- Pink shadow: `shadowColor: rosaOpa, offset: {0,4}, opacity: 0.45, radius: 10, elevation: 10`
- Icon: `outfit.png` (always the default version, not the rosa variant)
- Icon size: `26×26px`
- **CRITICAL:** use `expo-image` (`Image` from `expo-image`) with `tintColor={colors.blanco}` as a **direct prop** (NOT inside `style`). `RNImage` with `style.tintColor` does not work on web and is deprecated in RN 0.71+.

### Outfit Cards
- **Home carousel**: 220×370px, radius 15, `negro` shadow 8px
- **Vertical feed**: full-screen (100vw × 100vh)
- **Profile grid**: 130×231px (9:16 ratio)
- **Outfits tab card**: 200×356px

### Garment Cards
- Home: 120×150px, radius 15, name + pink price
- Wardrobe: pending

### Brand Cards
- Home: 110×110px square, 1.5px black border, radius 15
- Shows logo if available, uppercase name otherwise

### Floating Labels in Outfit Scroll

**Chip:**
- Background `blanco`, `borderRadius: chip (10)`, `padding: 6`
- Thumbnail: `32×32px`, `borderRadius: 6` — rounded square (NOT circular)
- Name: `fontSize: 11`, `fontFamily: mergeOne`, `color: negro`
- Price: `fontSize: 11`, `fontFamily: mergeOne`, `color: rosaOpa`
- Shadow: `shadowColor: negro, offset: {0,2}, opacity: 0.15, radius: 4, elevation: 4`
- `maxWidth: 160`

**Visual connector (line + dot):**
- White dot: `width: 8, height: 8, borderRadius: 4, backgroundColor: blanco`
  - Positioned at `(position_x, position_y)` coordinates on the image, centered
- Line: `width: 1, backgroundColor: blanco, opacity: 0.85`
  - Dynamic length: distance between the dot and the nearest chip edge
  - Chip is placed to the left of the dot if `position_x > 0.5`, to the right if `position_x ≤ 0.5`
- Implement with absolute `View` or `react-native-svg Line` — do NOT hardcode position

**Positioning:**
- `position_x / position_y` coordinates (0–1 values) relative to image dimensions
- `position_x ≤ 0.5` → chip to the right of the dot
- `position_x > 0.5` → chip to the left of the dot

**Behavior:**
- Always visible on the active item (no tap required — tap-to-reveal applies to the future detail screen)

---

### Outfit Scroll Floating Header

- Position: `absolute, top: 0, left: 0, right: 0, zIndex: 10`
- Background: transparent (no `backgroundColor`)
- Layout: row with `justifyContent: space-between`, `paddingHorizontal: 16`, `paddingVertical: 12`

**Truck icon (left):**
- PNG image from Supabase Storage: `assets/camion_blanco.png`
- Size: `24×24px`, `tintColor: blanco`
- Do NOT use 🚚 emoji

**Center tabs ("tus marcas / Descubrir"):**
- Container: `backgroundColor: rgba(0,0,0,0.4)`, `borderRadius: 20`, `paddingHorizontal: 12`, `paddingVertical: 6`
- Inactive tab: `color: rgba(255,255,255,0.6)`, `fontSize: 13`, `fontWeight: 500`
- Active tab: `color: blanco`, `fontWeight: 700`, `2px` `rosaOpa` underline
- Separator "/": `color: rgba(255,255,255,0.4)`

**"+" button (right):**
- Circle `32×32px`, `borderRadius: 16`, `borderWidth: 2`, `borderColor: blanco`
- Text "+": `color: blanco`, `fontSize: 20`

---

### Action Buttons (Outfit Scroll)

- Vertical column, `position: absolute, right: 16`, vertically centered (~`top: 40%`)
- `gap: 24` between buttons
- **NO numeric counters visible by default**
- **NO "Compartir" text** — icon only

**Each button:**
- PNG or SVG outline icon, `28×28px`, `tintColor: blanco`
- No background, no border
- On activation (like/save): outline → filled transition, spring animation `damping: 10, stiffness: 200`

**Icons:**
- Like: heart outline → filled (`rosaOpa` when active)
- Save: star outline → filled (blanco when active)
- Share: share/diagonal arrow icon — no toggle state

---

### Brand Info (Outfit Scroll)

- Position: `absolute, bottom: [bottom bar height + 16], left: 16`, `right: 80` (to avoid overlapping buttons)

**Brand avatar:**
- `40×40px`, `borderRadius: 9999` (circular)
- Shows `logo_url` from Supabase Storage (`avatars/brands/`)
- Fallback if no logo: black circle with white initial, `fontSize: 16, fontWeight: 700`

**Brand name:**
- `color: blanco`, `fontWeight: 700`, `fontSize: 14`, UPPERCASE
- Verified checkmark (✓ or `rosaOpa` checkmark icon, `fontSize: 12`) inline if `brand.verified === true`

**Outfit title:**
- `color: rgba(255,255,255,0.85)`, `fontSize: 12`, `marginTop: 2`

---

### Outfit Bottom Bar

- Position: `absolute, bottom: 0, left: 0, right: 0`
- `backgroundColor: blanco`
- `borderTopLeftRadius: 15, borderTopRightRadius: 15`
- `paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30` (30 for home indicator clearance)
- Shadow: `shadowColor: negro, offset: {0,-2}, opacity: 0.08, radius: 8, elevation: 10`
- Layout: row `alignItems: center, justifyContent: space-between`

**Left section (bag + price):**
- Bag icon: container `backgroundColor: rosaOpaLight`, `borderRadius: 8`, `padding: 8`, pink bag icon `20×20px`
- Column next to it: label "Precio total" (`fontSize: 11, color: grisClaro, uppercase, letterSpacing: 0.5`) + price (`fontSize: 20, fontWeight: 800, fontFamily: mergeOne, color: negro`)

**Discount badge (center, only if `discount_percent > 0`):**
- Circle `backgroundColor: rosaOpa`, `borderRadius: 9999`, `padding: 8`
- White "%" symbol on top (`fontSize: 14, fontWeight: 700`)
- Below: "X% OFF" (`fontSize: 10, color: negro, fontWeight: 600`) + "Ahorras $Y" (`fontSize: 10, color: grisOscuro`)
- Do not render if no discount

**"Ver outfit" button (right):**
- `backgroundColor: rosaOpa`, `borderRadius: button (8)`
- `paddingHorizontal: 20, paddingVertical: 12`
- Text: "Ver outfit", `color: blanco, fontWeight: 700, fontSize: 14, fontFamily: palanquinDark`

---

## Resources in Supabase Storage

### Bucket `assets` (public)
```
assets/
  logoOPA-transparente.png   # Logo for home header (transparent background)
  logoOPA-blanco.png         # White logo for dark backgrounds
  camion_blanco.png          # Delivery icon
  nav/
    home.png / home_rosa.png
    outfit.png / outfit_rosa.png
    search.png / search_rosa.png
    armario.png / armario_rosa.png
    user.png / user_rosa.png
```

### Bucket `avatars` (public)
```
avatars/
  brands/
    midway_avatar.png
    doblev_avatar.png
    batuk_avatar.jfif
```

**Base URL:** `https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/`

---

## Design Principles

- **Content first**: the image is always the most important element; UI is secondary
- **No overloading**: progressive information disclosure, reveal on interaction
- **Tap to reveal**: in the outfit scroll, info appears on tap
- **No friction**: the inspiration → purchase path must be as short as possible
- **Aspirational**: the app should feel like a curated fashion feed, not a catalog

---

## Pending

- [ ] Skeleton loaders for loading states
- [ ] Like/save animations (spring, bounce)
- [ ] Micro-interactions in bottom tab bar
- [ ] Dark mode (not planned for Demo 1)
- [ ] Outfit detail screen with interactive labels
- [ ] Real outfit and garment images (Midway, Batuk, Doble V)
