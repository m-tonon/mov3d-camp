import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { CouponModel } from '@/shared/models/coupon.model';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await connectToDatabase();
    const { code } = await params;
    const normalizedCode = code.toUpperCase().trim();

    const coupon = await CouponModel.findOne({ code: normalizedCode });
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    if (coupon.usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete coupon that has been used' },
        { status: 400 }
      );
    }

    await CouponModel.deleteOne({ code: normalizedCode });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}