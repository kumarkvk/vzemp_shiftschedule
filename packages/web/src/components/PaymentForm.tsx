import { useMemo, useState } from 'react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useForm } from 'react-hook-form';
import { paymentService } from '@/api/services/paymentService';
import { env } from '@/config/env';
import { getErrorMessage } from '@/lib/utils';
import { Button } from './Button';
import { FormInput } from './FormInput';

interface PaymentFormProps {
  orderId: string;
  onSuccess: () => Promise<void> | void;
}

interface FallbackPaymentValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const stripePromise = env.hasStripeElements ? loadStripe(env.VITE_STRIPE_PUBLISHABLE_KEY) : null;

const FallbackPaymentForm = ({ orderId, onSuccess }: PaymentFormProps): JSX.Element => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FallbackPaymentValues>();

  const submit = handleSubmit(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const intent = await paymentService.createPaymentIntent(orderId, 'manual_payment_method');
      await paymentService.confirm(orderId, intent.paymentIntentId ?? 'mock_intent');
      await onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Payment could not be confirmed.'));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormInput error={errors.cardholderName?.message} label="Cardholder name" {...register('cardholderName', { required: 'Cardholder name is required.' })} />
      <FormInput error={errors.cardNumber?.message} label="Card number" placeholder="4242 4242 4242 4242" {...register('cardNumber', { required: 'Card number is required.', minLength: { value: 12, message: 'Enter a valid card number.' } })} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput error={errors.expiry?.message} label="Expiry" placeholder="12/29" {...register('expiry', { required: 'Expiry is required.' })} />
        <FormInput error={errors.cvc?.message} label="CVC" placeholder="123" {...register('cvc', { required: 'CVC is required.', minLength: { value: 3, message: 'Enter a valid CVC.' } })} />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button fullWidth isLoading={isSubmitting} type="submit">Confirm payment</Button>
    </form>
  );
};

const StripeCardForm = ({ orderId, onSuccess }: PaymentFormProps): JSX.Element => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<{ cardholderName: string }>();

  const submit = handleSubmit(async (values) => {
    if (!stripe || !elements) {
      return;
    }
    const card = elements.getElement(CardElement);
    if (!card) {
      setError('Payment details are not ready yet.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const intent = await paymentService.createPaymentIntent(orderId, 'card');
      if (!intent.clientSecret) {
        throw new Error('Missing client secret from payment intent.');
      }
      const confirmation = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: {
          card,
          billing_details: { name: values.cardholderName },
        },
      });
      if (confirmation.error) {
        throw confirmation.error;
      }
      const paymentIntentId = confirmation.paymentIntent?.id;
      if (!paymentIntentId) {
        throw new Error('Missing payment intent id.');
      }
      await paymentService.confirm(orderId, paymentIntentId);
      await onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Payment could not be completed.'));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormInput error={errors.cardholderName?.message} label="Cardholder name" {...register('cardholderName', { required: 'Cardholder name is required.' })} />
      <div className="rounded-xl border border-slate-200 px-4 py-4"><CardElement /></div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button fullWidth isLoading={isSubmitting} type="submit">Confirm payment</Button>
    </form>
  );
};

export const PaymentForm = ({ orderId, onSuccess }: PaymentFormProps): JSX.Element => {
  const content = useMemo(() => {
    if (!env.hasStripeElements || !stripePromise) {
      return <FallbackPaymentForm onSuccess={onSuccess} orderId={orderId} />;
    }
    return (
      <Elements stripe={stripePromise}>
        <StripeCardForm onSuccess={onSuccess} orderId={orderId} />
      </Elements>
    );
  }, [onSuccess, orderId]);

  return <>{content}</>;
};
