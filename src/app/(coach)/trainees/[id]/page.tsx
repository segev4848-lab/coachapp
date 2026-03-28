'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

type TraineeData = {
  id: string
  full_name: string
  avatar_url: string | null
  status: string
  payment: { status: string; due_date: string | null } | null
  latestPlan: { id: string; title: string; updated_at: string } | null
  recentCheckins: {
    id: string
    created_at: string
    weight: number
    energy: number
    workout_done: boolean
  }[]
}

export default function TraineeProfilePage() {
  const { id } = useParams()
  const { profile } = useUser()
  const [trainee, setTrainee] = useState<TraineeData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadTrainee()
  }, [profile])

  async function loadTrainee() {
    const traineeId = id as string

    const [profileRes, relationRes, paymentRes, planRes, checkinRes] =
      await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').eq('id', traineeId).single(),
        supabase.from('coach_trainees').select('status').eq('coach_id', profile!.id).eq('trainee_id', traineeId).single(),
        supabase.from('payments').select('status, due_date').eq('coach_id', profile!.id).eq('trainee_id', traineeId).single(),
        supabase.from('plans').select('id, title, updated_at').eq('coach_id', profile!.id).eq('trainee_id', traineeId).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('checkins').select('id, created_at, weight, energy, workout_done').eq('trainee_id', traineeId).order('created_at', { ascending: false }).limit(5),
      ])

    setTrainee({
      id: traineeId,
      full_name: profileRes.data?.full_name ?? '',
      avatar_url: profileRes.data?.avatar_url ?? null,
      status: relationRes.data?.status ?? 'active',
      payment: paymentRes.data ?? null,
      latestPlan: planRes.data ?? null,
      recentCheckins: checkinRes.data ?? [],
    })
    setLoading(false)
  }

  async function toggleStatus() {
    if (!trainee) return
    const newStatus = trainee.status === 'active' ? 'inactive' : 'active'
    await supabase
      .from('coach_trainees')
      .update({ status: newStatus })
      .eq('coach_id', profile!.id)
      .eq('trainee_id', trainee.id)
    setTrainee({ ...trainee, status: newStatus })
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading || !trainee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={trainee.full_name} showBack />
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold text-white overflow-hidden">
            {trainee.avatar_url ? (
              <img src={trainee.avatar_url} alt={trainee.full_name} className="w-full h-full object-cover" />
            ) : (
              getInitials(trainee.full_name)
            )}
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{trainee.full_name}</h2>
            <button
              onClick={toggleStatus}
              className={`text-xs px-3 py-1 rounded-full mt-1 font-medium transition-colors ${
                trainee.status === 'active'
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
            >
              {trainee.status} — tap to toggle
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-medium text-sm">Payment</p>
            <Link href={`/trainees/${trainee.id}/payment`} className="text-zinc-400 text-xs hover:text-white transition-colors">
              Edit →
            </Link>
          </div>
          {trainee.payment ? (
            <div className="flex items-center justify-between">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                trainee.payment.status === 'paid'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {trainee.payment.status}
              </span>
              {trainee.payment.due_date && (
                <p className="text-zinc-500 text-xs">
                  Due {new Date(trainee.payment.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <Link href={`/trainees/${trainee.id}/payment`} className="text-zinc-500 text-sm hover:text-white transition-colors">
              + Set payment status
            </Link>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-medium text-sm">Training Plan</p>
            <Link href={`/trainees/${trainee.id}/plan`} className="text-zinc-400 text-xs hover:text-white transition-colors">
              {trainee.latestPlan ? 'Edit →' : 'Create →'}
            </Link>
          </div>
          {trainee.latestPlan ? (
            <div>
              <p className="text-white text-sm">{trainee.latestPlan.title}</p>
              <p className="text-zinc-500 text-xs mt-1">
                Updated {new Date(trainee.latestPlan.updated_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No plan created yet</p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-medium text-sm">Recent Check-ins</p>
            <Link href={`/trainees/${trainee.id}/checkins`} className="text-zinc-400 text-xs hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          {trainee.recentCheckins.length === 0 ? (
            <p className="text-zinc-500 text-sm">No check-ins yet</p>
          ) : (
            <div className="space-y-2">
              {trainee.recentCheckins.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <p className="text-zinc-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-xs">{c.weight}kg</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.energy >= 7 ? 'bg-green-500/20 text-green-400'
                      : c.energy >= 4 ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                    }`}>
                      {c.energy}/10
                    </span>
                    <span className={`text-xs ${c.workout_done ? 'text-green-400' : 'text-zinc-600'}`}>
                      {c.workout_done ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}