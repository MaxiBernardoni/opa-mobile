import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { WardrobeItem } from '../types'

export function useWardrobe(userId?: string) {
  const [items, setItems] = useState<WardrobeItem[]>([])
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
      setItems((data as WardrobeItem[]) ?? [])
    } finally {
      setLoading(false)
    }
  }

  return { items, loading }
}
