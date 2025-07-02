
"use client";

import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const metadata: Metadata = {
  title: 'Forgot Password - TraceSmart',
  description: 'Reset your TraceSmart account password.',
};

export default function ForgotPasswordPage() {
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
      title="Forgot Your Password?"
      description="Enter your email address and we'll send you a link to reset your password."
      footerContent={
        <>
          Remembered your password?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthFormWrapper>
  );
}
