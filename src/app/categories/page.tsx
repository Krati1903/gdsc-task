'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navbar } from '@/components/Navbar';
import { Plus, Palette } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

const COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#84CC16'
];

const ICONS = [
  'DollarSign', 'ShoppingBag', 'Car', 'UtensilsCrossed', 'Film',
  'Heart', 'GraduationCap', 'MapPin', 'Banknote', 'TrendingUp'
];

export default function Categories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: COLORS[0],
    icon: ICONS[0],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCategories();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: '',
          color: COLORS[0],
          icon: ICONS[0],
        });
        setOpen(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsCreating(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your transaction categories</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Create a new category for organizing your transactions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Enter category name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color
                            ? 'border-gray-900'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating} className="flex-1">
                    {isCreating ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Palette className="h-4 w-4" />
                  <span>{category.color}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Palette className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">No categories yet</p>
              <p className="text-sm">Create your first category to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
