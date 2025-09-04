import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  _id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, category: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
