import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Seo } from '@/components/Seo';

const NotFoundPage = (): JSX.Element => (
  <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft">
    <Seo description="The requested page was not found." title="Not Found" />
    <div className="text-sm font-semibold uppercase tracking-wide text-brand-muted">404</div>
    <h1 className="mt-4 text-4xl font-semibold text-slate-900">Page not found</h1>
    <p className="mt-4 text-slate-600">The link may have moved. Return home or browse products to continue shopping.</p>
    <div className="mt-8 flex justify-center gap-4"><Link to="/"><Button>Go home</Button></Link><Link to="/products"><Button variant="secondary">Browse products</Button></Link></div>
  </div>
);

export default NotFoundPage;
