
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScanBarcode, LogOut, UserCircle2, ChevronDown, Sun, Moon, Laptop } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { isLoggedIn, logout, currentUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);


  useEffect(() => {
    if (isLoggedIn && currentUser?.fullName) {
      setShowWelcomeMessage(true);
      const timer = setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 5000); 

      return () => clearTimeout(timer);
    } else {
      setShowWelcomeMessage(false);
    }
  }, [isLoggedIn, currentUser?.fullName]);

  if (!mounted) {
    // To prevent hydration mismatch for theme switcher, render a placeholder or null
    return (
      <header className="bg-card border-b border-border shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <ScanBarcode className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-headline font-bold text-primary">
              TraceSmart
            </h1>
          </Link>
          <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <ScanBarcode className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-headline font-bold text-primary">
            TraceSmart
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Laptop className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn && currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm px-2 sm:px-3">
                  <UserCircle2 className="h-5 w-5 mr-0 sm:mr-2 text-primary shrink-0" />
                  <span className="hidden sm:inline">
                    {showWelcomeMessage ? (
                      <span className="animate-fadeIn">
                        Welcome, <span className="font-semibold text-foreground">{currentUser.fullName.split(' ')[0]}</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-foreground">{currentUser.fullName}</span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">View Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
