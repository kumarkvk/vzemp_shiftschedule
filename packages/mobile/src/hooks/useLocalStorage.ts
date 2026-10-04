import { useCallback, useEffect, useState } from 'react';

import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void getStorageItem<T>(key).then((storedValue) => {
      if (mounted && storedValue !== null) {
        setValue(storedValue);
      }
      if (mounted) {
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [key]);

  const updateValue = useCallback(async (nextValue: T) => {
    setValue(nextValue);
    await setStorageItem(key, nextValue);
  }, [key]);

  const clearValue = useCallback(async () => {
    setValue(initialValue);
    await removeStorageItem(key);
  }, [initialValue, key]);

  return { value, isLoading, updateValue, clearValue };
}
