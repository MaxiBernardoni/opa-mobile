import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Brand } from '../types'

interface MyBrandData {
  brand: Brand | null
  loading: boolean
}

// Carga la marca de la cuenta logueada (marcas.profile_id = userId).
// Solo devuelve algo para cuentas de marca (perfiles.is_brand = true); para
// usuarios normales no hay fila en `marcas` con su profile_id y brand queda null.
export function useMyBrand(userId?: string): MyBrandData {
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setBrand(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('marcas')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setBrand((data as Brand) ?? null)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [userId])

  return { brand, loading }
}
