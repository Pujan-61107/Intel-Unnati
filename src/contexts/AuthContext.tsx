
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CurrentUser {
  fullName: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  currentUser: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STATUS_STORAGE_KEY = 'traceSmartUserLoggedIn';
const CURRENT_USER_DATA_STORAGE_KEY = 'traceSmartCurrentUserData';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuthStatus = localStorage.getItem(AUTH_STATUS_STORAGE_KEY);
      const storedUserData = localStorage.getItem(CURRENT_USER_DATA_STORAGE_KEY);
      
      if (storedAuthStatus === 'true' && storedUserData) {
        setIsLoggedIn(true);
        setCurrentUser(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // Clear potentially corrupted storage
      localStorage.removeItem(AUTH_STATUS_STORAGE_KEY);
      localStorage.removeItem(CURRENT_USER_DATA_STORAGE_KEY);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = useCallback((user: CurrentUser) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STATUS_STORAGE_KEY, 'true');
      localStorage.setItem(CURRENT_USER_DATA_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
    router.push('/'); // Redirect to dashboard after login
  }, [router]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STATUS_STORAGE_KEY);
      localStorage.removeItem(CURRENT_USER_DATA_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing localStorage item:", error);
    }
    router.push('/login'); // Redirect to login after logout
  }, [router]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoadingAuth, currentUser, login, logout }}>
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
