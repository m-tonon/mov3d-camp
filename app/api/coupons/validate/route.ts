import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { CouponModel } from '@/shared/models/coupon.model';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();

    const coupon = await CouponModel.findOne({ code: normalizedCode });
    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
    }

    return NextResponse.json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();

    const coupon = await CouponModel.findOne({ code: normalizedCode });
    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
    }

    coupon.usageCount += 1;
    await coupon.save();

    return NextResponse.json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}