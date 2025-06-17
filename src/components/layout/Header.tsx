
"use client";

import { useState, useEffect } from 'react';
import { ScanBarcode, LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isLoggedIn, logout, userName } = useAuth();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    if (isLoggedIn && userName) {
      setShowWelcomeMessage(true);
      const timer = setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer); // Cleanup the timer
    } else {
      setShowWelcomeMessage(false); // Ensure it's hidden if not logged in or no username
    }
  }, [isLoggedIn, userName]);

  return (
    <header className="bg-card border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <ScanBarcode className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-headline font-bold text-primary">
            TraceSmart
          </h1>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            {userName && showWelcomeMessage && (
              <div className="flex items-center text-sm text-muted-foreground animate-fadeIn">
                <UserCircle2 className="h-5 w-5 mr-2 text-primary" />
                <span>
                  Welcome back, <span className="font-semibold text-foreground">{userName}</span>
                </span>
              </div>
            )}
             {/* Spacer to prevent layout shift when message disappears, only if message was shown */}
            {userName && !showWelcomeMessage && isLoggedIn && (
                 <div className="flex items-center text-sm text-muted-foreground" style={{ visibility: 'hidden', height: '20px' }}>
                    {/* This content is hidden but maintains space */}
                    <UserCircle2 className="h-5 w-5 mr-2 text-primary" />
                    <span>
                      Welcome back, <span className="font-semibold text-foreground">{userName}</span>
                    </span>
                 </div>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
