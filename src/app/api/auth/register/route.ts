import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Category from '@/models/Category';

const defaultCategories = [
  { name: 'Food & Dining', color: '#EF4444', icon: 'UtensilsCrossed' },
  { name: 'Transportation', color: '#3B82F6', icon: 'Car' },
  { name: 'Shopping', color: '#8B5CF6', icon: 'ShoppingBag' },
  { name: 'Entertainment', color: '#F59E0B', icon: 'Film' },
  { name: 'Bills & Utilities', color: '#10B981', icon: 'Receipt' },
  { name: 'Healthcare', color: '#EC4899', icon: 'Heart' },
  { name: 'Education', color: '#6366F1', icon: 'GraduationCap' },
  { name: 'Travel', color: '#14B8A6', icon: 'MapPin' },
  { name: 'Salary', color: '#22C55E', icon: 'Banknote' },
  { name: 'Investment', color: '#F97316', icon: 'TrendingUp' },
];

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create default categories for the user
    const categoriesWithUserId = defaultCategories.map(cat => ({
      ...cat,
      userId: user._id,
    }));

    await Category.insertMany(categoriesWithUserId);

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
