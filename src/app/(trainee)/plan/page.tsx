'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'

type Plan = {
  title: string
  content: string | null
  updated_at: string
}

export default function TraineePlanPage() {
  const { profile } = useUser()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadPlan()
  }, [profile])

  async function loadPlan() {
    const { data } = await supabase
      .from('plans')
      .select('title, content, updated_at')
      .eq('trainee_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setPlan(data ?? null)
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
      <PageHeader title="My Plan" />
      <div className="px-4 py-6">
        {!plan ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-white font-medium">No plan yet</p>
            <p className="text-zinc-500 text-sm mt-1">
              Your coach will assign a training plan to you soon
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">{plan.title}</h2>
              <p className="text-zinc-500 text-xs mt-1">
                Last updated {new Date(plan.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {plan.content ?? 'No details yet.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}