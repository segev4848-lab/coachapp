import BottomNav from '@/components/layout/BottomNav'

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="pb-20">
        {children}
      </div>
      <BottomNav role="coach" />
    </div>
  )
}