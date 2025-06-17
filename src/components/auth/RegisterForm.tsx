
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const USERS_STORAGE_KEY = 'traceSmartUsers'; // Key for localStorage

interface StoredUser {
  fullName: string;
  email: string;
  password_unsafe: string; // Storing password unsafely for simulation ONLY
}

export default function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.toLowerCase());
  };

  const validatePassword = (passwordToValidate: string): { isValid: boolean; message?: string } => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Error",
        description: passwordValidation.message,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    try {
      let users: StoredUser[] = [];
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        users = JSON.parse(storedUsers);
      }

      if (users.find(user => user.email === email)) {
        toast({
          title: "Registration Failed",
          description: "This email address is already registered.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Add new user - UNSAFE password storage for simulation only
      users.push({ fullName, email, password_unsafe: password });
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      login(fullName); // Log the user in
      toast({
        title: "Registration Successful!",
        description: "Welcome to TraceSmart! You are now logged in.",
      });
      // login() handles redirection
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again. (Simulation)",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            required
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10"
            aria-describedby="password-requirements"
          />
        </div>
        <p id="password-requirements" className="text-xs text-muted-foreground mt-1 px-1">
          Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (e.g., !@#$%^&*).
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
      </Button>
    </form>
  );
}
