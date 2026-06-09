import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Garment } from '../types'

interface SavedGarmentRow {
  garment_id: string
  garment: Garment
}

export function useSavedGarments(userId?: string) {
  const [garments, setGarments] = useState<SavedGarmentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchSaved(userId)
  }, [userId])

  async function fetchSaved(id: string) {
    try {
      const { data } = await supabase
        .from('prendas_guardadas')
        .select('garment_id, garment:prendas(*, brand:marcas(*))')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
      setGarments((data ?? []) as unknown as SavedGarmentRow[])
    } finally {
      setLoading(false)
    }
  }

  function refetch() {
    if (userId) fetchSaved(userId)
  }

  return { garments, loading, refetch }
}
