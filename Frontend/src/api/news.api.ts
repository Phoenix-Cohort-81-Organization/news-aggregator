import type { ApiSuccess } from '../types/api';
import type {
  ApiHealth,
  NewsFilters,
  NewsSearchParams,
  NewsSearchResult,
  NewsSectionResult,
  TopHeadlinesResult,
} from '../types/news';
import api from './axios';

export const searchNews = async (
  params: NewsSearchParams,
  signal?: AbortSignal,
): Promise<NewsSearchResult> => {
  const response = await api.get<ApiSuccess<NewsSearchResult>>('/news', {
    params,
    signal,
  });

  return response.data.data;
};

export const getNewsFilters = async (signal?: AbortSignal): Promise<NewsFilters> => {
  const response = await api.get<ApiSuccess<NewsFilters>>('/news/filters', { signal });
  return response.data.data;
};

export const getNewsSection = async (
  section: string,
  params: { country?: string; page?: number; pageSize?: number },
  signal?: AbortSignal,
): Promise<NewsSectionResult> => {
  const response = await api.get<ApiSuccess<NewsSectionResult>>(
    `/news/sections/${encodeURIComponent(section)}`,
    { params, signal },
  );
  return response.data.data;
};

export const getTopHeadlines = async (
  params: { category?: string; country?: string; page?: number; pageSize?: number },
  signal?: AbortSignal,
): Promise<TopHeadlinesResult> => {
  const response = await api.get<ApiSuccess<TopHeadlinesResult>>('/news/headlines', {
    params,
    signal,
  });
  return response.data.data;
};

export const checkApiHealth = async (signal?: AbortSignal): Promise<ApiHealth> => {
  const response = await api.get<ApiHealth>('/health', { signal });
  return response.data;
};
