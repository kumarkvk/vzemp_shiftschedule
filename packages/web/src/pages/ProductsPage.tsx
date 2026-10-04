import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '@/api/services/productService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { Seo } from '@/components/Seo';
import { useDebounce } from '@/hooks/useDebounce';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';

const ProductsPage = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
  const debouncedSearch = useDebounce(search, 400);

  const sortConfig = useMemo(() => {
    if (sortBy === 'price-asc') return { sortBy: 'price' as const, sortOrder: 'asc' as const };
    if (sortBy === 'price-desc') return { sortBy: 'price' as const, sortOrder: 'desc' as const };
    if (sortBy === 'name') return { sortBy: 'name' as const, sortOrder: 'asc' as const };
    return { sortBy: 'newest' as const, sortOrder: 'desc' as const };
  }, [sortBy]);

  const { data, isLoading, error, refetch } = useFetch(() => productService.list({ page, limit: 10, search: debouncedSearch || undefined, category: category || undefined, ...sortConfig }), [category, debouncedSearch, page, sortConfig], { area: 'product-list' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sortBy) params.set('sort', sortBy);
    params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [category, page, search, setSearchParams, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch, sortBy]);

  const categories = useMemo(() => {
    const values = (data?.data ?? []).map((product) => product.category?.name).filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort();
  }, [data?.data]);

  const pagination = usePagination(page, 10, data?.pagination.total ?? 0);

  return (
    <div className="space-y-6">
      <Seo description="Filter, search, and sort products with responsive catalog controls." title="Products" />
      <div><h1 className="text-3xl font-semibold text-slate-900">Products</h1><p className="mt-2 text-slate-600">Discover products with fast search, helpful filters, and responsive grids.</p></div>
      <ProductFilters categories={categories} category={category} onCategoryChange={setCategory} onReset={() => { setSearch(''); setCategory(''); setSortBy('newest'); setPage(1); }} onSearchChange={setSearch} onSortChange={setSortBy} search={search} sortBy={sortBy} />
      <div className="flex items-center justify-between text-sm text-slate-600"><span>Showing {pagination.startItem}-{pagination.endItem} of {data?.pagination.total ?? 0} products</span><button className="font-semibold text-brand hover:text-brand-dark" onClick={() => void refetch()} type="button">Refresh results</button></div>
      {isLoading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div> : null}
      {!isLoading && !error ? <><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{data?.data.map((product) => <ProductCard key={product.id} product={product} />)}</div><Pagination onChange={setPage} page={page} pageCount={pagination.pageCount} /></> : null}
    </div>
  );
};

export default ProductsPage;
