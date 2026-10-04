import { forwardRef } from 'react';
import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BaseProps {
  label: string;
  error?: string;
  helperText?: string;
  textarea?: boolean;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FormInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, helperText, className, textarea, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sharedClasses = cn(
      'mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20',
      error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
      className,
    );

    return (
      <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
        <span>{label}</span>
        {textarea ? (
          <textarea
            aria-invalid={Boolean(error)}
            className={sharedClasses}
            id={inputId}
            ref={ref as Ref<HTMLTextAreaElement>}
            rows={4}
            {...props}
          />
        ) : (
          <input
            aria-invalid={Boolean(error)}
            className={sharedClasses}
            id={inputId}
            ref={ref as Ref<HTMLInputElement>}
            {...props}
          />
        )}
        {error ? <span className="mt-1 block text-sm text-rose-600">{error}</span> : null}
        {!error && helperText ? <span className="mt-1 block text-xs text-slate-500">{helperText}</span> : null}
      </label>
    );
  },
);

FormInput.displayName = 'FormInput';
