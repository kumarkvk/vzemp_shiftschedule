import { useLocation } from 'react-router-dom';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import { ToastViewport } from '@/components/ToastViewport';

export const MainLayout = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const location = useLocation();
  const hideBreadcrumb = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <ToastViewport />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-10">
        {!hideBreadcrumb ? <Breadcrumb /> : null}
        {children}
      </main>
      <Footer />
    </div>
  );
};
