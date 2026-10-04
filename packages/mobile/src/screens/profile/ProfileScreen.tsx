import { ScrollView, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { fullName } from '@/utils/format';

export function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title="Profile" subtitle="Manage your account details, security, and delivery preferences." />
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{fullName(user?.firstName, user?.lastName)}</Text>
        <Text style={{ color: colors.textMuted }}>{user?.email}</Text>
        {isAdmin ? <Badge label="Admin" tone="success" /> : <Badge label="Customer" />}
      </View>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Account actions</Text>
        <Button title="Edit profile" variant="secondary" onPress={() => undefined} />
        <Button title="Change password" variant="secondary" onPress={() => undefined} />
        <Button title="Address book" variant="secondary" onPress={() => undefined} />
        <Button title="Notification settings" variant="secondary" onPress={() => undefined} />
        <Divider />
        <Button title="Logout" variant="danger" onPress={() => void logout()} testID="logout-button" />
      </View>
    </ScrollView>
  );
}
