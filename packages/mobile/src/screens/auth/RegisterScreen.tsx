import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { triggerSuccess } from '@/utils/feedback';
import { toUserFriendlyError } from '@/utils/errors';
import { registerSchema } from '@/utils/validators';

type RegisterForm = { email: string; password: string; confirmPassword: string; firstName: string; lastName: string };

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register } = useAuth();
  const { showToast } = useToast();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', firstName: '', lastName: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register({ email: values.email, password: values.password, firstName: values.firstName, lastName: values.lastName });
      await triggerSuccess();
      showToast('Account created');
    } catch (error) {
      showToast(toUserFriendlyError(error));
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          <Text style={{ fontSize: typography.h1, fontWeight: '800', color: colors.text }}>Create account</Text>
          <Text style={{ color: colors.textMuted }}>Start shopping with order tracking, saved preferences, and faster checkout.</Text>
        </View>
        <Controller control={control} name="firstName" render={({ field: { onChange, value } }) => <TextInput label="First name" value={value} onChangeText={onChange} error={errors.firstName?.message} />} />
        <Controller control={control} name="lastName" render={({ field: { onChange, value } }) => <TextInput label="Last name" value={value} onChangeText={onChange} error={errors.lastName?.message} />} />
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => <TextInput label="Email" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} />} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => <TextInput label="Password" secureTextEntry value={value} onChangeText={onChange} error={errors.password?.message} />} />
        <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => <TextInput label="Confirm password" secureTextEntry value={value} onChangeText={onChange} error={errors.confirmPassword?.message} />} />
        <Button title="Create account" loading={isSubmitting} onPress={onSubmit} />
        <Pressable onPress={() => navigation.navigate('Login')}><Text style={{ color: colors.textMuted, textAlign: 'center' }}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text></Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
