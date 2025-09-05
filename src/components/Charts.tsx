'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PieLabelRenderProps } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface ExpensesByCategoryProps {
  data: Array<{
    name: string;
    total: number;
    color: string;
  }>;
}

export function ExpensesByCategory({ data }: ExpensesByCategoryProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">No expense data available</p>
          <p className="text-sm">Add some expenses to see the breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: PieLabelRenderProps) => 
              `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MonthlyTrendsProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export function MonthlyTrends({ data }: MonthlyTrendsProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
          <Legend />
          <Bar dataKey="income" fill="#22C55E" name="Income" />
          <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
