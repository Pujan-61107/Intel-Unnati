
"use client";

import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const metadata: Metadata = {
  title: 'Register - TraceSmart',
  description: 'Create a new TraceSmart account.',
};

export default function RegisterPage() {
  const { isLoggedIn, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, isLoadingAuth, router]);

  if (isLoadingAuth || (!isLoadingAuth && isLoggedIn)) {
    return (
      <AuthFormWrapper title="" showLogo={false}>
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AuthFormWrapper>
    );
  }
  
  return (
    <AuthFormWrapper
      title="Create your Account"
      description="Get started with TraceSmart by creating an account."
      footerContent={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthFormWrapper>
  );
}
