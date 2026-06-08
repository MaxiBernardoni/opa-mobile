import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = 'https://vecnktrbjolahcalkbml.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// SecureStore keys must be ≤ 255 chars; sanitize Supabase's dash-heavy keys.
const toSafeKey = (key: string) =>
  key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255)

// expo-secure-store is native-only. On web we fall back to localStorage.
const storage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) =>
          Promise.resolve(localStorage.getItem(key)),
        setItem: (key: string, value: string) => {
          localStorage.setItem(key, value)
          return Promise.resolve()
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key)
          return Promise.resolve()
        },
      }
    : {
        getItem: (key: string) => SecureStore.getItemAsync(toSafeKey(key)),
        setItem: (key: string, value: string) =>
          SecureStore.setItemAsync(toSafeKey(key), value),
        removeItem: (key: string) =>
          SecureStore.deleteItemAsync(toSafeKey(key)),
      }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
