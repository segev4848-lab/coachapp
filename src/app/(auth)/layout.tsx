export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            CoachApp
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            The platform built for coaches
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}