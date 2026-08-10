import { supabase } from './supabase'

// Cliente para la API Hono en opa-backend (Edge Function `api`). Antes de
// esto, opa-mobile nunca llamaba a la API — todo iba directo a Supabase vía
// RLS. Los endpoints de like/save la usan para tener rate limiting server-side
// (imposible de garantizar solo con RLS) y bloquear cuentas de marca en un
// solo lugar en vez de confiar en que el cliente oculte los botones.
const API_BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/api`

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status)
  return body
}

export const api = {
  likeOutfit: (outfitId: string) => apiFetch(`/outfits/${outfitId}/like`, { method: 'POST' }),
  unlikeOutfit: (outfitId: string) => apiFetch(`/outfits/${outfitId}/like`, { method: 'DELETE' }),
  saveOutfit: (outfitId: string) => apiFetch(`/outfits/${outfitId}/save`, { method: 'POST' }),
  unsaveOutfit: (outfitId: string) => apiFetch(`/outfits/${outfitId}/save`, { method: 'DELETE' }),
}
