/**
 * Select dropdown component
 * Reusable select with error state handling and dynamic options
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  error?: boolean;
  errorMessage?: string;
  placeholder?: string;
  description?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      error,
      errorMessage,
      placeholder = 'Select an option',
      description,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2',
              'text-base text-slate-900 placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed',
              'transition-colors',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn(
              'pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2',
              'w-4 h-4 text-slate-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>

        {description && !error && (
          <p className="text-slate-500 text-sm mt-1">{description}</p>
        )}

        {error && errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
