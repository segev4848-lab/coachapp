'use client'

import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import LogoutButton from '@/components/ui/LogoutButton'

export default function TraineeProfilePage() {
  const { profile, loading } = useUser()

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
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
      <PageHeader title="Profile" />
      <div className="px-4 py-6 space-y-6">

        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitials(profile?.full_name ?? '')
            )}
          </div>
          <p className="text-white font-semibold text-lg">{profile?.full_name}</p>
          <p className="text-zinc-500 text-sm">Trainee</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-400 text-xs mb-1">Email</p>
          <p className="text-white text-sm">{profile?.id}</p>
        </div>

        <LogoutButton />

      </div>
    </div>
  )
}