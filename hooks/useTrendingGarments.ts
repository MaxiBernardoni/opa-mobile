import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Garment } from '../types'

export interface TrendingGarment extends Garment {
  recent_saves: number
}

// "Prendas en tendencia" de la Home de marca: RPC get_trending_garments (SQL,
// security definer) ordena el catálogo propio por guardados en los últimos
// `days` días — prendas_guardadas tiene RLS que solo deja ver las filas
// propias a cada usuario, así que el conteo agregado necesita correr en el
// servidor con privilegios elevados (la función nunca expone filas crudas ni
// user_id, solo el count).
export function useTrendingGarments(brandId?: string | null, days = 7, limit = 8) {
  const [garments, setGarments] = useState<TrendingGarment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!brandId) { setGarments([]); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    supabase
      .rpc('get_trending_garments', { p_brand_id: brandId, p_days: days, p_limit: limit })
      .then(({ data }) => {
        if (!cancelled) {
          setGarments((data as TrendingGarment[]) ?? [])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [brandId, days, limit])

  return { garments, loading }
}
