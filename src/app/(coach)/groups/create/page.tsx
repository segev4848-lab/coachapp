'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'

export default function CreateGroupPage() {
  const { profile } = useUser()
  const router = useRouter()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function createGroup() {
    if (!name.trim()) {
      setError('Please enter a group name.')
      return
    }
    if (!profile) return

    setCreating(true)
    setError('')

    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        type: 'group',
        name: name.trim(),
        created_by: profile.id,
      })
      .select('id')
      .single()

    if (!conversation) {
      setError('Something went wrong. Please try again.')
      setCreating(false)
      return
    }

    await supabase.from('conversation_members').insert({
      conversation_id: conversation.id,
      user_id: profile.id,
    })

    router.push(`/messages/${conversation.id}`)
  }

  return (
    <div>
      <PageHeader title="Create Group" showBack />
      <div className="px-4 py-6 space-y-6">

        <p className="text-zinc-400 text-sm">
          Create a group to chat with other coaches about a specific topic or interest.
        </p>

        <div>
          <label className="block text-zinc-400 text-sm mb-2">Group name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Strength Coaches Network"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={createGroup}
          disabled={creating || !name.trim()}
          className="w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : 'Create Group'}
        </button>

      </div>
    </div>
  )
}