import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { TextInput } from '@/components/ui/TextInput';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { triggerSuccess } from '@/utils/feedback';
import { toUserFriendlyError } from '@/utils/errors';
import { loginSchema } from '@/utils/validators';

type LoginForm = { email: string; password: string };

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      await triggerSuccess();
      showToast('Welcome back');
    } catch (error) {
      showToast(toUserFriendlyError(error));
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: typography.h1, fontWeight: '800', color: colors.text }}>Sign in</Text>
          <Text style={{ color: colors.textMuted }}>Access orders, saved carts, and personalized offers.</Text>
        </View>
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => <TextInput label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} testID="login-email-input" />} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => <TextInput label="Password" placeholder="••••••••" secureTextEntry value={value} onChangeText={onChange} error={errors.password?.message} testID="login-password-input" />} />
        <ErrorMessage message={errors.root?.message} />
        <Button title="Sign in" loading={isSubmitting} onPress={onSubmit} testID="login-submit-button" />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}><Text style={{ color: colors.primary, textAlign: 'center', fontWeight: '600' }}>Forgot password?</Text></Pressable>
        <Pressable onPress={() => navigation.navigate('Register')}><Text style={{ color: colors.textMuted, textAlign: 'center' }}>Need an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign up</Text></Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
