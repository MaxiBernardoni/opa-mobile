import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    fetchProfile(userId)
  }, [userId])

  async function fetchProfile(id: string) {
    try {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', id)
        .single()
      setProfile(data)
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading }
}
