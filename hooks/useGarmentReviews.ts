import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface GarmentReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user?: { username: string; avatar_url: string | null } | null
}

// Lee `reseñas` de una prenda. Hoy la tabla está vacía (requiere `order_id`,
// o sea compra verificada, y todavía no hay flujo de compra) — el hook queda
// listo para cuando existan filas reales; el caller maneja el estado vacío.
export function useGarmentReviews(garmentId?: string) {
  const [reviews, setReviews] = useState<GarmentReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!garmentId) { setLoading(false); return }
    setLoading(true)
    supabase
      .from('reseñas')
      .select('id, rating, comment, created_at, user:perfiles(username, avatar_url)')
      .eq('garment_id', garmentId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []) as unknown as GarmentReview[])
        setLoading(false)
      })
  }, [garmentId])

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return { reviews, average, loading }
}
