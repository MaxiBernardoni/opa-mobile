import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://vecnktrbjolahcalkbml.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// SecureStore keys must be ≤ 255 chars; sanitize Supabase's dash-heavy keys.
const toSafeKey = (key: string) =>
  key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255)

// expo-secure-store is native-only. On web we fall back to localStorage.
// Exported so lib/rememberedAccounts.ts can persist the multi-account switcher
// list under the same platform-appropriate storage.
export const storage =
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

// supabase-js sincroniza sesión entre pestañas del mismo origen (web) vía un
// BroadcastChannel único por proyecto, no por cuenta — un signOut() en una
// pestaña difunde SIGNED_OUT a TODAS las demás, incluso si tenían una cuenta
// distinta logueada (el switcher multi-cuenta de esta app depende de que eso
// no pase: cada pestaña puede representar una cuenta diferente a propósito).
// Se desactiva el canal apenas se crea el cliente: se cierra (deja de recibir
// mensajes de otras pestañas) y se limpia la referencia (para que este mismo
// cliente no intente emitir en un canal cerrado — eso lanzaría una excepción
// dentro de _notifyAllSubscribers y rompería la notificación local de
// onAuthStateChange, no solo la del broadcast). `broadcastChannel` es
// `protected` en el SDK, no público — el cast a `any` es deliberado, y si una
// futura actualización de @supabase/supabase-js renombra o remueve este campo
// interno, este fix deja de aplicarse silenciosamente (sin romper nada, pero
// el bug de "se cierra la sesión en las dos pestañas" volvería).
if (Platform.OS === 'web') {
  const internalAuth = supabase.auth as unknown as { broadcastChannel?: BroadcastChannel | null }
  internalAuth.broadcastChannel?.close()
  internalAuth.broadcastChannel = null
}
