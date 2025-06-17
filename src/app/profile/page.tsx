
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, Mail, UserCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { isLoggedIn, isLoadingAuth, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoadingAuth, router]);

  if (isLoadingAuth || !currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <UserCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold tracking-tight">User Profile</CardTitle>
            <CardDescription>Below are the full name and email address you provided during account registration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center text-sm text-muted-foreground">
                <User className="mr-2 h-4 w-4" /> Full Name
              </Label>
              <p id="fullName" className="text-lg font-semibold text-foreground p-3 bg-secondary rounded-md">
                {currentUser.fullName}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" /> Email Address
              </Label>
              <p id="email" className="text-lg font-semibold text-foreground p-3 bg-secondary rounded-md">
                {currentUser.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
        TraceSmart © {new Date().getFullYear()} - A Simulated Product Traceability System
      </footer>
    </div>
  );
}
