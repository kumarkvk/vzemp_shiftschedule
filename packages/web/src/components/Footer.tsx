import { Link } from 'react-router-dom';

export const Footer = (): JSX.Element => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
      <div>
        <div className="text-lg font-semibold text-slate-900">Ecommerce Storefront</div>
        <p className="mt-2 max-w-xl text-sm text-slate-600">Built for reliable browsing, fast checkout, and production-ready deployments on AKS.</p>
      </div>
      <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
        <Link className="hover:text-brand" to="/products">Products</Link>
        <Link className="hover:text-brand" to="/orders">Orders</Link>
        <Link className="hover:text-brand" to="/profile">Profile</Link>
        <a className="hover:text-brand" href="https://stripe.com" rel="noreferrer" target="_blank">Payments</a>
      </nav>
    </div>
  </footer>
);
