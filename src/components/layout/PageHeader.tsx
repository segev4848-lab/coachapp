'use client'

import { useRouter } from 'next/navigation'

type Props = {
  title: string
  showBack?: boolean
  action?: React.ReactNode
}

export default function PageHeader({ title, showBack, action }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/50 bg-[#0a0a0a]">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
          >
            ←
          </button>
        )}
        <h1 className="text-lg font-black text-white uppercase tracking-wide">
          {title}
        </h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}