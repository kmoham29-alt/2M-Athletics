import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'World Cup 2026 Match Predictor | 2M Athletics',
  description: 'Professional-grade betting probability predictions for World Cup 2026 matches using Poisson + Elo modeling.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">{children}</body>
    </html>
  )
}
