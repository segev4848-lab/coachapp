'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'

type Checkin = {
  id: string
  created_at: string
  weight: number | null
  sleep: number | null
  energy: number
  workout_done: boolean
  notes: string | null
}

export default function TraineeCheckinsPage() {
  const { id } = useParams()
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCheckins()
  }, [])

  async function loadCheckins() {
    const { data } = await supabase
      .from('checkins')
      .select('id, created_at, weight, sleep, energy, workout_done, notes')
      .eq('trainee_id', id)
      .order('created_at', { ascending: false })

    setCheckins(data ?? [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Check-in History" showBack />
      <div className="px-4 py-6">
        {checkins.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-white font-medium">No check-ins yet</p>
            <p className="text-zinc-500 text-sm mt-1">
              Check-ins will appear here once your trainee starts submitting them
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkins.map(c => (
              <div
                key={c.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {c.weight && (
                        <span className="text-zinc-400 text-xs">{c.weight}kg</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        c.energy >= 7
                          ? 'bg-green-500/20 text-green-400'
                          : c.energy >= 4
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        Energy {c.energy}/10
                      </span>
                      <span className={`text-xs ${
                        c.workout_done ? 'text-green-400' : 'text-zinc-600'
                      }`}>
                        {c.workout_done ? '✓ Workout' : '✗ No workout'}
                      </span>
                    </div>
                  </div>
                  <span className="text-zinc-600 text-sm">
                    {expanded === c.id ? '▲' : '▼'}
                  </span>
                </button>

                {expanded === c.id && (
                  <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-800 rounded-xl p-3">
                        <p className="text-zinc-500 text-xs">Weight</p>
                        <p className="text-white text-sm font-medium mt-0.5">
                          {c.weight ? `${c.weight}kg` : '—'}
                        </p>
                      </div>
                      <div className="bg-zinc-800 rounded-xl p-3">
                        <p className="text-zinc-500 text-xs">Sleep</p>
                        <p className="text-white text-sm font-medium mt-0.5">
                          {c.sleep ? `${c.sleep}h` : '—'}
                        </p>
                      </div>
                      <div className="bg-zinc-800 rounded-xl p-3">
                        <p className="text-zinc-500 text-xs">Energy</p>
                        <p className="text-white text-sm font-medium mt-0.5">
                          {c.energy}/10
                        </p>
                      </div>
                      <div className="bg-zinc-800 rounded-xl p-3">
                        <p className="text-zinc-500 text-xs">Workout</p>
                        <p className={`text-sm font-medium mt-0.5 ${
                          c.workout_done ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {c.workout_done ? 'Done' : 'Skipped'}
                        </p>
                      </div>
                    </div>
                    {c.notes && (
                      <div className="bg-zinc-800 rounded-xl p-3">
                        <p className="text-zinc-500 text-xs mb-1">Notes</p>
                        <p className="text-white text-sm">{c.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}