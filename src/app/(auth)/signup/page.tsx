Now update the signup page. Open src/app/(auth)/signup/page.tsx and replace everything with this:
tsx'use client'

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

      const { error: authError } = await supabase.auth.signUp({
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

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError || !signInData.user) {
        setError('Account created but could not sign in. Please try logging in.')
        setLoading(false)
        return
      }

      const profileRes = await fetch('/api/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: signInData.user.id,
          full_name: fullName,
          role: role,
        }),
      })

      const profileResJson = await profileRes.json()

      if (!profileRes.ok) {
        setError('Could not create profile: ' + profileResJson.error)
        setLoading(false)
        return
      }

      if (role === 'trainee' && coachId) {
        await supabase
          .from('coach_trainees')
          .insert({
            coach_id: coachId,
            trainee_id: signInData.user.id,
          })
      }

      if (role === 'coach') {
        await supabase
          .from('coach_profiles')
          .insert({ coach_id: signInData.user.id })
      }

      if (role === 'coach') {
        router.push('/dashboard')
      } else {
        router.push('/home')
      }

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">
        CREATE ACCOUNT
      </h2>
      <p className="text-zinc-500 text-sm mb-8">Join the coach platform</p>

      {/* Role selector */}
      <div className="mb-6">
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">I am a...</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRole('coach')}
            className={`p-4 rounded-xl border-2 text-sm font-black uppercase tracking-wide transition-all ${
              role === 'coach'
                ? 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            🏋️ Coach
          </button>
          <button
            onClick={() => setRole('trainee')}
            className={`p-4 rounded-xl border-2 text-sm font-black uppercase tracking-wide transition-all ${
              role === 'trainee'
                ? 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            💪 Trainee
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#39ff14] text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#39ff14] text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#39ff14] text-sm transition-colors"
          />
        </div>

        {role === 'trainee' && (
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
              Coach invite code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="e.g. MIKE2024"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#39ff14] text-sm uppercase tracking-widest transition-colors"
            />
            <p className="text-zinc-600 text-xs mt-1">
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
        className="w-full mt-6 bg-[#39ff14] text-black font-black py-4 rounded-xl hover:bg-[#39ff14]/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-lg"
      >
        {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
      </button>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#39ff14] font-bold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}