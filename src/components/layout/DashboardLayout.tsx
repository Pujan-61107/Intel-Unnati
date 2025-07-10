
"use client";

import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import { Sidebar, SidebarInset, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, PackageSearch, User, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <div className="flex flex-1">
        <Sidebar>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Dashboard">
                            <Link href="/">
                                <LayoutDashboard />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/simulation'} tooltip="Simulation">
                             <Link href="/simulation">
                                <PackageSearch />
                                <span>Simulation</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/profile'} tooltip="Profile">
                             <Link href="/profile">
                                <User />
                                <span>Profile</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1">
          <Header />
          <SidebarInset>
            <main className="flex-grow p-4 md:p-6 lg:p-8">
                {children}
            </main>
            <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
                TraceSmart © {new Date().getFullYear()} - A Simulated Product Traceability System
            </footer>
          </SidebarInset>
        </div>
      </div>
    </div>
  );
}
