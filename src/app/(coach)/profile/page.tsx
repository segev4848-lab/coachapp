'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import PageHeader from '@/components/layout/PageHeader'
import LogoutButton from '@/components/ui/LogoutButton'

export default function CoachProfilePage() {
  const { profile, loading: userLoading } = useUser()
  const [specialty, setSpecialty] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [years, setYears] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    loadCoachProfile()
  }, [profile])

  async function loadCoachProfile() {
    const { data } = await supabase
      .from('coach_profiles')
      .select('specialty, bio, location, years_experience')
      .eq('coach_id', profile!.id)
      .single()

    if (data) {
      setSpecialty(data.specialty ?? '')
      setBio(data.bio ?? '')
      setLocation(data.location ?? '')
      setYears(data.years_experience?.toString() ?? '')
    }
    setLoading(false)
  }

  async function saveProfile() {
    setSaving(true)
    await supabase
      .from('coach_profiles')
      .upsert({
        coach_id: profile!.id,
        specialty,
        bio,
        location,
        years_experience: years ? parseInt(years) : null,
      }, { onConflict: 'coach_id' })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function getInitials(name: string) {
    return name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
  }

  if (userLoading || loading) {
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
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials(profile?.full_name ?? '')
            )}
          </div>
          <p className="text-white font-semibold text-lg">{profile?.full_name}</p>
          <p className="text-zinc-500 text-sm">Coach</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Specialty</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. Strength & Conditioning"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other coaches about yourself..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Tel Aviv, Israel"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1">Years of experience (optional)</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g. 5"
              min="0"
              max="50"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 text-sm"
            />
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full bg-white text-zinc-900 font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Profile'}
        </button>

        <LogoutButton />
      </div>
    </div>
  )
}