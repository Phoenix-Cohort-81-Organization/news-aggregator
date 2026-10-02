import { useQuery } from '@tanstack/react-query';
import { checkApiHealth, getNewsFilters, getNewsSection, getTopHeadlines } from '../api/news.api';

export const newsQueryKeys = {
  all: ['news'] as const,
  filters: ['news', 'filters'] as const,
  health: ['api', 'health'] as const,
  section: (section: string, country: string, page: number) =>
    ['news', 'section', section, country, page] as const,
  headlines: (category: string, country: string, page: number) =>
    ['news', 'headlines', category, country, page] as const,
};

export const useNewsFilters = () =>
  useQuery({
    queryKey: newsQueryKeys.filters,
    queryFn: ({ signal }) => getNewsFilters(signal),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

export const useNewsSection = (section: string, country: string, page = 1) =>
  useQuery({
    queryKey: newsQueryKeys.section(section, country, page),
    queryFn: ({ signal }) =>
      getNewsSection(section, { country: country || undefined, page, pageSize: 10 }, signal),
    staleTime: 60_000,
    retry: 1,
  });

export const useTopHeadlines = (category: string, country: string, page = 1) =>
  useQuery({
    queryKey: newsQueryKeys.headlines(category, country, page),
    queryFn: ({ signal }) =>
      getTopHeadlines(
        { category, country: country || undefined, page, pageSize: 10 },
        signal,
      ),
    staleTime: 60_000,
    retry: 1,
  });

export const useApiHealth = () =>
  useQuery({
    queryKey: newsQueryKeys.health,
    queryFn: ({ signal }) => checkApiHealth(signal),
    staleTime: 30_000,
    retry: 0,
    refetchInterval: 60_000,
  });
