import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, any> = { userId: session.user.id };

    if (type && (type === 'income' || type === 'expense')) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('category', 'name color icon')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
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

    const { amount, description, type, category, date } = await request.json();

    if (!amount || !description || !type || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { message: 'Type must be either income or expense' },
        { status: 400 }
      );
    }

    await dbConnect();

    const transaction = await Transaction.create({
      amount: parseFloat(amount),
      description,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      userId: session.user.id,
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('category', 'name color icon');

    return NextResponse.json(populatedTransaction, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
