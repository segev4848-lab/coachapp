'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

type Coach = {
  coach_id: string
  specialty: string | null
  location: string | null
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

export default function CommunityPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCoaches()
  }, [])

  async function loadCoaches() {
    const { data } = await supabase
      .from('coach_profiles')
      .select('coach_id, specialty, location, profiles(full_name, avatar_url)')

    setCoaches((data as unknown as Coach[]) ?? [])
    setLoading(false)
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const filtered = coaches.filter(c => {
    const name = c.profiles?.full_name?.toLowerCase() ?? ''
    const specialty = c.specialty?.toLowerCase() ?? ''
    const q = search.toLowerCase()
    return name.includes(q) || specialty.includes(q)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Community" />
      <div className="px-4 py-6 space-y-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coaches..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🌐</p>
            <p className="text-white font-medium">No coaches yet</p>
            <p className="text-zinc-500 text-sm mt-1">
              Other coaches will appear here once they join
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(coach => (
              <Link
                key={coach.coach_id}
                href={`/community/${coach.coach_id}`}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                  {coach.profiles?.avatar_url ? (
                    <img src={coach.profiles.avatar_url} alt={coach.profiles.full_name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(coach.profiles?.full_name ?? '?')
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{coach.profiles?.full_name}</p>
                  {coach.specialty && (
                    <p className="text-zinc-400 text-xs mt-0.5">{coach.specialty}</p>
                  )}
                  {coach.location && (
                    <p className="text-zinc-600 text-xs mt-0.5">📍 {coach.location}</p>
                  )}
                </div>
                <span className="text-zinc-600">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}