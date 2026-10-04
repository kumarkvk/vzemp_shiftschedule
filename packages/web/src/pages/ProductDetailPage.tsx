import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productService } from '@/api/services/productService';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProductCard } from '@/components/ProductCard';
import { Seo } from '@/components/Seo';
import { useCart } from '@/hooks/useCart';
import { useFetch } from '@/hooks/useFetch';
import { useToast } from '@/hooks/useToast';
import { currency, formatDate } from '@/lib/utils';

const ProductDetailPage = (): JSX.Element => {
  const { id = '' } = useParams();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading, error } = useFetch(() => productService.detail(id), [id], { area: 'product-detail' });
  const { data: relatedResponse } = useFetch(() => productService.list({ page: 1, limit: 4, category: product?.category?.name }), [product?.category?.name], { immediate: Boolean(product?.category?.name), area: 'related-products' });
  const relatedProducts = useMemo(() => (relatedResponse?.data ?? []).filter((item) => item.id !== product?.id).slice(0, 3), [product?.id, relatedResponse?.data]);

  const handleAddToCart = async (): Promise<void> => {
    if (!product) return;
    await addItem(product, quantity);
    addToast({ title: 'Cart updated', message: `${product.name} has been added to your cart.`, tone: 'success' });
  };

  if (isLoading) return <LoadingSpinner className="py-24" />;
  if (error || !product) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error ?? 'Product not found.'}</div>;

  return (
    <div className="space-y-10">
      <Seo description={product.description} title={product.name} />
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><div className="space-y-4"><div className="overflow-hidden rounded-[2rem] bg-white shadow-soft"><img alt={product.name} className="h-full max-h-[500px] w-full object-cover" src={product.imageUrl} /></div><div className="grid grid-cols-3 gap-4">{[product.imageUrl, product.imageUrl, product.imageUrl].map((image, index) => <button className="overflow-hidden rounded-2xl border border-slate-200 bg-white" key={`${image}-${index}`} type="button"><img alt={`${product.name} preview ${index + 1}`} className="aspect-square w-full object-cover" src={image} /></button>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">{product.category?.name ?? 'General merchandise'}</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">{product.name}</h1><div className="mt-3 text-3xl font-bold text-brand">{currency(product.price)}</div><p className="mt-4 text-slate-600">{product.description}</p><div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2"><div><div className="text-xs uppercase tracking-wide text-slate-500">Stock availability</div><div className="mt-1 font-semibold text-slate-900">{product.inventory > 0 ? `${product.inventory} items ready to ship` : 'Out of stock'}</div></div><div><div className="text-xs uppercase tracking-wide text-slate-500">Rating</div><div className="mt-1 font-semibold text-slate-900">{product.rating ?? product.reviews?.[0]?.rating ?? 4.8} / 5</div></div></div><div className="mt-6 flex items-end gap-4"><label className="flex flex-col text-sm font-medium text-slate-700">Quantity<input className="mt-1 w-24 rounded-xl border border-slate-200 px-4 py-3" min={1} onChange={(event) => setQuantity(Number(event.target.value))} type="number" value={quantity} /></label><Button data-testid="product-detail-add-to-cart" disabled={product.inventory < 1} onClick={() => void handleAddToCart()}>Add to cart</Button><Link to="/cart"><Button variant="secondary">View cart</Button></Link></div></div></section>
      <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><h2 className="text-2xl font-semibold text-slate-900">Customer reviews</h2><div className="mt-6 space-y-4">{(product.reviews?.length ? product.reviews : [{ id: 'placeholder-review', rating: 5, title: 'Trusted by shoppers', comment: 'Customers appreciate the fast delivery and dependable quality.', createdAt: new Date().toISOString(), author: { name: 'Store team' } }]).map((review) => <article className="rounded-2xl border border-slate-200 p-4" key={review.id}><div className="flex items-center justify-between gap-4"><div><h3 className="font-semibold text-slate-900">{review.title ?? 'Verified purchase'}</h3><p className="text-sm text-slate-500">{review.author?.name ?? 'Anonymous'} · {formatDate(review.createdAt)}</p></div><span className="text-sm font-semibold text-brand">{review.rating}/5</span></div><p className="mt-3 text-sm text-slate-600">{review.comment ?? 'Great product and reliable shipping.'}</p></article>)}</div></div><div className="space-y-4"><h2 className="text-2xl font-semibold text-slate-900">Related products</h2><div className="grid gap-4">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>
    </div>
  );
};

export default ProductDetailPage;
