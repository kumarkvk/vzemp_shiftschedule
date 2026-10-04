import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  error: 'border-rose-200 bg-rose-50 text-rose-950',
  info: 'border-sky-200 bg-sky-50 text-sky-950',
} as const;

export const ToastViewport = (): JSX.Element => {
  const { toasts, dismissToast } = useToast();
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div className={cn('pointer-events-auto rounded-2xl border p-4 shadow-soft', toneClasses[toast.tone ?? 'info'])} key={toast.id} role="status">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold">{toast.title}</div>
              {toast.message ? <div className="mt-1 text-sm opacity-80">{toast.message}</div> : null}
            </div>
            <button aria-label="Dismiss notification" className="text-sm font-medium opacity-70 hover:opacity-100" onClick={() => dismissToast(toast.id)} type="button">Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
};
