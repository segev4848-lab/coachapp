'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  role: 'coach' | 'trainee'
  full_name: string
  avatar_url: string | null
}

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, role, full_name, avatar_url')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    getProfile()
  }, [])

  return { profile, loading }
}