import { Pressable, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { TextInput } from '@/components/ui/TextInput';
import { colors, spacing } from '@/constants/theme';
import { useToast } from '@/components/ui/Toast';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title="Reset password" subtitle="We will send a recovery link to your email." />
      <TextInput label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Button title="Send link" onPress={() => showToast('Recovery flow can be wired to your identity provider.')} />
      <Pressable onPress={() => navigation.goBack()}><Text style={{ color: colors.primary, textAlign: 'center', fontWeight: '700' }}>Back to sign in</Text></Pressable>
    </ScrollView>
  );
}
