import './globals.css'
import React from 'react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteNav } from '../components/Navbar'
import { Footer } from '../components/Footer'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Credex — AI Spend Audit',
    template: '%s — Credex',
  },
  description: 'Start tracking and optimizing your AI tool spend.',
  openGraph: {
    type: 'website',
    siteName: 'Credex',
    title: 'Credex — AI Spend Audit',
    description: 'Start tracking and optimizing your AI tool spend.',
    images: [
      {
        url: '/og-audit.svg',
        width: 1200,
        height: 630,
        alt: 'Credex AI spend audit preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Credex — AI Spend Audit',
    description: 'Start tracking and optimizing your AI tool spend.',
    images: ['/og-audit.svg'],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900">
        <div className="min-h-screen flex flex-col">
          <SiteNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
