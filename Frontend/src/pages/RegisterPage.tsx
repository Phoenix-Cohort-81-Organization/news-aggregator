import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthFooterLink, AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../store/AuthContext';
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schema';

const fields = [
  { name: 'name', label: 'Your name', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
] as const;

export function RegisterPage() {
  const { isAuthenticated, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create account — TheFeeds';
  }, []);

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <AuthForm<RegisterFormValues>
      title="Join TheFeeds"
      description="Create an account to stay close to the stories that matter."
      submitLabel="Create account"
      resolver={zodResolver(registerSchema)}
      fields={fields}
      onSubmit={async ({ confirmPassword: _confirmPassword, ...values }) => {
        await signUp(values);
        navigate('/', { replace: true });
      }}
      footer={<>Already have an account? <AuthFooterLink to="/login">Sign in</AuthFooterLink></>}
    />
  );
}
