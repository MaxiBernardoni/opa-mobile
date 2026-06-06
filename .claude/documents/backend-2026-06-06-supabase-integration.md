# Backend — Supabase Integration

## Stack
- **Supabase JS SDK** (`@supabase/supabase-js`)
- **AsyncStorage** para persistencia de sesión en React Native
- **Zustand** para estado global en el cliente

---

## Configuración del cliente

**`lib/supabase.ts`**
```ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

**`.env`** (no commiteado):
```
EXPO_PUBLIC_SUPABASE_URL=https://vecnktrbjolahcalkbml.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Auth

### Flujo de inicialización (`app/_layout.tsx`)
1. Al montar, llama `supabase.auth.getSession()` para restaurar sesión guardada
2. Llama `supabase.auth.onAuthStateChange()` para escuchar cambios en tiempo real
3. Si hay sesión, fetchea el perfil desde `perfiles`
4. Setea `initialized = true` cuando termina (evita flash de UI incorrecta)

### Login
```ts
const { error } = await supabase.auth.signInWithPassword({ email, password })
```

### Registro
```ts
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      username: username.toLowerCase().replace(/\s/g, ''),
      display_name: displayName || username,
    },
  },
})
```

### Logout
```ts
await supabase.auth.signOut()
clear() // limpia el store de Zustand
```

---

## Estado global — Zustand (`store/useAuthStore.ts`)

```ts
interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  initialized: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setInitialized: (initialized: boolean) => void
  clear: () => void
}
```

---

## Hooks de datos

### `hooks/useOutfits.ts`
Trae outfits con joins completos:
```ts
supabase
  .from('outfits')
  .select(`
    *,
    creator:perfiles(*),
    garments:outfit_items(
      *,
      garment:prendas(*, brand:marcas(*))
    )
  `)
  .order('created_at', { ascending: false })
  .limit(20)
```

### `hooks/useProfile.ts`
Trae perfil por ID de usuario desde `perfiles`.

### `hooks/useWardrobe.ts`
Trae prendas del armario del usuario:
```ts
supabase
  .from('prendas_armario')
  .select(`*, garment:prendas(*, brand:marcas(*))`)
  .eq('user_id', userId)
```

---

## Tipos TypeScript (`types/index.ts`)

Los tipos están alineados al schema real en español:

```ts
export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  tags: string[]
  followers_count: number
  following_count: number
  outfits_count: number
  is_brand: boolean
  created_at: string
}

export interface Brand {
  id: string
  name: string
  logo_url: string | null
  instagram_handle: string | null
  website: string | null
  location: string | null
  tags: string[]
}

export interface Garment {
  id: string
  brand_id: string
  name: string
  price: number
  category: string | null
  image_url: string | null
  color: string | null
  available_sizes: string[]
  created_at: string
  brand?: Brand
}

export interface OutfitItem {
  outfit_id: string
  garment_id: string
  position_x: number | null
  position_y: number | null
}

export interface OutfitItemWithData extends OutfitItem {
  garment?: Garment
}

export interface Outfit {
  id: string
  creator_id: string | null
  title: string | null
  cover_image_url: string | null
  occasion: string | null
  style: string | null
  likes_count: number
  created_at: string
  creator?: Profile
  garments?: OutfitItemWithData[]
}
```

---

## Pendientes

- [ ] Edge Functions para lógica server-side (likes, saves)
- [ ] Realtime subscriptions para likes en vivo
- [ ] Queries de búsqueda (full-text search en outfits/prendas)
- [ ] Paginación en useOutfits (cursor-based)
- [ ] RLS policies auditadas para todas las tablas
