'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

type Trainee = {
  id: string
  status: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  payments: { status: string }[]
}

export default function TraineesPage() {
  const { profile } = useUser()
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadTrainees()
  }, [profile])

  async function loadTrainees() {
    const { data } = await supabase
      .from('coach_trainees')
      .select(`
        id,
        status,
        profiles!coach_trainees_trainee_id_fkey(id, full_name, avatar_url),
        payments(status)
      `)
      .eq('coach_id', profile!.id)
      .order('created_at', { ascending: false })

    setTrainees((data as unknown as Trainee[]) ?? [])
    setLoading(false)
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
      <PageHeader
        title="Trainees"
        action={
          <Link
            href="/trainees/invite"
            className="bg-white text-zinc-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            + Add
          </Link>
        }
      />

      <div className="px-4 py-6">
        {trainees.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-white font-medium">No trainees yet</p>
            <p className="text-zinc-500 text-sm mt-1 mb-6">
              Invite your first trainee to get started
            </p>
            <Link
              href="/trainees/invite"
              className="inline-block bg-white text-zinc-900 font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              Invite Trainee
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trainees.map(trainee => {
              const p = trainee.profiles
              const paymentStatus = trainee.payments?.[0]?.status ?? 'unpaid'
              return (
                <Link
                  key={trainee.id}
                  href={`/trainees/${p.id}`}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(p.full_name)
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{p.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          trainee.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {trainee.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          paymentStatus === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-zinc-600">→</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}