import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'

export type FollowListType = 'followers' | 'following'

// Perfil de la lista + (si es una cuenta de marca) el id real de `marcas`, para
// poder navegar a /marca/[id] en vez de /user/[id] — la fila de `follows` solo
// tiene el profile_id, no el id de `marcas`.
export interface FollowListItem extends Profile {
  brandId?: string
}

// Sigue el mismo patrón de 2 queries que useFollowedBrandIds: primero los ids
// desde `follows`, después se resuelven los perfiles (y, si corresponde, la marca).
export function useFollowList(userId: string | undefined, type: FollowListType) {
  const [items, setItems] = useState<FollowListItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchList = useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const filterColumn = type === 'followers' ? 'following_id' : 'follower_id'
      const idColumn = type === 'followers' ? 'follower_id' : 'following_id'
      const { data: follows } = await supabase
        .from('follows')
        .select(idColumn)
        .eq(filterColumn, userId)

      const ids = (follows ?? []).map((f: any) => f[idColumn] as string)
      if (ids.length === 0) {
        setItems([])
        return
      }

      const { data: profiles } = await supabase
        .from('perfiles')
        .select('*')
        .in('id', ids)
        .order('username', { ascending: true })

      const brandProfileIds = (profiles ?? []).filter((p) => p.is_brand).map((p) => p.id)
      let brandIdByProfileId: Record<string, string> = {}
      if (brandProfileIds.length > 0) {
        const { data: marcas } = await supabase
          .from('marcas')
          .select('id, profile_id')
          .in('profile_id', brandProfileIds)
        brandIdByProfileId = Object.fromEntries(
          (marcas ?? []).map((m) => [m.profile_id as string, m.id as string])
        )
      }

      setItems(
        (profiles ?? []).map((p) => ({
          ...p,
          brandId: p.is_brand ? brandIdByProfileId[p.id] : undefined,
        }))
      )
    } finally {
      setLoading(false)
    }
  }, [userId, type])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  return { items, loading, refetch: fetchList }
}
