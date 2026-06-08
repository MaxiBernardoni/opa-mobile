import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Outfit } from '../types'

export function useOutfits(creatorId?: string) {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOutfits()
  }, [creatorId])

  async function fetchOutfits() {
    try {
      let query = supabase
        .from('outfits')
        .select(`
          *,
          creator:perfiles(*),
          garments:outfit_items(*, garment:prendas(*, brand:marcas(*)))
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (creatorId) query = query.eq('creator_id', creatorId)

      const { data, error } = await query
      if (error) throw error
      setOutfits(data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { outfits, loading, error, refetch: fetchOutfits }
}
