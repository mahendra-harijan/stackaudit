import React from 'react'
import {Hero} from '../components/Hero'
import {HowItWorks} from '../components/HowItWorks'

export default function Page() {
  return (
    <div className="container mx-auto px-6 py-12">
      <Hero />
      <HowItWorks />
    </div>
  )
}
