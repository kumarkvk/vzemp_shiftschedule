/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { reportError } from '@/lib/monitoring';
import { getErrorMessage } from '@/lib/utils';

interface UseFetchOptions {
  immediate?: boolean;
  area?: string;
}

export const useFetch = <T,>(fetcher: () => Promise<T>, dependencies: React.DependencyList, options: UseFetchOptions = {}) => {
  const { immediate = true, area = 'data-fetch' } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      reportError(err, { area });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (!immediate) {
      return;
    }
    void execute();
  }, [execute, immediate]);

  return { data, isLoading, error, setData, refetch: execute };
};
