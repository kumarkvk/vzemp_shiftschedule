import { cn } from '@/lib/utils';

export const LoadingSpinner = ({ className }: { className?: string }): JSX.Element => (
  <div className={cn('flex items-center justify-center py-10', className)} role="status" aria-live="polite">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
    <span className="sr-only">Loading</span>
  </div>
);
