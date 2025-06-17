
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, KeyRound, Eye, EyeOff, Edit3, Trash2, LogOut, UserCircle2, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// This key should ideally be in a shared constants file
const USERS_STORAGE_KEY = 'traceSmartUsers'; 

interface StoredUser {
  fullName: string;
  email: string;
  password_unsafe: string; // This is highly insecure, for simulation only
}

export default function ProfilePage() {
  const { isLoggedIn, isLoadingAuth, currentUser, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoadingAuth, router]);

  useEffect(() => {
    if (currentUser?.email) {
      try {
        const storedUsersData = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsersData) {
          const users: StoredUser[] = JSON.parse(storedUsersData);
          const userDetails = users.find(user => user.email === currentUser.email);
          if (userDetails) {
            setPassword(userDetails.password_unsafe);
          }
        }
      } catch (error) {
        console.error("Error fetching user password from localStorage:", error);
        toast({
          title: "Error",
          description: "Could not retrieve all user details.",
          variant: "destructive",
        });
      }
    }
  }, [currentUser, toast]);

  const handleDeleteProfile = () => {
    if (!currentUser?.email) return;

    try {
      const storedUsersData = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsersData) {
        let users: StoredUser[] = JSON.parse(storedUsersData);
        users = users.filter(user => user.email !== currentUser.email);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
      toast({
        title: "Profile Deleted",
        description: "Your profile has been successfully deleted. (Simulation)",
      });
      logout(); // This will also redirect to /login
    } catch (error) {
      console.error("Error deleting profile from localStorage:", error);
      toast({
        title: "Error",
        description: "Could not delete profile. Please try again.",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleChangePassword = () => {
    // Placeholder for actual change password functionality
    toast({
      title: "Feature Coming Soon",
      description: "The ability to change your password will be implemented in a future update.",
    });
  };

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
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <UserCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold tracking-tight">User Profile</CardTitle>
            <CardDescription>Manage your account details and preferences below.</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center text-sm text-muted-foreground">
                <KeyRound className="mr-2 h-4 w-4" /> Password (Simulated)
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  className="pr-10 text-lg p-3 bg-secondary rounded-md"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1 px-1">
                <AlertTriangle className="h-3 w-3 mr-1 text-destructive" /> 
                This is for simulation only. Never display passwords in a real app.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pt-6">
            <Button onClick={handleChangePassword} variant="outline" className="w-full">
              <Edit3 className="mr-2 h-4 w-4" /> Change Password
            </Button>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers (simulated).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={logout} variant="ghost" className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
        TraceSmart © {new Date().getFullYear()} - A Simulated Product Traceability System
      </footer>
    </div>
  );
}
