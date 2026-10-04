import { useCallback, useEffect, useState } from 'react';

export function useFetch<T>(fetcher: () => Promise<T>, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const execute = useCallback(async (refresh = false) => {
    setError(null);
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const response = await fetcher();
      setData(response);
      return response;
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load data');
      throw fetchError;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) {
      void execute();
    }
  }, [execute, immediate]);

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    execute,
  };
}
