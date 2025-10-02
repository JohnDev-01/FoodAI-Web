import { useState, useEffect, useCallback } from 'react';
import { LoadingState } from '../types';

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    try {
      setLoading({ isLoading: true, error: null });
      const result = await apiCall();
      setData(result);
      setLoading({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setLoading({ isLoading: false, error: errorMessage });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading: loading.isLoading,
    error: loading.error,
    refetch,
  };
}

export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const mutate = useCallback(async (params: P) => {
    try {
      setLoading({ isLoading: true, error: null });
      const result = await apiCall(params);
      setData(result);
      setLoading({ isLoading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setLoading({ isLoading: false, error: errorMessage });
      throw error;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setLoading({ isLoading: false, error: null });
  }, []);

  return {
    data,
    loading: loading.isLoading,
    error: loading.error,
    mutate,
    reset,
  };
}



