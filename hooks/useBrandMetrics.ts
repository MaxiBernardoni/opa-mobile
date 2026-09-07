import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

interface BrandMetricsData {
  likes: number
  saves: number
  followers: number
  loading: boolean
}

// Métricas reales para la Home de marca: likes+saves vienen del endpoint ya
// desplegado `/brands/me/metrics` (agrega sobre outfits con prendas de la
// marca); seguidores es la misma cuenta directa que ya usa useBrand.ts.
// Visitas/clics quedan afuera a propósito — no hay tabla de tracking para eso
// todavía (ver `note` de BrandMetrics en lib/api.ts).
export function useBrandMetrics(brandProfileId?: string | null) {
  const [data, setData] = useState<BrandMetricsData>({ likes: 0, saves: 0, followers: 0, loading: true })

  useEffect(() => {
    if (!brandProfileId) {
      setData({ likes: 0, saves: 0, followers: 0, loading: false })
      return
    }
    let cancelled = false
    setData((d) => ({ ...d, loading: true }))
    Promise.all([
      api.getBrandMetrics().catch(() => ({ likes: 0, saves: 0 })),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', brandProfileId),
    ]).then(([metrics, followsRes]) => {
      if (cancelled) return
      setData({
        likes: metrics.likes ?? 0,
        saves: metrics.saves ?? 0,
        followers: followsRes.count ?? 0,
        loading: false,
      })
    })
    return () => { cancelled = true }
  }, [brandProfileId])

  return data
}
