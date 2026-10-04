import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ListEmptyComponent } from '@/components/ui/ListEmptyComponent';
import { Modal } from '@/components/ui/Modal';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { TextInput } from '@/components/ui/TextInput';
import { colors, radius, spacing } from '@/constants/theme';
import * as adminService from '@/services/api/adminService';
import type { Product } from '@/types';

export function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftName, setDraftName] = useState('');

  const loadProducts = async () => setProducts(await adminService.getAdminProducts());
  useEffect(() => { void loadProducts(); }, []);

  const createProduct = async () => {
    if (!draftName) {
      return;
    }
    await adminService.createAdminProduct({ name: draftName, description: 'New product', price: 0, inventory: 0, imageUrl: '', category: { id: 'default', name: 'General' } });
    setDraftName('');
    setModalVisible(false);
    await loadProducts();
  };

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title="Manage products" subtitle="Add, edit, and retire products from the catalog." />
      <Button title="Add product" onPress={() => setModalVisible(true)} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
            <PriceDisplay amount={item.price} />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button title="Edit" variant="secondary" onPress={() => undefined} style={{ flex: 1 }} />
              <Button title="Delete" variant="danger" onPress={() => void adminService.deleteAdminProduct(item.id).then(loadProducts)} style={{ flex: 1 }} />
            </View>
          </View>
        )}
        ListEmptyComponent={<ListEmptyComponent title="No products found" description="Create your first product to get started." />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Add product" description="Capture the essentials and flesh out details later.">
        <TextInput label="Product name" value={draftName} onChangeText={setDraftName} />
        <Button title="Save" onPress={() => void createProduct()} />
      </Modal>
    </View>
  );
}
