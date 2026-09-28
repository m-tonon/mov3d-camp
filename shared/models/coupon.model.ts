import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null, min: 1 },
  },
  { timestamps: true }
);

export const CouponModel =
  mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);