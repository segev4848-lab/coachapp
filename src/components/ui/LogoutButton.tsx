'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-white transition-colors"
    >
      Log out
    </button>
  )
}