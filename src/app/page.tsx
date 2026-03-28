import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">CoachApp</h1>
        <p className="text-zinc-400 mb-8">The platform built for coaches</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/signup"
            className="bg-white text-zinc-900 font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="border border-zinc-700 text-white font-semibold px-6 py-3 rounded-xl hover:border-zinc-500 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}