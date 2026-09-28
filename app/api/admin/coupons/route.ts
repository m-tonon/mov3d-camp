import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { CouponModel } from '@/shared/models/coupon.model';

export async function GET() {
  try {
    await connectToDatabase();
    const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { code, discountPercentage, usageLimit } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    if (!discountPercentage || typeof discountPercentage !== 'number' || discountPercentage < 1 || discountPercentage > 100) {
      return NextResponse.json({ error: 'Discount percentage must be between 1 and 100' }, { status: 400 });
    }

    if (usageLimit !== undefined && usageLimit !== null && (typeof usageLimit !== 'number' || usageLimit < 1)) {
      return NextResponse.json({ error: 'Usage limit must be a positive number' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();

    const existing = await CouponModel.findOne({ code: normalizedCode });
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }

    const coupon = await CouponModel.create({
      code: normalizedCode,
      discountPercentage,
      usageLimit: usageLimit ?? null,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}