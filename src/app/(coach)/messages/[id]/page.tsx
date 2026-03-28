'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'

type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  profiles: { full_name: string } | null
}

export default function ChatPage() {
  const { id } = useParams()
  const { profile } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversationName, setConversationName] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadMessages()
    loadConversationName()

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        async (payload) => {
          const { data: msgWithProfile } = await supabase
            .from('messages')
            .select('id, content, created_at, sender_id, profiles(full_name)')
            .eq('id', payload.new.id)
            .single()

          if (msgWithProfile) {
            setMessages(prev => [...prev, msgWithProfile as unknown as Message])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_id, profiles(full_name)')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    setMessages((data as unknown as Message[]) ?? [])
    setLoading(false)
  }

  async function loadConversationName() {
    const conversationId = id as string

    const { data: conv } = await supabase
      .from('conversations')
      .select('type, name')
      .eq('id', conversationId)
      .single()

    if (conv?.type === 'group') {
      setConversationName(conv.name ?? 'Group')
    } else {
      const { data: otherMember } = await supabase
        .from('conversation_members')
        .select('user_id, profiles(full_name)')
        .eq('conversation_id', conversationId)
        .neq('user_id', profile!.id)
        .single()

      const op = otherMember as unknown as { profiles: { full_name: string } }
      setConversationName(op?.profiles?.full_name ?? 'Chat')
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !profile) return
    setSending(true)

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: profile.id,
      content: newMessage.trim(),
    })

    setNewMessage('')
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title={conversationName} showBack />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === profile?.id
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <p className="text-zinc-500 text-xs mb-1 px-1">
                    {msg.profiles?.full_name}
                  </p>
                )}
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-white text-zinc-900'
                    : 'bg-zinc-800 text-white'
                }`}>
                  {msg.content}
                </div>
                <p className="text-zinc-600 text-xs mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-4 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-white text-zinc-900 font-semibold px-4 py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}