import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { authenticateApi } from '@/lib/auth';

export async function PUT(req, { params }) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    // Update allowed fields
    if (body.code) coupon.code = body.code.trim().toUpperCase();
    if (body.description !== undefined) coupon.description = body.description;
    if (body.discountType) coupon.discountType = body.discountType;
    if (body.discountValue !== undefined) coupon.discountValue = Number(body.discountValue);
    if (body.applicableTo !== undefined) coupon.applicableTo = body.applicableTo;
    if (body.targetItemId !== undefined) coupon.targetItemId = body.targetItemId;
    if (body.targetItemTitle !== undefined) coupon.targetItemTitle = body.targetItemTitle;
    if (body.minOrderAmount !== undefined) coupon.minOrderAmount = Number(body.minOrderAmount);
    if (body.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = body.maxDiscountAmount ? Number(body.maxDiscountAmount) : null;
    if (body.usageLimit !== undefined) coupon.usageLimit = body.usageLimit ? Number(body.usageLimit) : null;
    if (body.isActive !== undefined) coupon.isActive = Boolean(body.isActive);
    if (body.expiresAt !== undefined) coupon.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Coupon PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Coupon '${deleted.code}' deleted successfully.`
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Coupon DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
