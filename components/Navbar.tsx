import Link from 'next/link'
import React from 'react'

export function SiteNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl text-blue-600 hover:text-blue-700 transition-colors">
          Credex
        </Link>
        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link href="/#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            How it works
          </Link>
          <Link href="/#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Pricing
          </Link>
          <Link 
            href="/spend-input" 
            className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Start Audit
          </Link>
        </nav>
      </div>
    </header>
  )
}
