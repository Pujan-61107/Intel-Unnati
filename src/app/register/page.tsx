
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - TraceSmart',
  description: 'Create a new TraceSmart account.',
};

export default function RegisterPage() {
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
