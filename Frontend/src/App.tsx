import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './store/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('./pages/HomePage');
          return { Component: HomePage };
        },
      },
      { path: 'news', element: <Navigate to="/news/news" replace /> },
      {
        path: 'search',
        lazy: async () => {
          const { SearchPage } = await import('./pages/SearchPage');
          return { Component: SearchPage };
        },
      },
      {
        path: 'news/:section',
        lazy: async () => {
          const { NewsSectionPage } = await import('./pages/NewsSectionPage');
          return { Component: NewsSectionPage };
        },
      },
      {
        path: 'login',
        lazy: async () => {
          const { LoginPage } = await import('./pages/LoginPage');
          return { Component: LoginPage };
        },
      },
      {
        path: 'register',
        lazy: async () => {
          const { RegisterPage } = await import('./pages/RegisterPage');
          return { Component: RegisterPage };
        },
      },
      {
        path: 'article',
        lazy: async () => {
          const { ArticleDetailsPage } = await import('./pages/ArticleDetailsPage');
          return { Component: ArticleDetailsPage };
        },
      },

      // Editorial (local articles) — public read
      {
        path: 'articles',
        lazy: async () => {
          const { ArticlesPage } = await import('./pages/ArticlesPage');
          return { Component: ArticlesPage };
        },
      },
      {
        path: 'articles/:id',
        lazy: async () => {
          const { ArticleEditorialViewPage } = await import('./pages/ArticleEditorialViewPage');
          return { Component: ArticleEditorialViewPage };
        },
      },

      // Editor-only area
      {
        element: <ProtectedRoute roles={['editor', 'admin']} />,
        children: [
          {
            path: 'editor',
            lazy: async () => {
              const { EditorPage } = await import('./pages/EditorPage');
              return { Component: EditorPage };
            },
          },
        ],
      },

      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('./pages/NotFoundPage');
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}