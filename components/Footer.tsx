import React from 'react'

export const Footer = () => {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-6 py-8 text-sm text-slate-500 flex justify-between">
        <div>© {new Date().getFullYear()} Credex — Built for WebDev 2026</div>
        <div>Privacy · Terms</div>
      </div>
    </footer>
  )
}
