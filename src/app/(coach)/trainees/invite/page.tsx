'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { generateCode } from '@/lib/utils/generateCode'
import PageHeader from '@/components/layout/PageHeader'

export default function InvitePage() {
  const { profile } = useUser()
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadOrCreateCode()
  }, [profile])

  async function loadOrCreateCode() {
    const { data } = await supabase
      .from('invite_codes')
      .select('code')
      .eq('coach_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setCode(data.code)
    } else {
      await createNewCode()
    }
    setLoading(false)
  }

  async function createNewCode() {
    const newCode = generateCode()
    const { data } = await supabase
      .from('invite_codes')
      .insert({ coach_id: profile!.id, code: newCode })
      .select('code')
      .single()

    if (data) setCode(data.code)
  }

  async function handleNewCode() {
    setLoading(true)
    await createNewCode()
    setLoading(false)
  }

  function copyCode() {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyLink() {
    if (!code) return
    const link = `${window.location.origin}/signup?code=${code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader title="Invite Trainee" showBack />
      <div className="px-4 py-6 space-y-6">
        <p className="text-zinc-400 text-sm">
          Share this code with your trainee. They enter it when signing up to connect to you automatically.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          {loading ? (
            <p className="text-zinc-500 text-sm">Generating code...</p>
          ) : (
            <>
              <p className="text-5xl font-bold text-white tracking-widest">
                {code}
              </p>
              <p className="text-zinc-500 text-xs mt-3">Your invite code</p>
            </>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={copyCode}
            disabled={!code}
            className="w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>

          <button
            onClick={copyLink}
            disabled={!code}
            className="w-full bg-zinc-900 border border-zinc-700 text-white font-medium py-3 rounded-xl hover:border-zinc-500 transition-colors disabled:opacity-50"
          >
            Copy Signup Link
          </button>

          <button
            onClick={handleNewCode}
            disabled={loading}
            className="w-full text-zinc-500 text-sm py-2 hover:text-zinc-300 transition-colors"
          >
            Generate new code
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <p className="text-white text-sm font-medium">How it works</p>
          <p className="text-zinc-500 text-sm">1. Share the code or link with your trainee</p>
          <p className="text-zinc-500 text-sm">2. They sign up and enter the code</p>
          <p className="text-zinc-500 text-sm">3. They appear in your trainees list automatically</p>
        </div>
      </div>
    </div>
  )
}