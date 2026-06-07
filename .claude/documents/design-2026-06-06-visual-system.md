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
- 5 tabs with no text labels, icons only (PNG)
- Center tab (Outfits) elevated `marginTop: -18`
- Pink background `#EB006B` + pink shadow + radius 14
- White center icon (`tintColor: white` via RN Image)
- Active tabs: `rosaOpaLight` background + `_rosa.png` icon

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
- White chip with circular thumbnail + name + price
- Positioned using `position_x / position_y` coordinates (0 to 1) relative to the image
- Revealed on tap (tap to reveal interaction)

### Action Buttons (Outfit Scroll)
- Vertical column on the right side
- Like ♡ · Save · Share
- Local state with animation on activation

### Outfit Bottom Bar
- White panel with radius 15 at the bottom
- Total price calculated as sum of garments
- Full-width pink "View outfit" button

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
