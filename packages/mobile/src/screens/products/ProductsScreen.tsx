import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { ProductCard } from '@/components/ProductCard';
import { ListEmptyComponent } from '@/components/ui/ListEmptyComponent';
import { Loading } from '@/components/ui/Loading';
import { TextInput } from '@/components/ui/TextInput';
import { colors, radius, spacing } from '@/constants/theme';
import { useDimensions } from '@/hooks/useDimensions';
import * as productService from '@/services/api/productService';
import type { RootState } from '@/store';
import { appendProducts, setProducts } from '@/store/slices/productsSlice';

const sortOptions = ['latest', 'price-asc', 'price-desc', 'rating'] as const;

export function ProductsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { columns } = useDimensions();
  const productsState = useSelector((state: RootState) => state.products);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<(typeof sortOptions)[number]>('latest');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = useMemo(() => Array.from(new Set(productsState.items.map((item) => item.category.name))), [productsState.items]);

  const loadProducts = useCallback(async (page = 1, append = false) => {
    if (append) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await productService.listProducts({ page, limit: 10, search, category, sort });
      if (append) {
        dispatch(appendProducts({ items: response.data, pagination: response.pagination }));
      } else {
        dispatch(setProducts({ items: response.data, pagination: response.pagination }));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, dispatch, search, sort]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  if (loading && !productsState.items.length) {
    return <Loading label="Loading products" />;
  }

  return (
    <View style={{ flex: 1, padding: spacing.md, gap: spacing.md, backgroundColor: colors.background }}>
      <TextInput label="Search" value={search} onChangeText={setSearch} placeholder="Search products" testID="product-search-input" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {['All', ...categories].map((value) => {
          const active = value === 'All' ? !category : category == value;
          return <Pressable key={value} onPress={() => setCategory(value === 'All' ? undefined : value)} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: active ? colors.primary : colors.surface }}><Text style={{ color: active ? '#FFFFFF' : colors.text }}>{value}</Text></Pressable>;
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        {sortOptions.map((value) => <Pressable key={value} onPress={() => setSort(value)} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: sort === value ? colors.primaryMuted : colors.surface }}><Text style={{ color: sort === value ? colors.primary : colors.text }}>{value}</Text></Pressable>)}
      </View>
      <FlatList
        data={productsState.items}
        key={columns}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? { gap: spacing.md } : undefined}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadProducts()} />}
        onEndReached={() => { if (productsState.items.length < productsState.pagination.total) { void loadProducts(productsState.pagination.page + 1, true); } }}
        onEndReachedThreshold={0.2}
        renderItem={({ item }) => <View style={{ flex: 1 / columns }}><ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} /></View>}
        ListEmptyComponent={<ListEmptyComponent title="No products found" description="Try adjusting your search or filter." />}
        testID="products-list"
      />
    </View>
  );
}
