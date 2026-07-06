import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Brand, Garment, Outfit } from '../types'

interface BrandData {
  brand: Brand | null
  garments: Garment[]   // catálogo (prendas de la marca)
  outfits: Outfit[]     // outfits publicados por la cuenta de la marca
  followersCount: number
  loading: boolean
}

// Carga todo lo que necesita el perfil público de una marca.
// Nota: outfits y seguidores dependen de marcas.profile_id (la cuenta Auth de la
// marca). Mientras el onboarding de marcas no exista, profile_id es null y ambos
// quedan vacíos — el catálogo (prendas por brand_id) sí tiene datos reales.
export function useBrand(brandId?: string): BrandData {
  const [brand, setBrand] = useState<Brand | null>(null)
  const [garments, setGarments] = useState<Garment[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!brandId) {
      setLoading(false)
      return
    }
    fetchAll(brandId)
  }, [brandId])

  async function fetchAll(id: string) {
    setLoading(true)
    try {
      const { data: brandRow } = await supabase
        .from('marcas')
        .select('*')
        .eq('id', id)
        .single()
      setBrand(brandRow)

      // Catálogo: prendas de esta marca
      const { data: prendas } = await supabase
        .from('prendas')
        .select('*, brand:marcas(*)')
        .eq('brand_id', id)
        .order('created_at', { ascending: false })
      setGarments((prendas as Garment[]) ?? [])

      const profileId = brandRow?.profile_id
      if (profileId) {
        const { data: brandOutfits } = await supabase
          .from('outfits')
          .select('*, creator:perfiles(*), garments:outfit_items(*, garment:prendas(*, brand:marcas(*)))')
          .eq('creator_id', profileId)
          .order('created_at', { ascending: false })
        setOutfits((brandOutfits as Outfit[]) ?? [])

        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileId)
        setFollowersCount(count ?? 0)
      } else {
        setOutfits([])
        setFollowersCount(0)
      }
    } finally {
      setLoading(false)
    }
  }

  return { brand, garments, outfits, followersCount, loading }
}
