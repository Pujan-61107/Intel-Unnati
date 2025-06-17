
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const USERS_STORAGE_KEY = 'traceSmartUsers'; 

interface StoredUser {
  fullName: string;
  email: string;
  password_unsafe: string; 
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!storedUsers) {
        toast({
          title: "Login Failed",
          description: "No users registered. Please create an account. (Simulation)",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const users: StoredUser[] = JSON.parse(storedUsers);
      const foundUser = users.find(user => user.email === email.toLowerCase());

      if (foundUser) {
        if (foundUser.password_unsafe === password) {
          login({ fullName: foundUser.fullName, email: foundUser.email }); 
          toast({
            title: "Login Successful",
            description: `Welcome back, ${foundUser.fullName}!`,
          });
        } else {
          toast({
            title: "Login Failed",
            description: "Incorrect password. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Email not found. Please check your email or register.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. (Simulation)",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" passHref>
            <Button variant="link" type="button" className="p-0 h-auto text-sm">Forgot password?</Button>
          </Link>
        </div>
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
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  );
}
