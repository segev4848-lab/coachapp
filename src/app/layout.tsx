import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CoachApp',
  description: 'The platform built for coaches',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}