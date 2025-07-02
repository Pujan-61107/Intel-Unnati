
"use client";

import { useEffect, useState, FormEvent } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const USERS_STORAGE_KEY = 'traceSmartUsers'; 

interface StoredUser {
  fullName: string;
  email: string;
  password_unsafe: string; 
}

export default function ProfilePage() {
  const { isLoggedIn, isLoadingAuth, currentUser, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);


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
      logout(); 
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

  const validatePasswordComplexity = (passwordToValidate: string): { isValid: boolean; message?: string } => {
    if (passwordToValidate.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long." };
    }
    if (!/[A-Z]/.test(passwordToValidate)) {
      return { isValid: false, message: "Password must include at least one uppercase letter." };
    }
    if (!/[a-z]/.test(passwordToValidate)) {
      return { isValid: false, message: "Password must include at least one lowercase letter." };
    }
    if (!/[0-9]/.test(passwordToValidate)) {
      return { isValid: false, message: "Password must include at least one number." };
    }
    if (!/[!@#$%^&*]/.test(passwordToValidate)) {
      return { isValid: false, message: "Password must include at least one special character (e.g., !@#$%^&*)." };
    }
    return { isValid: true };
  };

  const handleChangePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChangePasswordError('');
    setIsChangingPassword(true);

    if (!currentUser?.email) {
      setChangePasswordError("User not found. Please log in again.");
      setIsChangingPassword(false);
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setChangePasswordError("New passwords do not match.");
      setIsChangingPassword(false);
      return;
    }

    const passwordValidation = validatePasswordComplexity(newPasswordInput);
    if (!passwordValidation.isValid) {
      setChangePasswordError(passwordValidation.message || "New password does not meet complexity requirements.");
      setIsChangingPassword(false);
      return;
    }

    try {
      const storedUsersData = localStorage.getItem(USERS_STORAGE_KEY);
      if (!storedUsersData) {
        setChangePasswordError("User data not found. Cannot change password.");
        setIsChangingPassword(false);
        return;
      }

      let users: StoredUser[] = JSON.parse(storedUsersData);
      const userIndex = users.findIndex(user => user.email === currentUser.email);

      if (userIndex === -1) {
        setChangePasswordError("User not found in storage. Cannot change password.");
        setIsChangingPassword(false);
        return;
      }

      if (users[userIndex].password_unsafe !== currentPasswordInput) {
        setChangePasswordError("Incorrect current password.");
        setIsChangingPassword(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      users[userIndex].password_unsafe = newPasswordInput;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      setPassword(newPasswordInput); // Update displayed password on profile page

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated. (Simulation)",
      });
      setIsChangePasswordDialogOpen(false);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmNewPasswordInput('');

    } catch (error) {
      console.error("Error changing password:", error);
      setChangePasswordError("An unexpected error occurred. Please try again.");
      toast({
        title: "Error",
        description: "Could not change password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
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
          <CardContent className="space-y-6 pt-6">
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
            <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Edit3 /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new password below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      required
                      aria-describedby="new-password-requirements"
                    />
                     <p id="new-password-requirements" className="text-xs text-muted-foreground">
                      Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPasswordInput}
                      onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                      required
                    />
                  </div>
                  {changePasswordError && (
                    <p className="text-sm text-destructive">{changePasswordError}</p>
                  )}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" onClick={() => {
                        setChangePasswordError('');
                        setCurrentPasswordInput('');
                        setNewPasswordInput('');
                        setConfirmNewPasswordInput('');
                      }}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 /> Delete Profile
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
              <LogOut /> Logout
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
