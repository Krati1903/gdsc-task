'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard, Tags, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-gray-900">Finance Tracker</h1>
          
          {session && (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/expenses">
                <Button variant="ghost" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Expenses
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Categories
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {session && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{session.user?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
