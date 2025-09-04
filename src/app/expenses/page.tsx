'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navbar } from '@/components/Navbar';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { ExpensesByCategory } from '@/components/Charts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

interface ExpensesByCategory {
  _id: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpensesByCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    console.log('Auth useEffect called, session:', !!session, 'status:', status);
    if (status === 'unauthenticated') {
      console.log('Redirecting to signin...');
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchExpenses = async (categoryFilter?: string, startDate?: Date, endDate?: Date) => {
    console.log('fetchExpenses called with filters:', { categoryFilter, startDate, endDate });
    try {
      const params = new URLSearchParams();
      params.append('type', 'expense');
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      console.log('Fetching from:', `/api/transactions?${params.toString()}`);
      const response = await fetch(`/api/transactions?${params.toString()}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Expenses data received:', data);
        setExpenses(data.transactions);
        
        // Calculate total expenses
        const total = data.transactions.reduce((sum: number, expense: Transaction) => sum + expense.amount, 0);
        setTotalExpenses(total);
        console.log('Total expenses calculated:', total);
      } else {
        console.error('Failed to fetch expenses:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchCategories = async () => {
    console.log('fetchCategories called');
    try {
      const response = await fetch('/api/categories');
      console.log('Categories response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories data received:', data);
        setCategories(data);
      } else {
        console.error('Failed to fetch categories:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExpensesByCategory = async (startDate?: Date, endDate?: Date) => {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExpensesByCategory(data.expensesByCategory);
      }
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
    }
  };

  const fetchData = async () => {
    console.log('fetchData called, setting loading to true');
    setIsLoading(true);
    try {
      await Promise.all([
        fetchExpenses(selectedCategory || undefined, dateFilter.startDate || undefined, dateFilter.endDate || undefined),
        fetchExpensesByCategory(dateFilter.startDate || undefined, dateFilter.endDate || undefined)
      ]);
      console.log('fetchData completed successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log('fetchData finished, setting loading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect called, session:', !!session, 'status:', status);
    if (session) {
      const initializeData = async () => {
        console.log('Initializing data...');
        await fetchCategories();
        await fetchData();
      };
      initializeData();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [selectedCategory, dateFilter]);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleDateFilter = (startDate: Date | null, endDate: Date | null) => {
    setDateFilter({ startDate, endDate });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setDateFilter({ startDate: null, endDate: null });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleTransactionAdded = async () => {
    await fetchData();
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedCategory || dateFilter.startDate || dateFilter.endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600">Track and analyze your spending patterns</p>
          </div>
          <AddTransactionModal
            categories={categories}
            onTransactionAdded={handleTransactionAdded}
          />
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? 'Filtered results' : 'All time'}
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Categories Filter */}
              <div>
                <h4 className="font-medium mb-3">Categories (Click to filter)</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category._id}
                      variant={selectedCategory === category._id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryClick(category._id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Start Date</h4>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dateFilter.startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter.startDate ? format(dateFilter.startDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFilter.startDate || undefined}
                        onSelect={(date) => handleDateFilter(date || null, dateFilter.endDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <h4 className="font-medium mb-2">End Date</h4>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dateFilter.endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter.endDate ? format(dateFilter.endDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFilter.endDate || undefined}
                        onSelect={(date) => handleDateFilter(dateFilter.startDate, date || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Visual breakdown of your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesByCategory data={expensesByCategory} />
            </CardContent>
          </Card>

          {/* Category Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Category Summary</CardTitle>
              <CardDescription>Spending breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expensesByCategory.map((category) => (
                  <div
                    key={category._id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategory === category._id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(category.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Transactions</CardTitle>
            <CardDescription>
              {selectedCategory 
                ? `Showing expenses for ${categories.find(c => c._id === selectedCategory)?.name}`
                : 'All expense transactions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {hasActiveFilters ? 'No expenses found for the selected filters' : 'No expenses recorded yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell className="font-medium">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: expense.category.color }}
                            />
                            {expense.category.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
