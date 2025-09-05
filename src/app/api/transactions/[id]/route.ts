import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description, type, category, date } = await request.json();
    const params = await context.params;
    const { id } = params;

    await dbConnect();

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(type && { type }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
      },
      { new: true }
    ).populate('category', 'name color icon');

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    await dbConnect();

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
