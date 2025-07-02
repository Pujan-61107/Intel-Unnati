
"use client";

import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Metadata needs to be defined outside the component for static export
const metadata: Metadata = {
  title: 'Login - TraceSmart',
  description: 'Login to your TraceSmart account.',
};

// export { metadata }; // Export if needed by build process, usually Next.js handles this.

export default function LoginPage() {
  const { isLoggedIn, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, isLoadingAuth, router]);

  if (isLoadingAuth || (!isLoadingAuth && isLoggedIn)) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
