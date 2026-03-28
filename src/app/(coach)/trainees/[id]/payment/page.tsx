'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'

export default function PaymentPage() {
  const { id } = useParams()
  const { profile } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<'paid' | 'unpaid'>('unpaid')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadPayment()
  }, [profile])

  async function loadPayment() {
    const { data } = await supabase
      .from('payments')
      .select('status, due_date')
      .eq('coach_id', profile!.id)
      .eq('trainee_id', id)
      .single()

    if (data) {
      setStatus(data.status as 'paid' | 'unpaid')
      setDueDate(data.due_date ?? '')
    }
    setLoading(false)
  }

  async function savePayment() {
    setSaving(true)
    const traineeId = id as string

    await supabase
      .from('payments')
      .upsert({
        coach_id: profile!.id,
        trainee_id: traineeId,
        status,
        due_date: dueDate || null,
      }, {
        onConflict: 'coach_id,trainee_id'
      })

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
      <PageHeader title="Payment Status" showBack />
      <div className="px-4 py-6 space-y-6">
        <div>
          <p className="text-zinc-400 text-sm mb-3">Payment status</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStatus('paid')}
              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                status === 'paid'
                  ? 'border-green-500 text-green-400 bg-green-500/10'
                  : 'border-zinc-700 text-zinc-400'
              }`}
            >
              ✓ Paid
            </button>
            <button
              onClick={() => setStatus('unpaid')}
              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                status === 'unpaid'
                  ? 'border-red-500 text-red-400 bg-red-500/10'
                  : 'border-zinc-700 text-zinc-400'
              }`}
            >
              ✗ Unpaid
            </button>
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-2">
            Due date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-400 text-sm"
          />
        </div>

        <button
          onClick={savePayment}
          disabled={saving}
          className="w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}