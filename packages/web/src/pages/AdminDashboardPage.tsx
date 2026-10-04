import { Link } from 'react-router-dom';
import { adminService } from '@/api/services/adminService';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Seo } from '@/components/Seo';
import { useFetch } from '@/hooks/useFetch';
import { currency, formatDate } from '@/lib/utils';

const AdminDashboardPage = (): JSX.Element => {
  const { data, error, isLoading, refetch } = useFetch(() => adminService.dashboard(), [], { area: 'admin-dashboard' });

  return (
    <div className="space-y-6">
      <Seo description="Review revenue, users, orders, and recent admin activity." title="Admin Dashboard" />
      <div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold text-slate-900">Admin dashboard</h1><p className="mt-2 text-slate-600">Track performance with recent orders and high-level analytics.</p></div><Button onClick={() => void refetch()} variant="secondary">Refresh</Button></div>
      {isLoading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div> : null}
      {data ? <><section className="grid gap-4 md:grid-cols-3"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><div className="text-sm text-slate-500">Total users</div><div className="mt-3 text-3xl font-semibold text-slate-900">{data.totalUsers}</div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><div className="text-sm text-slate-500">Orders</div><div className="mt-3 text-3xl font-semibold text-slate-900">{data.totalOrders}</div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><div className="text-sm text-slate-500">Revenue</div><div className="mt-3 text-3xl font-semibold text-slate-900">{currency(data.totalRevenue)}</div></article></section><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><div className="mb-6 flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold text-slate-900">Recent orders</h2><p className="text-sm text-slate-600">Monitor the latest customer activity.</p></div><Link to="/admin/products"><Button>Manage products</Button></Link></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-left text-sm"><thead><tr className="text-slate-500"><th className="pb-3 pr-4 font-medium">Order</th><th className="pb-3 pr-4 font-medium">Date</th><th className="pb-3 pr-4 font-medium">Items</th><th className="pb-3 pr-4 font-medium">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{data.recentOrders.map((order) => <tr key={order.id}><td className="py-4 pr-4 font-medium text-slate-900">{order.id}</td><td className="py-4 pr-4 text-slate-600">{formatDate(order.createdAt)}</td><td className="py-4 pr-4 text-slate-600">{order.items.length}</td><td className="py-4 pr-4 font-semibold text-slate-900">{currency(order.totalAmount)}</td></tr>)}</tbody></table></div></section></> : null}
    </div>
  );
};

export default AdminDashboardPage;
