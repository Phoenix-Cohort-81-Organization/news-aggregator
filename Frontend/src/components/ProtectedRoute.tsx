import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { EmptyState } from './ui/Feedback';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  roles?: string[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <section className="mx-auto max-w-2xl py-12">
        <EmptyState
          title="You don't have access to this page"
          message="This area is restricted to editors and administrators. If you believe this is a mistake, contact the site admin."
        />
        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  return <Outlet />;
}