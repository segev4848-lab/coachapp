'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'

export default function NewCheckinPage() {
  const { profile } = useUser()
  const router = useRouter()
  const [weight, setWeight] = useState('')
  const [sleep, setSleep] = useState('')
  const [energy, setEnergy] = useState<number | null>(null)
  const [workoutDone, setWorkoutDone] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function submitCheckin() {
    if (energy === null) {
      setError('Please select your energy level.')
      return
    }
    if (workoutDone === null) {
      setError('Please select if you completed your workout.')
      return
    }
    if (!profile) return

    setSubmitting(true)
    setError('')

    const { data: relation } = await supabase
      .from('coach_trainees')
      .select('coach_id')
      .eq('trainee_id', profile.id)
      .single()

    if (!relation) {
      setError('Could not find your coach. Please try again.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('checkins')
      .insert({
        trainee_id: profile.id,
        coach_id: relation.coach_id,
        weight: weight ? parseFloat(weight) : null,
        sleep: sleep ? parseFloat(sleep) : null,
        energy,
        workout_done: workoutDone,
        notes: notes.trim() || null,
      })

    if (insertError) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    router.push('/checkins')
  }

  return (
    <div>
      <PageHeader title="New Check-in" showBack />
      <div className="px-4 py-6 space-y-6">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 75"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Sleep (hours)</label>
            <input
              type="number"
              value={sleep}
              onChange={e => setSleep(e.target.value)}
              placeholder="e.g. 7"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-3">
            Energy level (1-10)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => setEnergy(n)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  energy === n
                    ? n >= 7
                      ? 'bg-green-500 text-white'
                      : n >= 4
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-3">
            Workout completed?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWorkoutDone(true)}
              className={`py-4 rounded-xl text-sm font-semibold transition-all ${
                workoutDone === true
                  ? 'bg-green-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              ✓ Yes
            </button>
            <button
              onClick={() => setWorkoutDone(false)}
              className={`py-4 rounded-xl text-sm font-semibold transition-all ${
                workoutDone === false
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              ✗ No
            </button>
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How are you feeling? Anything to share with your coach?"
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={submitCheckin}
          disabled={submitting}
          className="w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Check-in'}
        </button>

      </div>
    </div>
  )
}