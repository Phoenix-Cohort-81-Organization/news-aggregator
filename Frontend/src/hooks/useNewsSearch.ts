import { useQuery } from '@tanstack/react-query';
import type { NewsSearchParams } from '../types/news';
import { searchNews } from '../api/news.api';

export const newsQueryKeys = {
  all: ['news'] as const,
  search: (params: NewsSearchParams) => [...newsQueryKeys.all, 'search', params] as const,
};

export const useNewsSearch = (params: NewsSearchParams | null) =>
  useQuery({
    queryKey: params ? newsQueryKeys.search(params) : [...newsQueryKeys.all, 'search', 'idle'],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error('A search query is required.');
      }

      return searchNews(params, signal);
    },
    enabled: Boolean(params),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error && error.status === 400) {
        return false;
      }

      return failureCount < 2;
    },
  });
