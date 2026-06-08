# Backend — Supabase Integration

This document covers the Supabase client setup, auth flow, data hooks, Zustand store, and TypeScript types used throughout the OPA app.

---

## Stack

- **Supabase JS SDK** (`@supabase/supabase-js`)
- **AsyncStorage** for session persistence in React Native
- **Zustand** for global client-side state

---

## Client Configuration

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

**`.env`** (not committed):
```
EXPO_PUBLIC_SUPABASE_URL=https://vecnktrbjolahcalkbml.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Auth

### Initialization flow (`app/_layout.tsx`)
1. On mount, calls `supabase.auth.getSession()` to restore saved session
2. Calls `supabase.auth.onAuthStateChange()` to listen to real-time changes
3. If session exists, fetches profile from `perfiles`
4. Sets `initialized = true` when done (prevents incorrect UI flash)

### Login
```ts
const { error } = await supabase.auth.signInWithPassword({ email, password })
```

### Sign up
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
clear() // clears the Zustand store
```

### Delete account
Called from `app/settings.tsx`. Two-step flow:
1. Verify password: `supabase.auth.signInWithPassword({ email, password })`
2. Delete via RPC: `supabase.rpc('delete_user')`

The `delete_user()` function must exist in Supabase as a SQL function with `SECURITY DEFINER` so it can delete from `auth.users`. **This function has not been created yet** — account deletion will fail until it is.

Suggested SQL (to be applied by the Database chat):
```sql
create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
begin
  delete from perfiles where id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;
```

---

## Global State — Zustand (`store/useAuthStore.ts`)

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

## Data Hooks

### `hooks/useOutfits.ts`
Fetches outfits with full joins:
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
Fetches a profile by user ID from `perfiles`.

### `hooks/useWardrobe.ts`
Fetches the user's wardrobe items:
```ts
supabase
  .from('prendas_armario')
  .select(`*, garment:prendas(*, brand:marcas(*))`)
  .eq('user_id', userId)
```

---

## TypeScript Types (`types/index.ts`)

Types are aligned to the real Spanish-named schema:

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

## Pending

- [ ] `delete_user()` SQL function in Supabase (required for account deletion — see above)
- [ ] Edge Functions for server-side logic (likes, saves)
- [ ] Realtime subscriptions for live like counts
- [ ] Search queries (full-text search on outfits/garments)
- [ ] Cursor-based pagination in useOutfits
- [ ] Audited RLS policies for all tables
