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
    <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ←
          </button>
        )}
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}