import './globals.css'
import React from 'react'
import type {ReactNode} from 'react'
import {SiteNav} from '../components/Navbar'
import {Footer} from '../components/Footer'

export const metadata = {
  title: 'Credex — AI Spend Audit',
  description: 'Start tracking and optimizing your AI tool spend.'
}

export default function RootLayout({children}: {children: ReactNode}) {
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
