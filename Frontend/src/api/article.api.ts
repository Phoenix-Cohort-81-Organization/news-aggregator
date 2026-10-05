import type { ApiSuccess } from '../types/api';
import type {
  Article,
  ArticleListResult,
  CreateArticleInput,
  UpdateArticleInput,
} from '../types/article';
import api from './axios';

export interface ArticleListParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const listArticles = async (
  params: ArticleListParams = {},
  signal?: AbortSignal,
): Promise<ArticleListResult> => {
  const response = await api.get<ApiSuccess<ArticleListResult>>('/articles', {
    params,
    signal,
  });
  return response.data.data;
};

export const getArticleById = async (
  id: string,
  signal?: AbortSignal,
): Promise<Article> => {
  const response = await api.get<ApiSuccess<{ article: Article }>>(
    `/articles/${encodeURIComponent(id)}`,
    { signal },
  );
  return response.data.data.article;
};

export const createArticle = async (
  input: CreateArticleInput,
): Promise<Article> => {
  const response = await api.post<ApiSuccess<{ article: Article }>>('/articles', input);
  return response.data.data.article;
};

export const updateArticle = async (
  id: string,
  input: UpdateArticleInput,
): Promise<Article> => {
  const response = await api.put<ApiSuccess<{ article: Article }>>(
    `/articles/${encodeURIComponent(id)}`,
    input,
  );
  return response.data.data.article;
};

export const deleteArticle = async (id: string): Promise<void> => {
  await api.delete(`/articles/${encodeURIComponent(id)}`);
};