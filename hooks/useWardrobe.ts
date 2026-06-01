import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Garment } from '../types'

export function useWardrobe(userId?: string) {
  const [garments, setGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    fetchWardrobe(userId)
  }, [userId])

  async function fetchWardrobe(id: string) {
    try {
      const { data } = await supabase
        .from('prendas_armario')
        .select('*, garment:prendas(*, brand:marcas(*))')
        .eq('user_id', id)
      setGarments(data?.map((w: any) => w.garment) || [])
    } finally {
      setLoading(false)
    }
  }

  return { garments, loading }
}
