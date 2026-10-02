import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthFooterLink, AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../store/AuthContext';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema';

const fields = [
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
] as const;

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign in — TheFeeds';
  }, []);

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <AuthForm<LoginFormValues>
      title="Welcome back"
      description="Sign in to your TheFeeds account."
      submitLabel="Sign in"
      resolver={zodResolver(loginSchema)}
      fields={fields}
      onSubmit={async (values) => {
        await signIn(values);
        navigate('/', { replace: true });
      }}
      footer={<>New to TheFeeds? <AuthFooterLink to="/register">Create an account</AuthFooterLink></>}
    />
  );
}
