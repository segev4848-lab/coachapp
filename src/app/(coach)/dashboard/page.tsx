'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

type Checkin = {
  id: string
  created_at: string
  weight: number
  energy: number
  workout_done: boolean
  trainee_id: string
  profiles: { full_name: string } | null
}

type Stats = {
  totalTrainees: number
  activeTrainees: number
  unpaidTrainees: number
  recentCheckins: Checkin[]
}

export default function DashboardPage() {
  const { profile, loading: userLoading } = useUser()
  const [stats, setStats] = useState<Stats>({
    totalTrainees: 0,
    activeTrainees: 0,
    unpaidTrainees: 0,
    recentCheckins: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadStats()
  }, [profile])

  async function loadStats() {
    const coachId = profile!.id

    const { data: trainees } = await supabase
      .from('coach_trainees')
      .select('status')
      .eq('coach_id', coachId)

    const { data: payments } = await supabase
      .from('payments')
      .select('status')
      .eq('coach_id', coachId)
      .eq('status', 'unpaid')

    const { data: checkins } = await supabase
      .from('checkins')
      .select('id, created_at, weight, energy, workout_done, trainee_id, profiles(full_name)')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false })
      .limit(5)

    setStats({
      totalTrainees: trainees?.length ?? 0,
      activeTrainees: trainees?.filter(t => t.status === 'active').length ?? 0,
      unpaidTrainees: payments?.length ?? 0,
      recentCheckins: (checkins as unknown as Checkin[]) ?? [],
    })
    setLoading(false)
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#39ff14] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <PageHeader title="Dashboard" />

      <div className="px-4 py-6 space-y-6">

        {/* Greeting */}
        <div>
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Welcome back</p>
          <h2 className="text-3xl font-black text-white mt-1">
            {profile?.full_name?.split(' ')[0].toUpperCase()} 💪
          </h2>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-white">{stats.totalTrainees}</p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide mt-1">Trainees</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-[#39ff14]">{stats.activeTrainees}</p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide mt-1">Active</p>
          </div>
          <div className={`border rounded-2xl p-4 text-center ${
            stats.unpaidTrainees > 0
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-zinc-900 border-zinc-800'
          }`}>
            <p className={`text-3xl font-black ${
              stats.unpaidTrainees > 0 ? 'text-red-400' : 'text-white'
            }`}>
              {stats.unpaidTrainees}
            </p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide mt-1">Unpaid</p>
          </div>
        </div>

        {/* Add trainee button */}
        <Link
          href="/trainees/invite"
          className="flex items-center justify-center gap-2 w-full bg-[#39ff14] text-black font-black py-4 rounded-2xl text-base hover:bg-[#39ff14]/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          + ADD TRAINEE
        </Link>

        {/* Recent check-ins */}
        <div>
          <h3 className="text-white font-black uppercase tracking-wide text-sm mb-3">
            Recent Check-ins
          </h3>
          {stats.recentCheckins.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-white font-bold">No check-ins yet</p>
              <p className="text-zinc-600 text-sm mt-1">
                Check-ins from your trainees will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentCheckins.map(checkin => (
                <Link
                  key={checkin.id}
                  href={`/trainees/${checkin.trainee_id}`}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-all"
                >
                  <div>
                    <p className="text-white font-bold text-sm">
                      {checkin.profiles?.full_name ?? 'Unknown'}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {new Date(checkin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      checkin.energy >= 7
                        ? 'bg-[#39ff14]/20 text-[#39ff14]'
                        : checkin.energy >= 4
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      ⚡{checkin.energy}/10
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      checkin.workout_done
                        ? 'bg-[#39ff14]/20 text-[#39ff14]'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {checkin.workout_done ? '✓' : '✗'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}