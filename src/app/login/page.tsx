
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - TraceSmart',
  description: 'Login to your TraceSmart account.',
};

export default function LoginPage() {
  return (
    <AuthFormWrapper
      title="Sign In to TraceSmart"
      description="Enter your credentials to access your account."
      footerContent={
        <>
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}
