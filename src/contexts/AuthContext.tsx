
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  userName: string | null;
  login: (name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'traceSmartUserLoggedIn';
const USER_NAME_STORAGE_KEY = 'traceSmartUserName';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuthStatus = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedUserName = localStorage.getItem(USER_NAME_STORAGE_KEY);
      if (storedAuthStatus === 'true') {
        setIsLoggedIn(true);
        if (storedUserName) {
          setUserName(storedUserName);
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = useCallback((name?: string) => {
    setIsLoggedIn(true);
    const userDisplayName = name || "User";
    setUserName(userDisplayName);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_NAME_STORAGE_KEY, userDisplayName);
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
    router.push('/'); // Redirect to home after login
  }, [router]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_NAME_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing localStorage item:", error);
    }
    router.push('/login'); // Redirect to login after logout
  }, [router]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoadingAuth, userName, login, logout }}>
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
