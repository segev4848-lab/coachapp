import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#39ff14] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-md w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-pulse" />
          <span className="text-[#39ff14] text-xs font-semibold tracking-widest uppercase">Coach Platform</span>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-black text-white leading-none tracking-tight mb-4">
          COACH
          <span className="text-[#39ff14]">APP</span>
        </h1>

        <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
          Manage your trainees. Connect with coaches. All in one place.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full bg-[#39ff14] text-black font-black py-4 rounded-2xl text-lg hover:bg-[#39ff14]/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            GET STARTED
          </Link>
          <Link
            href="/login"
            className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl text-lg hover:bg-white/10 transition-all"
          >
            LOG IN
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          <div className="text-center">
            <p className="text-2xl font-black text-white">100%</p>
            <p className="text-zinc-500 text-xs mt-1">Coach Focused</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#39ff14]">∞</p>
            <p className="text-zinc-500 text-xs mt-1">Trainees</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">24/7</p>
            <p className="text-zinc-500 text-xs mt-1">Access</p>
          </div>
        </div>

      </div>
    </div>
  )
}