import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '../api/axios';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import {
  useArticles,
  useCreateArticle,
  useDeleteArticle,
  useUpdateArticle,
} from '../hooks/useArticles';
import { useAuth } from '../store/AuthContext';
import type { Article, ArticleCategory } from '../types/article';

const CATEGORIES: ArticleCategory[] = [
  'general', 'politics', 'business', 'technology', 'science',
  'health', 'sports', 'entertainment', 'world', 'culture',
  'lifestyle', 'travel', 'education', 'environment', 'opinion', 'other',
];

const articleSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  content: z.string().trim().max(20000).optional().or(z.literal('')),
  url: z.string().trim().url('Must be a valid URL'),
  imageUrl: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
  author: z.string().trim().max(100).optional().or(z.literal('')),
  source: z.string().trim().max(100).optional().or(z.literal('')),
  section: z.string().trim().max(100).optional().or(z.literal('')),
  category: z.enum(CATEGORIES as [ArticleCategory, ...ArticleCategory[]]).optional(),
  publishedAt: z.string().min(1, 'Published date is required'),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const toFormValues = (article?: Article | null): ArticleFormValues => ({
  title: article?.title ?? '',
  description: article?.description ?? '',
  content: article?.content ?? '',
  url: article?.url ?? '',
  imageUrl: article?.imageUrl ?? '',
  author: article?.author ?? '',
  source: article?.source ?? '',
  section: article?.section ?? '',
  category: (article?.category as ArticleCategory) ?? 'general',
  publishedAt: article?.publishedAt
    ? new Date(article.publishedAt).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16),
});

export function EditorPage() {
  const { isAdmin } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.title = 'Editor — TheFeeds';
  }, []);

  const list = useArticles({ page: 1, limit: 50 });
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

  const editingArticle = editingId
    ? list.data?.articles.find((a) => a._id === editingId) ?? null
    : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: toFormValues(),
  });

  useEffect(() => {
    reset(toFormValues(editingArticle));
  }, [editingArticle, reset]);

  const clearMessages = () => {
    setServerError('');
    setSuccessMessage('');
  };

  const onSubmit = handleSubmit(async (values) => {
    clearMessages();
    const payload = {
      ...values,
      description: values.description || undefined,
      content: values.content || undefined,
      imageUrl: values.imageUrl || undefined,
      author: values.author || undefined,
      source: values.source || undefined,
      section: values.section || undefined,
      publishedAt: new Date(values.publishedAt).toISOString(),
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, input: payload });
        setSuccessMessage('Article updated.');
        setEditingId(null);
        reset(toFormValues());
      } else {
        await createMutation.mutateAsync(payload);
        setSuccessMessage('Article created.');
        reset(toFormValues());
      }
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Something went wrong.');
    }
  });

  const onDelete = async (article: Article) => {
    clearMessages();
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(article._id);
      setSuccessMessage('Article deleted.');
      if (editingId === article._id) {
        setEditingId(null);
        reset(toFormValues());
      }
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Unable to delete.');
    }
  };

  const onEdit = (article: Article) => {
    clearMessages();
    setEditingId(article._id);
  };

  const onCancelEdit = () => {
    clearMessages();
    setEditingId(null);
    reset(toFormValues());
  };

  return (
    <section>
      <div className="mb-6 border-b border-line pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Editor</p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">Editorial workspace</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Create, edit, and publish original articles. Only editors and admins can access this page.
          {isAdmin ? ' As an admin, you can also delete articles.' : ' Only admins can delete articles.'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <h2 className="mb-3 text-lg font-bold">
            {editingId ? 'Editing article' : 'New article'}
          </h2>

          {serverError && (
            <p className="mb-3 border-l-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {serverError}
            </p>
          )}
          {successMessage && (
            <p className="mb-3 border-l-2 border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
              {successMessage}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-4 border border-line bg-white p-5" noValidate>
            <Field label="Title" error={errors.title?.message}>
              <input {...register('title')} className={inputClass} />
            </Field>

            <Field label="Description (optional)" error={errors.description?.message}>
              <textarea {...register('description')} rows={2} className={inputClass} />
            </Field>

            <Field label="Content (optional)" error={errors.content?.message}>
              <textarea {...register('content')} rows={6} className={inputClass} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" error={errors.category?.message}>
                <select {...register('category')} className={`${inputClass} capitalize`}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Published at" error={errors.publishedAt?.message}>
                <input type="datetime-local" {...register('publishedAt')} className={inputClass} />
              </Field>
            </div>

            <Field label="Reference URL" error={errors.url?.message}>
              <input type="url" {...register('url')} placeholder="https://example.com/article" className={inputClass} />
            </Field>

            <Field label="Image URL (optional)" error={errors.imageUrl?.message}>
              <input type="url" {...register('imageUrl')} className={inputClass} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Author (optional)" error={errors.author?.message}>
                <input {...register('author')} className={inputClass} />
              </Field>
              <Field label="Source (optional)" error={errors.source?.message}>
                <input {...register('source')} className={inputClass} />
              </Field>
            </div>

            <Field label="Section (optional)" error={errors.section?.message}>
              <input {...register('section')} className={inputClass} />
            </Field>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#941e25] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Plus size={16} aria-hidden="true" />
                {editingId ? 'Save changes' : 'Create article'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="inline-flex items-center gap-2 border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <X size={16} aria-hidden="true" /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">Published articles</h2>
          {list.isPending ? (
            <p className="text-sm text-muted" role="status">Loading…</p>
          ) : list.isError ? (
            <ErrorState
              title="Unable to load articles"
              message={list.error instanceof Error ? list.error.message : 'Please try again.'}
              onRetry={() => void list.refetch()}
            />
          ) : list.data.articles.length === 0 ? (
            <EmptyState title="No articles yet" message="Create your first article using the form." />
          ) : (
            <ul className="space-y-3">
              {list.data.articles.map((article) => (
                <li
                  key={article._id}
                  className={`border border-line bg-white p-4 ${editingId === article._id ? 'ring-2 ring-accent' : ''}`}
                >
                  {article.category && (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                      {article.category}
                    </p>
                  )}
                  <p className="font-semibold leading-snug text-ink">{article.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(article.publishedAt))}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(article)}
                      className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Pencil size={12} aria-hidden="true" /> Edit
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => void onDelete(article)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1.5 border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:border-red-700 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                      >
                        <Trash2 size={12} aria-hidden="true" /> Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

const inputClass =
  'w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-accent/30';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}