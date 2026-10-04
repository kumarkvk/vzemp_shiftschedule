import { Link } from 'react-router-dom';
import { productService } from '@/api/services/productService';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProductCard } from '@/components/ProductCard';
import { Seo } from '@/components/Seo';
import { useFetch } from '@/hooks/useFetch';

const HomePage = (): JSX.Element => {
  const { data, isLoading, error } = useFetch(() => productService.list({ page: 1, limit: 4, sortBy: 'newest' }), [], { area: 'home-featured-products' });

  return (
    <div className="space-y-12">
      <Seo description="Explore featured products, fast checkout, and secure order management." title="Home" />
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-soft md:px-10 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-10">
        <div>
          <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Phase 3 storefront</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">Production-ready ecommerce experiences for every screen.</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">Browse curated products, manage your cart without page reloads, and complete secure checkout flows with responsive, accessible UI components.</p>
          <div className="mt-8 flex flex-wrap gap-4"><Link to="/products"><Button>Shop now</Button></Link><Link to="/admin"><Button variant="secondary">View admin insights</Button></Link></div>
        </div>
        <div className="mt-8 grid gap-4 rounded-[2rem] bg-white/5 p-6 lg:mt-0">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5"><div className="text-sm text-slate-300">Reliable shopping flow</div><div className="mt-2 text-3xl font-semibold">Browse → Cart → Checkout</div></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5"><div className="text-sm text-slate-300">Stateful cart</div><div className="mt-2 text-xl font-semibold">Instant updates</div></div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5"><div className="text-sm text-slate-300">Security</div><div className="mt-2 text-xl font-semibold">JWT + refresh</div></div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5"><div className="text-sm text-slate-300">Deployment</div><div className="mt-2 text-xl font-semibold">Docker + Nginx</div></div>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold text-slate-900">Featured products</h2><p className="text-slate-600">Start with the latest additions from the catalog.</p></div><Link className="text-sm font-semibold text-brand hover:text-brand-dark" to="/products">Browse all products</Link></div>
        {isLoading ? <LoadingSpinner /> : null}
        {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div> : null}
        {!isLoading && !error ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{data?.data.map((product) => <ProductCard key={product.id} product={product} />)}</div> : null}
      </section>
    </div>
  );
};

export default HomePage;
