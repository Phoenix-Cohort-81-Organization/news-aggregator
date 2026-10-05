import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createArticle,
  deleteArticle,
  getArticleById,
  listArticles,
  updateArticle,
  type ArticleListParams,
} from '../api/article.api';
import type { CreateArticleInput, UpdateArticleInput } from '../types/article';

export const articleQueryKeys = {
  all: ['articles'] as const,
  list: (params: ArticleListParams) => ['articles', 'list', params] as const,
  detail: (id: string) => ['articles', 'detail', id] as const,
};

export const useArticles = (params: ArticleListParams = {}) =>
  useQuery({
    queryKey: articleQueryKeys.list(params),
    queryFn: ({ signal }) => listArticles(params, signal),
    staleTime: 30_000,
    retry: 1,
  });

export const useArticle = (id: string | undefined) =>
  useQuery({
    queryKey: articleQueryKeys.detail(id ?? ''),
    queryFn: ({ signal }) => getArticleById(id as string, signal),
    enabled: Boolean(id),
    staleTime: 30_000,
    retry: 1,
  });

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateArticleInput) => createArticle(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: articleQueryKeys.all });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateArticleInput }) =>
      updateArticle(id, input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: articleQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: articleQueryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: articleQueryKeys.all });
    },
  });
};