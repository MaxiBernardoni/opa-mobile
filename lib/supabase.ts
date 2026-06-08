import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = 'https://vecnktrbjolahcalkbml.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// SecureStore keys must be ≤ 255 chars and alphanumeric; Supabase uses keys
// with dashes so we hash them to a safe format.
const toSafeKey = (key: string) =>
  key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255)

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(toSafeKey(key)),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(toSafeKey(key), value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(toSafeKey(key)),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
