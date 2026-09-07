import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { GarmentReview } from './useGarmentReviews'

// "Opiniones recientes" de la Home de marca: últimas reseñas entre TODAS las
// prendas de la marca (no una sola, a diferencia de useGarmentReviews). Recibe
// los garment_id ya resueltos (los trae useBrand) en vez de hacer un join por
// brand_id — reseñas no tiene brand_id propio.
export function useBrandReviews(garmentIds: string[], limit = 3) {
  const [reviews, setReviews] = useState<(GarmentReview & { garment?: { name: string } | null })[]>([])
  const [loading, setLoading] = useState(true)
  const key = garmentIds.join(',')

  useEffect(() => {
    if (garmentIds.length === 0) { setReviews([]); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    supabase
      .from('reseñas')
      .select('id, rating, comment, created_at, user:perfiles(username, avatar_url), garment:prendas(name)')
      .in('garment_id', garmentIds)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (!cancelled) {
          setReviews((data as any) ?? [])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, limit])

  return { reviews, loading }
}
