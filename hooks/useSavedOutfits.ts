import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Outfit } from '../types'

export function useSavedOutfits(userId?: string) {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchSaved(userId)
  }, [userId])

  async function fetchSaved(id: string) {
    try {
      const { data } = await supabase
        .from('outfits_guardados')
        .select('outfit:outfits(*, creator:perfiles(*), garments:outfit_items(*, garment:prendas(*, brand:marcas(*))))')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
      setOutfits((data?.map((row: any) => row.outfit).filter(Boolean) ?? []) as Outfit[])
    } finally {
      setLoading(false)
    }
  }

  return { outfits, loading }
}
