'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { FilterPanel } from '@/components/FilterPanel';
import { TransactionsTable } from '@/components/TransactionsTable';
import { ExpensesByCategory, MonthlyTrends } from '@/components/Charts';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  category: {
    _id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface AnalyticsData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    transactionCount: number;
  };
  expensesByCategory: Array<{
    _id: string;
    name: string;
    color: string;
    total: number;
    count: number;
  }>;
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
      type: string;
    };
    total: number;
  }>;
  recentTransactions: Array<Transaction>;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, transactionsRes, categoriesRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/transactions'),
        fetch('/api/categories'),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (appliedFilters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) {
          if (key === 'startDate' || key === 'endDate') {
            params.append(key, (value as Date).toISOString());
          } else {
            params.append(key, value as string);
          }
        }
      });

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching filtered transactions:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    fetchTransactions(newFilters);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const prepareMonthlyTrendsData = () => {
    if (!analytics?.monthlyTrends) return [];

    const monthlyData: { [key: string]: { month: string; income: number; expenses: number } } = {};

    analytics.monthlyTrends.forEach((item) => {
      const monthKey = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      const monthName = format(new Date(item._id.year, item._id.month - 1, 1), 'MMM yyyy');

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, income: 0, expenses: 0 };
      }

      if (item._id.type === 'income') {
        monthlyData[monthKey].income = item.total;
      } else {
        monthlyData[monthKey].expenses = item.total;
      }
    });

    return Object.values(monthlyData);
  };

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Track your finances and spending patterns</p>
          </div>
          <AddTransactionModal
            categories={categories}
            onTransactionAdded={fetchData}
          />
        </div>

        {/* Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.summary.totalIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(analytics.summary.totalExpenses)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  analytics.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(analytics.summary.netIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <Activity className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.summary.transactionCount}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Breakdown of your spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensesByCategory data={analytics.expensesByCategory} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Income vs expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyTrends data={prepareMonthlyTrendsData()} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FilterPanel
                categories={categories}
                onFilterChange={handleFilterChange}
              />
              <TransactionsTable
                transactions={transactions}
                onTransactionDeleted={() => {
                  fetchData();
                  fetchTransactions(filters);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
