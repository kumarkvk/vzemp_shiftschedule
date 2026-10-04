import { useMemo } from 'react';

export const usePagination = (page: number, pageSize: number, totalItems: number) =>
  useMemo(() => {
    const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
    return {
      pageCount,
      hasNextPage: page < pageCount,
      hasPreviousPage: page > 1,
      startItem: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
      endItem: Math.min(page * pageSize, totalItems),
    };
  }, [page, pageSize, totalItems]);
