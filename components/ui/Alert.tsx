/**
 * Alert component
 * Display messages, warnings, and errors
 */

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  closable?: boolean;
  onClose?: () => void;
}

const alertStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  error: 'bg-red-50 border-red-200 text-red-900',
};

const iconStyles = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      closable = true,
      onClose,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4 flex gap-3',
          alertStyles[variant],
          className
        )}
        {...props}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[variant])} />
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {closable && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-inherit hover:opacity-70 transition-opacity"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
