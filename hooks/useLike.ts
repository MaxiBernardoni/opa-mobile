import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

export function useLike(outfitId: string, initialCount: number) {
  const { session } = useAuthStore()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    supabase
      .from('outfit_likes')
      .select('outfit_id')
      .eq('outfit_id', outfitId)
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data))
  }, [outfitId, session])

  const toggle = useCallback(async () => {
    if (!session || loading) return
    setLoading(true)
    if (liked) {
      await supabase
        .from('outfit_likes')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', session.user.id)
      setLiked(false)
      setCount((c) => Math.max(0, c - 1))
    } else {
      const { error } = await supabase
        .from('outfit_likes')
        .insert({ outfit_id: outfitId, user_id: session.user.id })
      if (!error || error.code === '23505') {
        setLiked(true)
        setCount((c) => c + 1)
      }
    }
    setLoading(false)
  }, [liked, loading, outfitId, session])

  return { liked, count, toggle }
}
