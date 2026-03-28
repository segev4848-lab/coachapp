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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Hey, {profile?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Here is your overview</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.totalTrainees}</p>
            <p className="text-zinc-500 text-xs mt-1">Trainees</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.activeTrainees}</p>
            <p className="text-zinc-500 text-xs mt-1">Active</p>
          </div>
          <div className={`border rounded-2xl p-4 text-center ${
            stats.unpaidTrainees > 0
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-zinc-900 border-zinc-800'
          }`}>
            <p className={`text-2xl font-bold ${
              stats.unpaidTrainees > 0 ? 'text-red-400' : 'text-white'
            }`}>
              {stats.unpaidTrainees}
            </p>
            <p className="text-zinc-500 text-xs mt-1">Unpaid</p>
          </div>
        </div>

        <Link
          href="/trainees/invite"
          className="block w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl text-center text-sm hover:bg-zinc-100 transition-colors"
        >
          + Add Trainee
        </Link>

        <div>
          <h3 className="text-white font-semibold mb-3">Recent Check-ins</h3>
          {stats.recentCheckins.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <p className="text-zinc-500 text-sm">No check-ins yet</p>
              <p className="text-zinc-600 text-xs mt-1">
                Check-ins from your trainees will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentCheckins.map(checkin => (
                <Link
                  key={checkin.id}
                  href={`/trainees/${checkin.trainee_id}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {checkin.profiles?.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {new Date(checkin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        checkin.energy >= 7
                          ? 'bg-green-500/20 text-green-400'
                          : checkin.energy >= 4
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        Energy {checkin.energy}/10
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        checkin.workout_done
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {checkin.workout_done ? '✓ Done' : '✗ Skipped'}
                      </span>
                    </div>
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