import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollView, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { TextInput } from '@/components/ui/TextInput';
import { colors, radius, spacing } from '@/constants/theme';
import { useCart } from '@/hooks/useCart';
import * as orderService from '@/services/api/orderService';
import { addOrder } from '@/store/slices/ordersSlice';
import type { Address } from '@/types';
import { addressSchema } from '@/utils/validators';

export function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { items, subtotal } = useCart();
  const [billingMatches, setBillingMatches] = useState(true);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: { street: '', city: '', state: '', zip: '', country: 'US' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const order = await orderService.createOrder(values);
    dispatch(addOrder(order));
    navigation.navigate('Payment', { orderId: order.id, totalAmount: order.totalAmount });
  });

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title="Checkout" subtitle="Add a shipping address and review your order." />
      <Controller control={control} name="street" render={({ field: { onChange, value } }) => <TextInput label="Street" value={value} onChangeText={onChange} error={errors.street?.message} />} />
      <Controller control={control} name="city" render={({ field: { onChange, value } }) => <TextInput label="City" value={value} onChangeText={onChange} error={errors.city?.message} />} />
      <Controller control={control} name="state" render={({ field: { onChange, value } }) => <TextInput label="State" value={value} onChangeText={onChange} error={errors.state?.message} />} />
      <Controller control={control} name="zip" render={({ field: { onChange, value } }) => <TextInput label="ZIP code" value={value} onChangeText={onChange} error={errors.zip?.message} />} />
      <Controller control={control} name="country" render={({ field: { onChange, value } }) => <TextInput label="Country" value={value} onChangeText={onChange} error={errors.country?.message} />} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: colors.text }}>Billing address same as shipping</Text><Switch value={billingMatches} onValueChange={setBillingMatches} /></View>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Order review</Text>
        {items.map((item) => <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.textMuted }}>{item.product.name} x {item.quantity}</Text><PriceDisplay amount={item.product.price * item.quantity} /></View>)}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.text, fontWeight: '700' }}>Total</Text><PriceDisplay amount={subtotal * 1.08} /></View>
      </View>
      <Button title="Next: payment" loading={isSubmitting} onPress={onSubmit} />
    </ScrollView>
  );
}
