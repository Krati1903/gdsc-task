import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    const userId = session.user.id;

    // Get summary statistics
    const [totalIncome, totalExpenses, transactionCount] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: userId,
            type: 'income',
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userId,
            type: 'expense',
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.countDocuments({
        userId: userId,
        date: { $gte: start, $lte: end },
      }),
    ]);

    // Get spending by category
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          color: { $first: '$categoryInfo.color' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Get monthly trends (last 6 months)
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: subMonths(new Date(), 5), $lte: new Date() },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      userId: userId,
      date: { $gte: start, $lte: end },
    })
      .populate('category', 'name color icon')
      .sort({ date: -1 })
      .limit(5);

    const summary = {
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      netIncome: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      transactionCount,
    };

    return NextResponse.json({
      summary,
      expensesByCategory,
      monthlyTrends,
      recentTransactions,
      period: { start, end },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
