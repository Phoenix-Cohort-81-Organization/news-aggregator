import { useState, type ReactNode } from 'react';
import { useForm, type FieldValues, type Path, type Resolver } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/axios';

interface AuthField<TValues extends FieldValues> {
  name: Path<TValues>;
  label: string;
  type: 'text' | 'email' | 'password';
  autoComplete: string;
}

interface AuthFormProps<TValues extends FieldValues> {
  title: string;
  description: string;
  submitLabel: string;
  resolver: Resolver<TValues>;
  fields: readonly AuthField<TValues>[];
  onSubmit: (values: TValues) => Promise<void>;
  footer: ReactNode;
}

export function AuthForm<TValues extends FieldValues>({
  title,
  description,
  submitLabel,
  resolver,
  fields,
  onSubmit,
  footer,
}: AuthFormProps<TValues>) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TValues>({ resolver });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Unable to complete your request.');
    }
  });

  return (
    <section className="mx-auto max-w-md py-6">
      <div className="border-t-4 border-accent bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">TheFeeds account</p>
        <h1 className="mt-3 font-serif text-3xl text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
          {serverError && (
            <p className="border-l-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {serverError}
            </p>
          )}
          {fields.map((field) => {
            const error = errors[field.name];
            const errorId = `${String(field.name)}-error`;
            return (
              <div key={field.name}>
                <label htmlFor={String(field.name)} className="mb-1.5 block text-sm font-semibold text-ink">
                  {field.label}
                </label>
                <input
                  id={String(field.name)}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  {...register(field.name)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className="w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-accent/30"
                />
                {error && (
                  <p id={errorId} className="mt-1.5 text-sm text-red-700" role="alert">
                    {String(error.message)}
                  </p>
                )}
              </div>
            );
          })}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait…' : submitLabel}
          </button>
        </form>
        <div className="mt-6 border-t border-line pt-5 text-sm text-muted">{footer}</div>
      </div>
    </section>
  );
}

export function AuthFooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      {children}
    </Link>
  );
}
