'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'coach' | 'trainee' | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup() {
    if (!fullName || !email || !password || !role) {
      setError('Please fill in all fields and select a role.')
      return
    }
    if (role === 'trainee' && !inviteCode) {
      setError('Please enter your coach invite code.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    try {
      let coachId: string | null = null

      if (role === 'trainee') {
        const { data: invite, error: inviteError } = await supabase
          .from('invite_codes')
          .select('coach_id')
          .eq('code', inviteCode.toUpperCase().trim())
          .single()

        if (inviteError || !invite) {
          setError('Invalid invite code. Please check with your coach.')
          setLoading(false)
          return
        }

        coachId = invite.coach_id
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 2000))

      if (role === 'trainee' && coachId) {
        await supabase
          .from('coach_trainees')
          .insert({
            coach_id: coachId,
            trainee_id: authData.user.id,
          })
      }

      if (role === 'coach') {
        await supabase
          .from('coach_profiles')
          .insert({ coach_id: authData.user.id })
      }

      if (role === 'coach') {
        router.push('/dashboard')
      } else {
        router.push('/home')
      }

    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">
        Create your account
      </h2>

      <div className="mb-6">
        <p className="text-zinc-400 text-sm mb-3">I am a...</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRole('coach')}
            className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
              role === 'coach'
                ? 'border-white text-white bg-zinc-800'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            🏋️ Coach
          </button>
          <button
            onClick={() => setRole('trainee')}
            className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
              role === 'trainee'
                ? 'border-white text-white bg-zinc-800'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            💪 Trainee
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-1">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
          />
        </div>

        {role === 'trainee' && (
          <div>
            <label className="block text-zinc-400 text-sm mb-1">
              Coach invite code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="e.g. MIKE2024"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm uppercase tracking-widest"
            />
            <p className="text-zinc-500 text-xs mt-1">
              Ask your coach for their invite code
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full mt-6 bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-zinc-500 text-sm mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-white hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}