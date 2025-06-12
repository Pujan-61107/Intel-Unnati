
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password - TraceSmart',
  description: 'Reset your TraceSmart account password.',
};

export default function ForgotPasswordPage() {
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
