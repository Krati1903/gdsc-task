'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface TransactionsTableProps {
  transactions: Transaction[];
  onTransactionDeleted: () => void;
}

export function TransactionsTable({ transactions, onTransactionDeleted }: TransactionsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTransactionDeleted();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell className="font-medium">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                    {transaction.category.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={transaction.type === 'income' ? 'default' : 'secondary'}
                    className={
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction._id)}
                        disabled={isDeleting === transaction._id}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting === transaction._id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
