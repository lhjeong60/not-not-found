import { useState, useEffect, useCallback } from 'react';
import type { Archive, ListArchivesQuery, ListArchivesResponse } from '../types';
import { getArchives } from '../api/client';

interface UseArchivesResult {
  archives: Archive[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setQuery: (q: ListArchivesQuery) => void;
  query: ListArchivesQuery;
}

export function useArchives(initialQuery: ListArchivesQuery = {}): UseArchivesResult {
  const [query, setQuery] = useState<ListArchivesQuery>({
    page: 1,
    limit: 24,
    ...initialQuery,
  });
  const [data, setData] = useState<ListArchivesResponse>({
    data: [],
    total: 0,
    page: 1,
    limit: 24,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getArchives(query);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load archives');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    archives: data.data,
    total: data.total,
    page: data.page,
    limit: data.limit,
    loading,
    error,
    refetch: fetchData,
    setQuery,
    query,
  };
}
