import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SizeGuide } from '../types'

// prendas.category (torso/piernas/calzado/extras) usa otro vocabulario que
// size_guides.category (tops/bottoms/calzado/extras) — mismo mapeo que ya usa
// measurementCols() en app/product/[id].tsx.
function toGuideCategory(category: string): string {
  if (category === 'torso') return 'tops'
  if (category === 'piernas') return 'bottoms'
  return category
}

// Guías disponibles para una categoría de prenda: las 10 default de OPA
// (brand_id null) + las propias de la marca si tuviera alguna creada.
export function useSizeGuidesForCategory(category: string | null, brandId?: string | null) {
  const [guides, setGuides] = useState<SizeGuide[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!category) { setGuides([]); return }
    setLoading(true)
    const guideCategory = toGuideCategory(category)
    let query = supabase.from('size_guides').select('*').eq('category', guideCategory)
    query = brandId ? query.or(`brand_id.is.null,brand_id.eq.${brandId}`) : query.is('brand_id', null)
    query.order('name').then(({ data }) => {
      setGuides((data ?? []) as SizeGuide[])
      setLoading(false)
    })
  }, [category, brandId])

  return { guides, loading }
}
