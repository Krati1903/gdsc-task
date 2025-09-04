'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DollarSign, TrendingUp, PieChart, Shield } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Finance Tracker</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Take Control of Your
            <span className="text-blue-600"> Finances</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track your income and expenses, visualize spending patterns, and make informed financial decisions with our comprehensive finance tracking application.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Start Tracking Now
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Transaction Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Log your income and expenses with detailed descriptions, categories, and dates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <PieChart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Visual Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Understand your spending patterns with interactive charts and graphs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Category Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Create and manage custom categories to organize your transactions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your financial data is encrypted and secure with user authentication.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Managing Your Finances?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of users who have taken control of their financial future.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
