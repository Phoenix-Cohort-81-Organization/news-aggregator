export type ArticleCategory =
  | 'politics'
  | 'business'
  | 'entertainment'
  | 'general'
  | 'health'
  | 'science'
  | 'sports'
  | 'technology'
  | 'world'
  | 'lifestyle'
  | 'fashion'
  | 'travel'
  | 'food'
  | 'culture'
  | 'education'
  | 'environment'
  | 'opinion'
  | 'other';

export interface Article {
  _id: string;
  title: string;
  description: string | null;
  content: string;
  url: string;
  imageUrl: string | null;
  author: string | null;
  source: string | null;
  section: string | null;
  category: ArticleCategory | null;
  language: string;
  publishedAt: string;
  author_user: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ArticleListResult {
  articles: Article[];
  pagination: ArticlePagination;
}

export interface CreateArticleInput {
  title: string;
  description?: string;
  content?: string;
  url: string;
  imageUrl?: string;
  author?: string;
  source?: string;
  section?: string;
  category?: ArticleCategory;
  language?: string;
  publishedAt: string;
}

export type UpdateArticleInput = Partial<CreateArticleInput>;