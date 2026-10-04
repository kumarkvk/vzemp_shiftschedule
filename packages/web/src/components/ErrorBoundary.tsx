import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/lib/monitoring';
import { Button } from './Button';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { area: 'render-boundary', metadata: { componentStack: info.componentStack } });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-soft">
            <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-3 text-slate-600">The page hit an unexpected issue. Reload to continue shopping safely.</p>
            <div className="mt-6 flex justify-center"><Button onClick={() => window.location.reload()}>Reload application</Button></div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
