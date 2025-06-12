
"use client";

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ScanBarcode } from 'lucide-react';

interface AuthFormWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  footerContent?: ReactNode;
  showLogo?: boolean;
}

export default function AuthFormWrapper({ title, description, children, footerContent, showLogo = true }: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          {showLogo && (
            <Link href="/" className="inline-block mb-4">
              <ScanBarcode className="h-12 w-12 text-primary mx-auto" />
            </Link>
          )}
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
          {footerContent && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footerContent}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
