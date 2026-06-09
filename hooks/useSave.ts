import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

export function useSave(outfitId: string, initialCount: number) {
  const { session } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    supabase
      .from('outfits_guardados')
      .select('outfit_id')
      .eq('outfit_id', outfitId)
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data))
  }, [outfitId, session])

  const toggle = useCallback(async () => {
    if (!session || loading) return
    setLoading(true)
    if (saved) {
      await supabase
        .from('outfits_guardados')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', session.user.id)
      setSaved(false)
      setCount((c) => Math.max(0, c - 1))
    } else {
      const { error } = await supabase
        .from('outfits_guardados')
        .insert({ outfit_id: outfitId, user_id: session.user.id })
      if (!error || error.code === '23505') {
        setSaved(true)
        setCount((c) => c + 1)
      }
    }
    setLoading(false)
  }, [saved, loading, outfitId, session])

  return { saved, count, toggle }
}
