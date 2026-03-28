'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'

type CoachProfile = {
  specialty: string | null
  bio: string | null
  location: string | null
  years_experience: number | null
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

export default function CoachPublicProfilePage() {
  const { id } = useParams()
  const { profile } = useUser()
  const router = useRouter()
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadCoachProfile()
  }, [])

  async function loadCoachProfile() {
    const { data } = await supabase
      .from('coach_profiles')
      .select('specialty, bio, location, years_experience, profiles(full_name, avatar_url)')
      .eq('coach_id', id)
      .single()

    setCoachProfile(data as unknown as CoachProfile)
    setLoading(false)
  }

  async function startConversation() {
    if (!profile) return
    setMessaging(true)
    const otherCoachId = id as string

    // Check if direct conversation already exists
    const { data: existing } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations(type)')
      .eq('user_id', profile.id)

    let existingConversationId: string | null = null

    if (existing) {
      for (const member of existing) {
        const conv = member.conversations as unknown as { type: string }
        if (conv?.type === 'direct') {
          const { data: otherMember } = await supabase
            .from('conversation_members')
            .select('user_id')
            .eq('conversation_id', member.conversation_id)
            .eq('user_id', otherCoachId)
            .single()

          if (otherMember) {
            existingConversationId = member.conversation_id
            break
          }
        }
      }
    }

    if (existingConversationId) {
      router.push(`/messages/${existingConversationId}`)
      return
    }

    // Create new conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: profile.id })
      .select('id')
      .single()

    if (!conversation) {
      setMessaging(false)
      return
    }

    await supabase.from('conversation_members').insert([
      { conversation_id: conversation.id, user_id: profile.id },
      { conversation_id: conversation.id, user_id: otherCoachId },
    ])

    router.push(`/messages/${conversation.id}`)
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading || !coachProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Coach Profile" showBack />
      <div className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
            {coachProfile.profiles?.avatar_url ? (
              <img src={coachProfile.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials(coachProfile.profiles?.full_name ?? '?')
            )}
          </div>
          <div>
            <p className="text-white font-bold text-xl">{coachProfile.profiles?.full_name}</p>
            {coachProfile.specialty && (
              <p className="text-zinc-400 text-sm mt-1">{coachProfile.specialty}</p>
            )}
            {coachProfile.location && (
              <p className="text-zinc-500 text-xs mt-1">📍 {coachProfile.location}</p>
            )}
            {coachProfile.years_experience && (
              <p className="text-zinc-500 text-xs mt-1">{coachProfile.years_experience} years experience</p>
            )}
          </div>
        </div>

        {coachProfile.bio && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-400 text-sm mb-2">About</p>
            <p className="text-white text-sm leading-relaxed">{coachProfile.bio}</p>
          </div>
        )}

        {profile?.id !== id && (
          <button
            onClick={startConversation}
            disabled={messaging}
            className="w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {messaging ? 'Opening chat...' : '💬 Send Message'}
          </button>
        )}
      </div>
    </div>
  )
}