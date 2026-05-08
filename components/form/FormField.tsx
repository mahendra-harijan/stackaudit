/**
 * FormField component
 * Wrapper for form fields with React Hook Form integration
 * Handles error display and field state management
 */

'use client';

import React from 'react';
import { FieldValues, FieldPath, Controller, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  children: React.ReactNode;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

/**
 * Form field wrapper - integrates with React Hook Form
 * Automatically handles error display and field state
 */
export const FormField = React.forwardRef<
  HTMLDivElement,
  FormFieldProps
>(
  (
    { name, children, label, description, required, className },
    ref
  ) => {
    const { formState: { errors } } = useFormContext();
    const error = errors[name];

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {label && (
          <label className={cn('block text-sm font-medium text-slate-700 mb-2')}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-slate-500 text-sm mb-2">{description}</p>
        )}
        {children}
        {error && (
          <p className="text-red-500 text-sm mt-1">
            {error.message as string}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
