
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Simulate a "correct" password for demonstration
const SIMULATED_CORRECT_PASSWORD = "password123";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call for login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For simulation, check against the hardcoded password
    if (email && password === SIMULATED_CORRECT_PASSWORD) { 
      const userName = email.split('@')[0]; // Use email part as username for simulation
      login(userName); 
      toast({
        title: "Login Successful",
        description: "Welcome back to TraceSmart!",
      });
      // setIsLoading(false) is not strictly needed here if login() always navigates
    } else if (email && password) { // Email provided, but password incorrect
       toast({
        title: "Login Failed",
        description: "Incorrect email or password. Please try again. (Hint: try password 'password123' for simulation)",
        variant: "destructive",
      });
      setIsLoading(false);
    }
     else { // Email or password field empty
      toast({
        title: "Login Failed",
        description: "Please enter both email and password.",
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
