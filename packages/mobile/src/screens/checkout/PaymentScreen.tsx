import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CardField, useConfirmPayment, useStripe } from '@stripe/stripe-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Header } from '@/components/ui/Header';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { TextInput } from '@/components/ui/TextInput';
import { colors, radius, spacing } from '@/constants/theme';
import * as paymentService from '@/services/api/paymentService';
import { toUserFriendlyError } from '@/utils/errors';

export function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { createPaymentMethod } = useStripe();
  const { confirmPayment } = useConfirmPayment();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const paymentMethod = await createPaymentMethod({ paymentMethodType: 'Card', paymentMethodData: { billingDetails: { name } } });
      if (paymentMethod.error || !paymentMethod.paymentMethod?.id) {
        throw new Error(paymentMethod.error?.message ?? 'Unable to create payment method');
      }
      const intent = await paymentService.createPaymentIntent(route.params.orderId, paymentMethod.paymentMethod.id);
      const confirmation = await confirmPayment(intent.clientSecret, { paymentMethodType: 'Card', paymentMethodData: { billingDetails: { name } } });
      if (confirmation.error || !confirmation.paymentIntent?.id) {
        throw new Error(confirmation.error?.message ?? 'Unable to confirm payment');
      }
      await paymentService.confirmOrderPayment(route.params.orderId, confirmation.paymentIntent.id);
      navigation.navigate('OrderDetail', { orderId: route.params.orderId });
    } catch (paymentError) {
      setError(toUserFriendlyError(paymentError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title="Payment" subtitle="Pay securely with Stripe." />
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md }}><PriceDisplay amount={route.params.totalAmount} /></View>
      <TextInput label="Cardholder name" value={name} onChangeText={setName} />
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md }}>
        <CardField postalCodeEnabled placeholders={{ number: '4242 4242 4242 4242' }} cardStyle={{ textColor: colors.text, placeholderColor: colors.textMuted, backgroundColor: colors.surface }} style={{ width: '100%', height: 50 }} />
      </View>
      <ErrorMessage message={error} />
      <Button title="Pay now" loading={loading} onPress={() => void handlePayment()} testID="pay-now-button" />
      <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}
