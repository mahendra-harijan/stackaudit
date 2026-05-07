import React from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'ghost'

export const Button = ({children, className, variant = 'primary', ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: Variant}) => {
  const base = 'inline-flex items-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none'
  const styles = {
    primary: 'bg-brand-500 text-white hover:opacity-95',
    ghost: 'bg-transparent border border-slate-200 text-slate-700'
  }

  return (
    <button className={clsx(base, styles[variant], className)} {...props}>
      {children}
    </button>
  )
}
