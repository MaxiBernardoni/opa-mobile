import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SizeGuide, SizeGuideEntry } from '../types'

export function useSizeGuide(guideId?: string | null) {
  const [guide, setGuide] = useState<SizeGuide | null>(null)
  const [entries, setEntries] = useState<SizeGuideEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!guideId) { setLoading(false); return }
    fetchGuide(guideId)
  }, [guideId])

  async function fetchGuide(id: string) {
    try {
      const [guideRes, entriesRes] = await Promise.all([
        supabase.from('size_guides').select('*').eq('id', id).maybeSingle(),
        supabase.from('size_guide_entries').select('*').eq('guide_id', id).order('sort_order'),
      ])
      setGuide(guideRes.data as SizeGuide | null)
      setEntries((entriesRes.data ?? []) as SizeGuideEntry[])
    } finally {
      setLoading(false)
    }
  }

  return { guide, entries, loading }
}
