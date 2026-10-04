import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

export const CartIcon = (): JSX.Element => {
  const { itemCount } = useCart();

  return (
    <Link aria-label={`Cart with ${itemCount} items`} className="relative inline-flex items-center rounded-full p-2 text-slate-700 hover:bg-slate-100" to="/cart">
      <span aria-hidden="true" className="text-lg">🛒</span>
      <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
        {itemCount}
      </span>
    </Link>
  );
};
