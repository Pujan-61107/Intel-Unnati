
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScanBarcode, LogOut, UserCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { isLoggedIn, logout, currentUser } = useAuth();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

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

  return (
    <header className="bg-card border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <ScanBarcode className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-headline font-bold text-primary">
            TraceSmart
          </h1>
        </Link>
        {isLoggedIn && currentUser && (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  <UserCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                  {showWelcomeMessage ? (
                    <span className="animate-fadeIn">
                      Welcome back, <span className="font-semibold text-foreground">{currentUser.fullName}</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-foreground">{currentUser.fullName}</span>
                  )}
                  <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
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
          </div>
        )}
      </div>
    </header>
  );
}
