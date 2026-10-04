import { type FormEvent, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { initials } from '@/lib/utils';
import { Button } from './Button';
import { CartIcon } from './CartIcon';

const navLinkClasses = ({ isActive }: { isActive: boolean }): string => `text-sm font-medium transition ${isActive ? 'text-brand' : 'text-slate-700 hover:text-brand'}`;

export const Navigation = (): JSX.Element => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button aria-label="Toggle menu" className="inline-flex rounded-full border border-slate-200 p-2 md:hidden" onClick={() => setIsMenuOpen((current) => !current)} type="button">☰</button>
            <Link className="text-xl font-bold text-slate-900" to="/">Ecommerce Storefront</Link>
          </div>
          <form className="hidden flex-1 md:block" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="global-search">Search products</label>
            <input className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:bg-white" id="global-search" onChange={(event) => setSearch(event.target.value)} placeholder="Search products, categories, and brands" value={search} />
          </form>
          <div className="flex items-center gap-2">
            <CartIcon />
            {isAuthenticated ? (
              <div className="hidden items-center gap-3 md:flex">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{initials(user ?? undefined)}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-slate-500">{isAdmin ? 'Administrator' : `${itemCount} item(s) in cart`}</div>
                </div>
                <Button onClick={logout} variant="ghost">Logout</Button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button onClick={() => navigate('/login')} variant="ghost">Login</Button>
                <Button onClick={() => navigate('/register')}>Create account</Button>
              </div>
            )}
          </div>
        </div>
        <div className={`${isMenuOpen ? 'grid' : 'hidden'} gap-4 md:grid md:grid-cols-[auto_1fr_auto] md:items-center`}>
          <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-4">
            <NavLink className={navLinkClasses} data-testid="home-link" to="/">Home</NavLink>
            <NavLink className={navLinkClasses} data-testid="products-link" to="/products">Products</NavLink>
            <NavLink className={navLinkClasses} to="/cart">Cart</NavLink>
            {isAuthenticated ? <NavLink className={navLinkClasses} to="/orders">Orders</NavLink> : null}
            {isAuthenticated ? <NavLink className={navLinkClasses} to="/profile">Profile</NavLink> : null}
            {isAdmin ? <NavLink className={navLinkClasses} to="/admin">Admin</NavLink> : null}
          </nav>
          <form className="md:hidden" onSubmit={handleSearch}>
            <input className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search products" value={search} />
          </form>
          {!isAuthenticated ? <div className="flex gap-2 md:hidden"><Button fullWidth onClick={() => navigate('/login')} variant="secondary">Login</Button><Button fullWidth onClick={() => navigate('/register')}>Sign up</Button></div> : null}
        </div>
      </div>
    </header>
  );
};
