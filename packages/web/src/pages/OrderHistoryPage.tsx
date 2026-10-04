import { Link } from 'react-router-dom';
import { orderService } from '@/api/services/orderService';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Seo } from '@/components/Seo';
import { useFetch } from '@/hooks/useFetch';
import { currency, formatDate, titleCase } from '@/lib/utils';

const OrderHistoryPage = (): JSX.Element => {
  const { data, error, isLoading, refetch } = useFetch(() => orderService.list(), [], { area: 'orders-list' });

  return (
    <div className="space-y-6">
      <Seo description="Track current and previous orders, statuses, and next actions." title="Order History" />
      <div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold text-slate-900">Order history</h1><p className="mt-2 text-slate-600">See delivery progress, totals, and return options.</p></div><Button onClick={() => void refetch()} variant="secondary">Refresh</Button></div>
      {isLoading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div> : null}
      <div className="grid gap-4">{data?.data.map((order) => <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft" key={order.id}><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="text-sm text-slate-500">Placed {formatDate(order.createdAt)}</div><h2 className="mt-1 text-xl font-semibold text-slate-900">Order {order.id}</h2><p className="mt-2 text-sm text-slate-600">{order.items.length} item(s) · {currency(order.totalAmount)}</p></div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{titleCase(order.status)}</span><Link to={`/orders/${order.id}`}><Button>View details</Button></Link></div></div></article>)}</div>
    </div>
  );
};

export default OrderHistoryPage;
