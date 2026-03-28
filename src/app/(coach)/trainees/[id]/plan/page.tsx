'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'

export default function PlanPage() {
  const { id } = useParams()
  const { profile } = useUser()
  const router = useRouter()
  const [planId, setPlanId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadPlan()
  }, [profile])

  async function loadPlan() {
    const { data } = await supabase
      .from('plans')
      .select('id, title, content')
      .eq('coach_id', profile!.id)
      .eq('trainee_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setPlanId(data.id)
      setTitle(data.title)
      setContent(data.content ?? '')
    }
    setLoading(false)
  }

  async function savePlan() {
    if (!title.trim()) return
    setSaving(true)
    const traineeId = id as string

    if (planId) {
      await supabase
        .from('plans')
        .update({ title, content })
        .eq('id', planId)
    } else {
      const { data } = await supabase
        .from('plans')
        .insert({
          coach_id: profile!.id,
          trainee_id: traineeId,
          title,
          content,
        })
        .select('id')
        .single()

      if (data) setPlanId(data.id)
    }

    setSaving(false)
    router.back()
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
      <PageHeader title="Training Plan" showBack />
      <div className="px-4 py-6 space-y-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Plan title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Week 1 Strength Plan"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-2">Plan details</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write the training plan here..."
            rows={16}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm resize-none"
          />
        </div>

        {!title.trim() && (
          <p className="text-red-400 text-xs">Plan title is required</p>
        )}

        <button
          onClick={savePlan}
          disabled={saving || !title.trim()}
          className="w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : planId ? 'Save changes' : 'Create plan'}
        </button>
      </div>
    </div>
  )
}