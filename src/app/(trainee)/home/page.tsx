'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

type TraineeData = {
  coachName: string
  planTitle: string | null
  lastCheckin: string | null
}

export default function TraineeHomePage() {
  const { profile, loading: userLoading } = useUser()
  const [data, setData] = useState<TraineeData>({
    coachName: '',
    planTitle: null,
    lastCheckin: null,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  async function loadData() {
    const { data: relation } = await supabase
      .from('coach_trainees')
      .select('coach_id, profiles!coach_trainees_coach_id_fkey(full_name)')
      .eq('trainee_id', profile!.id)
      .single()

    const coachData = relation as unknown as {
      coach_id: string
      profiles: { full_name: string }
    }

    const { data: plan } = await supabase
      .from('plans')
      .select('title')
      .eq('trainee_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: checkin } = await supabase
      .from('checkins')
      .select('created_at')
      .eq('trainee_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setData({
      coachName: coachData?.profiles?.full_name ?? 'Your Coach',
      planTitle: plan?.title ?? null,
      lastCheckin: checkin?.created_at ?? null,
    })
    setLoading(false)
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Home" />
      <div className="px-4 py-6 space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Hey, {profile?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Coach: {data.coachName}
          </p>
        </div>

        <Link
          href="/checkins/new"
          className="block w-full bg-white text-zinc-900 font-semibold py-4 rounded-xl text-center hover:bg-zinc-100 transition-colors"
        >
          ✅ Submit Check-in
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-medium text-sm">Current Plan</p>
            <Link href="/plan" className="text-zinc-400 text-xs hover:text-white transition-colors">
              View →
            </Link>
          </div>
          {data.planTitle ? (
            <p className="text-zinc-400 text-sm">{data.planTitle}</p>
          ) : (
            <p className="text-zinc-500 text-sm">No plan assigned yet</p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-medium text-sm">Last Check-in</p>
            <Link href="/checkins" className="text-zinc-400 text-xs hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          {data.lastCheckin ? (
            <p className="text-zinc-400 text-sm">
              {new Date(data.lastCheckin).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          ) : (
            <p className="text-zinc-500 text-sm">No check-ins yet</p>
          )}
        </div>

      </div>
    </div>
  )
}