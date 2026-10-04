import { useCallback, useState } from 'react';

export function useAsync<TArgs extends unknown[], TResult>(handler: (...args: TArgs) => Promise<TResult>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (...args: TArgs) => {
    setIsLoading(true);
    setError(null);
    try {
      return await handler(...args);
    } catch (asyncError) {
      const message = asyncError instanceof Error ? asyncError.message : 'Request failed';
      setError(message);
      throw asyncError;
    } finally {
      setIsLoading(false);
    }
  }, [handler]);

  return {
    isLoading,
    error,
    run,
  };
}
