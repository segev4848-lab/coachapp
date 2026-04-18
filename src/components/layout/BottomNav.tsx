'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  role: 'coach' | 'trainee'
}

const coachTabs = [
  { label: 'Dashboard', href: '/dashboard', icon: '⚡' },
  { label: 'Trainees', href: '/trainees', icon: '👥' },
  { label: 'Community', href: '/community', icon: '🌐' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Profile', href: '/profile', icon: '👤' },
]

const traineeTabs = [
  { label: 'Home', href: '/home', icon: '🏠' },
  { label: 'Plan', href: '/plan', icon: '📋' },
  { label: 'Check-ins', href: '/checkins', icon: '✅' },
  { label: 'Profile', href: '/trainee-profile', icon: '👤' },
]

export default function BottomNav({ role }: Props) {
  const pathname = usePathname()
  const tabs = role === 'coach' ? coachTabs : traineeTabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-zinc-800/50 z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {tabs.map(tab => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-[#39ff14]'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-xs font-bold uppercase tracking-wide ${
                isActive ? 'text-[#39ff14]' : 'text-zinc-600'
              }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}