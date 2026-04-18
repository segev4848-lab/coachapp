'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'coach') {
      router.push('/dashboard')
    } else {
      router.push('/home')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">
        WELCOME BACK
      </h2>
      <p className="text-zinc-500 text-sm mb-8">Log in to your account</p>

      <div className="space-y-4">
        <div>
          <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
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
            onKeyDown={handleKeyDown}
            placeholder="Your password"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#39ff14] text-sm transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full mt-6 bg-[#39ff14] text-black font-black py-4 rounded-xl hover:bg-[#39ff14]/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-lg"
      >
        {loading ? 'LOGGING IN...' : 'LOG IN'}
      </button>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[#39ff14] font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}