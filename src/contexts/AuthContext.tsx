
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'traceSmartUserLoggedIn';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedAuthStatus = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuthStatus === 'true') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
    router.push('/'); // Redirect to home after login
  }, [router]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing localStorage item:", error);
    }
    router.push('/login'); // Redirect to login after logout
  }, [router]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
