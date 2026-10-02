import { AlertCircle, SearchX } from 'lucide-react';

interface FeedbackProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: FeedbackProps) {
  return (
    <div className="border border-dashed border-line bg-white px-6 py-12 text-center">
      <SearchX className="mx-auto mb-3 text-muted" size={25} aria-hidden="true" />
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}

export function ErrorState({ title, message, onRetry }: FeedbackProps & { onRetry?: () => void }) {
  return (
    <div role="alert" className="border border-red-200 bg-red-50 px-6 py-8 text-center">
      <AlertCircle className="mx-auto mb-3 text-red-700" size={25} aria-hidden="true" />
      <h3 className="font-semibold text-red-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 font-semibold text-red-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}
