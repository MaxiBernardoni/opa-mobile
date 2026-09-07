import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Question } from '../types'

// Q&A público de una prenda, estilo Mercado Libre: todas las preguntas hechas
// sobre ESA prenda (respondidas o no), visibles para cualquiera que visite la
// publicación — no solo para quien preguntó o la marca dueña. RLS pública
// habilitada para filas con garment_id (migración `public_read_garment_questions`).
export function useGarmentQuestions(garmentId?: string) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!garmentId) { setQuestions([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('preguntas')
      .select('*, user:perfiles(username, avatar_url)')
      .eq('garment_id', garmentId)
      .order('created_at', { ascending: false })
    setQuestions((data as Question[]) ?? [])
    setLoading(false)
  }, [garmentId])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { questions, loading, refetch: fetchAll }
}
