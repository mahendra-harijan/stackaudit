import Link from 'next/link'
import React from 'react'

export function SiteNav() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-brand-500">Credex</Link>
        <nav className="space-x-4">
          <Link href="#features" className="text-sm text-slate-600">How it works</Link>
          <Link href="#pricing" className="text-sm text-slate-600">Pricing</Link>
          <Link href="#" className="text-sm font-medium text-white bg-brand-500 px-4 py-2 rounded">Get started</Link>
        </nav>
      </div>
    </header>
  )
}
