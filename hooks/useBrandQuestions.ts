import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Question } from '../types'

interface Options {
  limit?: number
}

// Preguntas SIN responder de una marca (tabla `preguntas`, nueva). El Home
// pide solo las primeras 3 (limit) + el total real para el badge y el botón
// "ver todas"; app/brand/questions.tsx pide el listado completo (sin limit).
export function useBrandQuestions(brandId?: string | null, { limit }: Options = {}) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!brandId) { setQuestions([]); setTotalCount(0); setLoading(false); return }
    setLoading(true)

    let query = supabase
      .from('preguntas')
      .select('*, user:perfiles(username, avatar_url), garment:prendas(name)')
      .eq('brand_id', brandId)
      .is('answer', null)
      .order('created_at', { ascending: false })
    if (limit) query = query.limit(limit)

    const [{ data }, { count }] = await Promise.all([
      query,
      supabase.from('preguntas').select('*', { count: 'exact', head: true }).eq('brand_id', brandId).is('answer', null),
    ])
    setQuestions((data as Question[]) ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [brandId, limit])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function answer(questionId: string, answerText: string) {
    const { error } = await supabase
      .from('preguntas')
      .update({ answer: answerText, answered_at: new Date().toISOString() })
      .eq('id', questionId)
    if (!error) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
      setTotalCount((prev) => Math.max(0, prev - 1))
    }
    return { error }
  }

  return { questions, totalCount, loading, refetch: fetchAll, answer }
}
