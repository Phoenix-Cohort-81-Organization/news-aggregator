export type NewsProvider = 'gnews' | 'guardian';

export interface Article {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  author: string | null;
  section: string | null;
  provider: NewsProvider;
}

export interface NewsSearchResult {
  articles: Article[];
  providers: {
    succeeded: NewsProvider[];
    failed: NewsProvider[];
  };
}

export interface NewsSearchParams {
  q: string;
  pageSize?: number;
  from?: string;
  to?: string;
  country?: string;
  page?: number;
}

export type NewsSectionMode = 'headlines' | 'search';

export interface NewsSection {
  slug: string;
  label: string;
  mode: NewsSectionMode;
  category?: string;
  query?: string;
}

export interface NewsCountry {
  code: string;
  name: string;
}

export interface NewsFilters {
  sections: NewsSection[];
  countries: NewsCountry[];
  gnewsCategories: string[];
}

export interface NewsPagination {
  page: number;
  pageSize: number;
  totalArticles: number;
  totalPages: number;
}

export interface NewsSectionResult extends NewsSearchResult {
  section: NewsSection;
  pagination?: NewsPagination;
}

export interface TopHeadlinesResult extends NewsSearchResult {
  pagination: NewsPagination;
}

export interface ApiHealth {
  success: true;
  message: string;
}
