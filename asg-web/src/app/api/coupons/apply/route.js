import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function POST(req) {
  try {
    const { code, itemType = 'career', itemId = '', itemIds = [], currentAmount = 0 } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Please enter a valid coupon code.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    await connectToDatabase();

    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code. Please check and try again.' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'This coupon is currently inactive.' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired.' }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its maximum usage limit.' }, { status: 400 });
    }

    // Check item compatibility
    if (coupon.applicableTo !== 'all' && coupon.applicableTo !== itemType) {
      return NextResponse.json({
        valid: false,
        error: `This coupon is only valid for ${coupon.applicableTo === 'career' ? 'Career Guidance' : coupon.applicableTo} items.`
      }, { status: 400 });
    }

    // Check specific target item if specified
    if (coupon.targetItemId) {
      const matchInIds = Array.isArray(itemIds) && itemIds.map(String).includes(String(coupon.targetItemId));
      const matchSingleId = itemId && String(coupon.targetItemId) === String(itemId);
      if (!matchInIds && !matchSingleId) {
        return NextResponse.json({
          valid: false,
          error: `This coupon is only applicable to ${coupon.targetItemTitle || 'a specific selected item'}.`
        }, { status: 400 });
      }
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && currentAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((currentAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed amount
      discountAmount = Math.min(currentAmount, coupon.discountValue);
    }

    const finalAmount = Math.max(0, currentAmount - discountAmount);
    const isFree = finalAmount === 0;

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount,
        isFree
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Coupon Apply Error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to apply coupon.' }, { status: 500 });
  }
}
