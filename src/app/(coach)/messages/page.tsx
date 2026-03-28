'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

type Conversation = {
  id: string
  type: string
  name: string | null
  last_message: string | null
  last_message_time: string | null
  other_user_name: string | null
}

export default function MessagesPage() {
  const { profile } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadConversations()
  }, [profile])

  async function loadConversations() {
    const { data: members } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations(id, type, name)')
      .eq('user_id', profile!.id)

    if (!members) {
      setLoading(false)
      return
    }

    const convList: Conversation[] = []

    for (const member of members) {
      const conv = member.conversations as unknown as { id: string; type: string; name: string | null }
      if (!conv) continue

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let otherUserName = conv.name

      if (conv.type === 'direct') {
        const { data: otherMember } = await supabase
          .from('conversation_members')
          .select('user_id, profiles(full_name)')
          .eq('conversation_id', conv.id)
          .neq('user_id', profile!.id)
          .single()

        const op = otherMember as unknown as { profiles: { full_name: string } }
        otherUserName = op?.profiles?.full_name ?? 'Unknown'
      }

      convList.push({
        id: conv.id,
        type: conv.type,
        name: conv.name,
        last_message: lastMsg?.content ?? null,
        last_message_time: lastMsg?.created_at ?? null,
        other_user_name: otherUserName,
      })
    }

    setConversations(convList)
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
      <PageHeader
        title="Messages"
        action={
          <Link
            href="/groups/create"
            className="bg-white text-zinc-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            + Group
          </Link>
        }
      />
      <div className="px-4 py-6">
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">💬</p>
            <p className="text-white font-medium">No messages yet</p>
            <p className="text-zinc-500 text-sm mt-1">
              Go to Community to find coaches and start a conversation
            </p>
            <Link
              href="/community"
              className="inline-block mt-6 bg-white text-zinc-900 font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              Browse Coaches
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center text-lg flex-shrink-0">
                  {conv.type === 'group' ? '👥' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">
                    {conv.other_user_name ?? conv.name ?? 'Conversation'}
                  </p>
                  {conv.last_message && (
                    <p className="text-zinc-500 text-xs mt-0.5 truncate">
                      {conv.last_message}
                    </p>
                  )}
                </div>
                {conv.last_message_time && (
                  <p className="text-zinc-600 text-xs flex-shrink-0">
                    {new Date(conv.last_message_time).toLocaleDateString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}