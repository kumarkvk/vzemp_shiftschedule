import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Seo } from '@/components/Seo';
import { useCart } from '@/hooks/useCart';
import { currency } from '@/lib/utils';

const CartPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { cart, itemCount, removeItem, updateItem } = useCart();
  const subtotal = cart.total;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="space-y-8">
      <Seo description="Review your cart, update quantities, and continue to checkout." title="Shopping Cart" />
      <div><h1 className="text-3xl font-semibold text-slate-900">Shopping cart</h1><p className="mt-2 text-slate-600">{itemCount} item(s) ready for checkout.</p></div>
      {cart.items.length === 0 ? <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-soft"><h2 className="text-2xl font-semibold text-slate-900">Your cart is empty</h2><p className="mt-3 text-slate-600">Add products to your cart to start checkout.</p><div className="mt-6"><Link to="/products"><Button>Browse products</Button></Link></div></section> : <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"><section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">{cart.items.map((item) => <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row" key={item.id}><img alt={item.product.name} className="h-28 w-full rounded-2xl object-cover md:w-28" src={item.product.imageUrl} /><div className="flex flex-1 flex-col gap-3"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-900">{item.product.name}</h2><p className="text-sm text-slate-500">{item.product.category?.name ?? 'General'}</p></div><div className="text-lg font-semibold text-slate-900">{currency(item.product.price * item.quantity)}</div></div><div className="flex flex-wrap items-center gap-3"><label className="text-sm text-slate-600">Quantity<input className="ml-2 w-20 rounded-xl border border-slate-200 px-3 py-2" min={1} onChange={(event) => void updateItem(item.id, Number(event.target.value))} type="number" value={item.quantity} /></label><Button onClick={() => void removeItem(item.id)} variant="ghost">Remove</Button></div></div></article>)}</section><aside className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><h2 className="text-xl font-semibold text-slate-900">Order summary</h2><dl className="space-y-3 text-sm text-slate-600"><div className="flex items-center justify-between"><dt>Subtotal</dt><dd>{currency(subtotal)}</dd></div><div className="flex items-center justify-between"><dt>Estimated tax</dt><dd>{currency(tax)}</dd></div><div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900"><dt>Total</dt><dd>{currency(total)}</dd></div></dl><Button data-testid="checkout-button" fullWidth onClick={() => navigate('/checkout')}>Proceed to checkout</Button></aside></div>}
    </div>
  );
};

export default CartPage;
