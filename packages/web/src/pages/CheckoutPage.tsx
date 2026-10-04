import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { orderService } from '@/api/services/orderService';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { PaymentForm } from '@/components/PaymentForm';
import { Seo } from '@/components/Seo';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { currency, getErrorMessage } from '@/lib/utils';
import type { Order, UserAddress } from '@/types';

interface CheckoutValues extends UserAddress {
  billingMatchesShipping: boolean;
}

const CheckoutPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutValues>({ defaultValues: { country: 'US', billingMatchesShipping: true } });

  const subtotal = cart.total;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const nextOrder = await orderService.create({ street: values.street, city: values.city, state: values.state, zip: values.zip, country: values.country });
      setOrder(nextOrder);
      addToast({ title: 'Order created', message: 'Complete payment to finish checkout.', tone: 'success' });
    } catch (err) {
      setError(getErrorMessage(err, 'Checkout could not be started.'));
    } finally {
      setIsSubmitting(false);
    }
  });

  const handlePaymentSuccess = async (): Promise<void> => {
    const orderId = order?.id;
    await clearCart();
    addToast({ title: 'Payment confirmed', message: 'Your order has been placed.', tone: 'success' });
    navigate(orderId ? `/orders/${orderId}` : '/orders');
  };

  return (
    <div className="space-y-8">
      <Seo description="Enter shipping details and securely complete your purchase." title="Checkout" />
      <div><h1 className="text-3xl font-semibold text-slate-900">Checkout</h1><p className="mt-2 text-slate-600">Review your order, confirm shipping, and pay securely.</p></div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><section><h2 className="text-xl font-semibold text-slate-900">Shipping address</h2><form className="mt-6 space-y-4" onSubmit={submit}><div className="grid gap-4 md:grid-cols-2"><FormInput error={errors.street?.message} label="Street" {...register('street', { required: 'Street is required.' })} /><FormInput error={errors.city?.message} label="City" {...register('city', { required: 'City is required.' })} /></div><div className="grid gap-4 md:grid-cols-3"><FormInput error={errors.state?.message} label="State" {...register('state', { required: 'State is required.' })} /><FormInput error={errors.zip?.message} label="ZIP code" {...register('zip', { required: 'ZIP code is required.' })} /><FormInput error={errors.country?.message} label="Country" {...register('country', { required: 'Country is required.' })} /></div><label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"><input className="h-4 w-4" type="checkbox" {...register('billingMatchesShipping')} />Billing address is the same as shipping address</label>{error ? <p className="text-sm text-rose-600">{error}</p> : null}<Button fullWidth isLoading={isSubmitting} type="submit">Create order</Button></form></section>{order ? <section className="rounded-3xl border border-brand/20 bg-brand/5 p-5"><h2 className="text-xl font-semibold text-slate-900">Payment</h2><p className="mt-2 text-sm text-slate-600">Order {order.id} is ready for payment confirmation.</p><div className="mt-5"><PaymentForm onSuccess={handlePaymentSuccess} orderId={order.id} /></div></section> : null}</div><aside className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"><h2 className="text-xl font-semibold text-slate-900">Order review</h2><div className="space-y-4">{cart.items.map((item) => <div className="flex items-center justify-between gap-3" key={item.id}><div><div className="font-medium text-slate-900">{item.product.name}</div><div className="text-sm text-slate-500">Qty {item.quantity}</div></div><div className="font-semibold text-slate-900">{currency(item.product.price * item.quantity)}</div></div>)}</div><dl className="space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600"><div className="flex items-center justify-between"><dt>Subtotal</dt><dd>{currency(subtotal)}</dd></div><div className="flex items-center justify-between"><dt>Tax</dt><dd>{currency(tax)}</dd></div><div className="flex items-center justify-between text-base font-semibold text-slate-900"><dt>Total</dt><dd>{currency(total)}</dd></div></dl></aside></div>
    </div>
  );
};

export default CheckoutPage;
