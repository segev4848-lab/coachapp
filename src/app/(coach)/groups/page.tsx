'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

type Group = {
  id: string
  name: string | null
  created_by: string
  isMember: boolean
}

export default function GroupsPage() {
  const { profile } = useUser()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadGroups()
  }, [profile])

  async function loadGroups() {
    const { data: allGroups } = await supabase
      .from('conversations')
      .select('id, name, created_by')
      .eq('type', 'group')

    const { data: myMemberships } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', profile!.id)

    const myGroupIds = new Set(myMemberships?.map(m => m.conversation_id) ?? [])

    const groupList = (allGroups ?? []).map(g => ({
      id: g.id,
      name: g.name,
      created_by: g.created_by,
      isMember: myGroupIds.has(g.id),
    }))

    setGroups(groupList)
    setLoading(false)
  }

  async function joinGroup(groupId: string) {
    if (!profile) return
    await supabase.from('conversation_members').insert({
      conversation_id: groupId,
      user_id: profile.id,
    })
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, isMember: true } : g
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  const myGroups = groups.filter(g => g.isMember)
  const otherGroups = groups.filter(g => !g.isMember)

  return (
    <div>
      <PageHeader
        title="Groups"
        action={
          <Link
            href="/groups/create"
            className="bg-white text-zinc-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            + Create
          </Link>
        }
      />
      <div className="px-4 py-6 space-y-6">

        <div>
          <h3 className="text-white font-semibold mb-3">My Groups</h3>
          {myGroups.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <p className="text-zinc-500 text-sm">You have not joined any groups yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myGroups.map(group => (
                <Link
                  key={group.id}
                  href={`/messages/${group.id}`}
                  className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center text-lg">
                    👥
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{group.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Tap to open chat</p>
                  </div>
                  <span className="text-zinc-600">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {otherGroups.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">Discover Groups</h3>
            <div className="space-y-3">
              {otherGroups.map(group => (
                <div
                  key={group.id}
                  className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                >
                  <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center text-lg">
                    👥
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{group.name}</p>
                  </div>
                  <button
                    onClick={() => joinGroup(group.id)}
                    className="bg-white text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}