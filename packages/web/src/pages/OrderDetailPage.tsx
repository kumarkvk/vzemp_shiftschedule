import { useParams } from 'react-router-dom';
import { orderService } from '@/api/services/orderService';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Seo } from '@/components/Seo';
import { useFetch } from '@/hooks/useFetch';
import { useToast } from '@/hooks/useToast';
import { currency, formatDate, getErrorMessage, titleCase } from '@/lib/utils';

const OrderDetailPage = (): JSX.Element => {
  const { id = '' } = useParams();
  const { addToast } = useToast();
  const { data: order, error, isLoading, refetch, setData } = useFetch(() => orderService.detail(id), [id], { area: 'order-detail' });

  const handleCancel = async (): Promise<void> => {
    if (!order) return;
    try {
      const updated = await orderService.cancel(order.id);
      setData(updated);
      addToast({ title: 'Order cancelled', message: 'The order status has been updated.', tone: 'success' });
    } catch (err) {
      addToast({ title: 'Unable to cancel order', message: getErrorMessage(err), tone: 'error' });
    }
  };

  const handleReturn = async (): Promise<void> => {
    if (!order) return;
    try {
      const updated = await orderService.requestReturn(order.id);
      setData(updated);
      addToast({ title: 'Return requested', message: 'The support team will follow up shortly.', tone: 'success' });
    } catch (err) {
      addToast({ title: 'Unable to request return', message: getErrorMessage(err), tone: 'error' });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !order) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error ?? 'Order not found.'}</div>;

  return (
    <div className="space-y-8">
      <Seo description={`Track order ${order.id} and its fulfillment progress.`} title={`Order ${order.id}`} />
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-semibold text-slate-900">Order {order.id}</h1><p className="mt-2 text-slate-600">Placed {formatDate(order.createdAt)} · {currency(order.totalAmount)}</p></div><div className="flex flex-wrap gap-3"><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{titleCase(order.status)}</span><Button onClick={() => void refetch()} variant="secondary">Refresh</Button></div></div>
      <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr]"><div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><h2 className="text-xl font-semibold text-slate-900">Items</h2>{order.items.map((item) => <article className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4" key={item.id}><div><div className="font-semibold text-slate-900">{item.product.name}</div><div className="text-sm text-slate-500">Quantity {item.quantity}</div></div><div className="font-semibold text-slate-900">{currency(item.product.price * item.quantity)}</div></article>)}</div><aside className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><h2 className="text-xl font-semibold text-slate-900">Shipping & support</h2><div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"><div>{order.shippingAddress?.street}</div><div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</div><div>{order.shippingAddress?.country}</div></div><div className="flex flex-col gap-3"><Button onClick={() => void handleCancel()} variant="secondary">Cancel order</Button><Button onClick={() => void handleReturn()} variant="ghost">Request return</Button></div></aside></section>
    </div>
  );
};

export default OrderDetailPage;
