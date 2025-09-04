import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const categories = await Category.find({ userId: session.user.id }).sort({ name: 1 });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, color, icon } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name,
      userId: session.user.id,
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name,
      color: color || '#3B82F6',
      icon: icon || 'DollarSign',
      userId: session.user.id,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
