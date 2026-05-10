import React from 'react'
import {Button} from './ui/Button'
import LeadCaptureForm from './form/LeadCaptureForm'

export const Hero = () => {
  return (
    <section className="pt-12 pb-8">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">AI Spend Audit — smarter, not costlier</h1>
          <p className="mt-4 text-slate-600 max-w-xl">Credex gives engineering and finance teams a clear, actionable view into AI tool usage and subscriptions, helping you reduce redundant seats and match plan tiers to real needs.</p>
          <div className="mt-6 flex gap-3">
            <Button variant="primary">Run spend audit</Button>
            <Button variant="ghost">Learn more</Button>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-lg shadow-sm">
          <div className="text-sm font-semibold text-slate-700">Get early access</div>
          <p className="mt-1 text-sm text-slate-500">Join the waitlist and get launch updates.</p>
          <div className="mt-4">
            <LeadCaptureForm />
          </div>
        </div>
      </div>
    </section>
  )
}

