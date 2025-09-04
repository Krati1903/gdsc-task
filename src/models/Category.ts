import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    maxlength: [30, 'Category name cannot be more than 30 characters'],
  },
  color: {
    type: String,
    required: true,
    default: '#3B82F6',
  },
  icon: {
    type: String,
    required: true,
    default: 'DollarSign',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
