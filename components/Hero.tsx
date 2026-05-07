import React from 'react'
import {Button} from './ui/Button'

export const Hero = () => {
  return (
    <section className="pt-12 pb-8">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">AI Spend Audit — smarter, not costlier</h1>
          <p className="mt-4 text-slate-600 max-w-xl">Credex gives engineering and finance teams a clear, actionable view into AI tool usage and subscriptions, helping you reduce redundant seats and match plan tiers to real needs.</p>
          <div className="mt-6 flex gap-3">
            <Button variant="primary">Get started — free</Button>
            <Button variant="ghost">Learn more</Button>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-lg shadow-sm">
          <div className="text-sm text-slate-700">Preview</div>
          <div className="mt-4 h-48 bg-white border rounded p-4 flex items-center justify-center text-slate-400">Dashboard mockup</div>
        </div>
      </div>
    </section>
  )
}

