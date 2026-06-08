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
    _layout.tsx        # Tab layout with custom BottomTabBar
    index.tsx          # Home
    outfits.tsx        # Outfit Scroll (TikTok-style)
    search.tsx         # Search (placeholder)
    wardrobe.tsx       # Wardrobe (placeholder)
    profile.tsx        # Profile
  auth/
    index.tsx          # Login/Signup modal
  settings.tsx         # Settings screen
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
- Full-screen `FlatList` with `pagingEnabled` — vertical TikTok-style scroll
- Floating header: truck (left) + "Your brands / Discover" tabs (center) + + button (right)
- `OutfitScrollItem` per item: full-screen image + overlaid UI
- Floating garment labels with thumbnail + name + price
- Action buttons: Like · Save · Share (local state)
- Brand info bottom-left: avatar + name + outfit title
- Bottom bar: total price calculated from garments + "View outfit"
- Connected to `useOutfits()`

### Profile (`app/(tabs)/profile.tsx`)
Three states:

1. **Initializing** (`!initialized`): centered `ActivityIndicator`
2. **No session** (`!session`): Auth gate
   - OPA logo, title, subtitle
   - "Sign in" button (pink) + "Create account" button (pink border)
   - Both navigate to `/auth`
3. **With session**: full profile
   - Circular avatar 110×110 (initial letter if no photo)
   - Username, name, bio, style tags
   - Stats: Followers · Following · Outfits · Saved
   - Internal navbar: Grid · Favorites · Orders
   - 3-column outfit grid (130×231px) with like counter
   - Logout button (⚙ icon, top right)

### Auth (`app/auth/index.tsx`)
- Modal with `presentation: 'modal'`, `animation: 'slide_from_bottom'`
- Login / signup switcher
- Login: email + password → `supabase.auth.signInWithPassword`
- Signup: username + name + email + password → `supabase.auth.signUp`
- Basic validation (empty fields, minimum 6-char password)
- Redirects to `/(tabs)` on completion

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

**Not implemented yet ❌**
- Editar perfil (edit name, bio, avatar, tags)
- Seguridad (change password, 2FA)
- Email y notificaciones
- Preferencias de estilo
- Mis medidas
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

---

## Pending

- [x] `delete_user()` RPC function in Supabase — ✅ created (migration `create_delete_user_function`)
- [ ] Settings sub-screens: edit profile, security, notifications, measurements, etc.
- [ ] Functional search screen
- [ ] Wardrobe screen with real logic
- [ ] Detail screens: `outfit/[id]` and `product/[id]`
- [ ] Highlight wardrobe garments the user already owns in the outfit scroll
- [ ] Like/save animations
- [ ] Skeleton loading instead of ActivityIndicator
