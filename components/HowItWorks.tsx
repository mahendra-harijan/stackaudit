import React from 'react'

const Step = ({number, title, children}: {number: number; title: string; children: React.ReactNode}) => (
  <div className="flex items-start gap-4">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white font-semibold">{number}</div>
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-slate-600 text-sm">{children}</p>
    </div>
  </div>
)

export const HowItWorks = () => {
  return (
    <section id="features" className="mt-12">
      <h3 className="text-2xl font-semibold">How it works</h3>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Step number={1} title="Connect your tools">Add the AI tools you use and connect billing or upload invoices.</Step>
        <Step number={2} title="Share team data">Add seat counts, teams, and usage signals.</Step>
        <Step number={3} title="Get optimizations">Receive clear recommendations for plan reductions and license consolidation.</Step>
      </div>
    </section>
  )
}
