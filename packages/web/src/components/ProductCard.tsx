import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { currency } from '@/lib/utils';
import type { Product } from '@/types';
import { Button } from './Button';

export const ProductCard = ({ product }: { product: Product }): JSX.Element => {
  const { addItem } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = async (): Promise<void> => {
    await addItem(product, 1);
    addToast({ title: 'Added to cart', message: `${product.name} is ready for checkout.`, tone: 'success' });
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft" data-testid="product-card">
      <Link className="block aspect-[4/3] overflow-hidden bg-slate-100" to={`/products/${product.id}`}>
        <img alt={product.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" loading="lazy" src={product.imageUrl} />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{product.category?.name ?? 'Featured'}</div>
          <Link className="text-lg font-semibold text-slate-900 hover:text-brand" to={`/products/${product.id}`}>
            {product.name}
          </Link>
          <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-slate-900">{currency(product.price)}</div>
            <div className="text-xs text-slate-500">{product.inventory > 0 ? 'In stock' : 'Out of stock'}</div>
          </div>
          <Button data-testid="add-to-cart-btn" disabled={product.inventory < 1} onClick={() => void handleAddToCart()}>
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
};
