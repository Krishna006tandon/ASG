import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/mongodb';
import CareerSetting from '@/models/CareerSetting';
import CareerAssessment from '@/models/CareerAssessment';
import Coupon from '@/models/Coupon';
import { authenticateApi } from '@/lib/auth';

export async function POST(req) {
  try {
    const { candidateDetails, couponCode } = await req.json();

    if (!candidateDetails || !candidateDetails.name || !candidateDetails.email || !candidateDetails.phone) {
      return NextResponse.json({ error: 'Name, email, and phone number are required.' }, { status: 400 });
    }

    const decoded = authenticateApi(req);
    const userId = decoded?.userId || null;

    await connectToDatabase();

    // Fetch dynamic base price
    let setting = await CareerSetting.findOne();
    const basePrice = setting?.price || 299;
    let finalPrice = basePrice;
    let discountApplied = 0;
    let validCouponDoc = null;

    // Validate coupon securely on server
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (coupon) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const underLimit = coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;
        const validItem = coupon.applicableTo === 'all' || coupon.applicableTo === 'career';

        if (notExpired && underLimit && validItem) {
          validCouponDoc = coupon;
          if (coupon.discountType === 'percentage') {
            discountApplied = Math.round((basePrice * coupon.discountValue) / 100);
            if (coupon.maxDiscountAmount && discountApplied > coupon.maxDiscountAmount) {
              discountApplied = coupon.maxDiscountAmount;
            }
          } else {
            discountApplied = Math.min(basePrice, coupon.discountValue);
          }
          finalPrice = Math.max(0, basePrice - discountApplied);
        }
      }
    }

    // CASE 1: 100% DISCOUNT / FREE ACCESS (₹0)
    if (finalPrice === 0) {
      const assessment = await CareerAssessment.create({
        userId,
        candidateDetails: {
          name: candidateDetails.name.trim(),
          email: candidateDetails.email.trim().toLowerCase(),
          phone: candidateDetails.phone.trim(),
          education: candidateDetails.education || '',
          currentStatus: candidateDetails.currentStatus || 'College Student'
        },
        amountPaid: 0,
        couponApplied: validCouponDoc ? validCouponDoc.code : 'FREE_PASS',
        discountAmount: discountApplied,
        paymentStatus: 'Paid',
        testStatus: 'InProgress'
      });

      if (validCouponDoc) {
        await Coupon.findByIdAndUpdate(validCouponDoc._id, { $inc: { usedCount: 1 } });
      }

      console.log(`[Career Order] Free Assessment ${assessment._id} unlocked directly with coupon '${validCouponDoc?.code}'!`);

      return NextResponse.json({
        isFree: true,
        success: true,
        assessmentId: assessment._id,
        message: '100% Discount Coupon applied! Test unlocked successfully.'
      }, { status: 200 });
    }

    // CASE 2: PAID ORDER (Partial discount or full price)
    const assessment = await CareerAssessment.create({
      userId,
      candidateDetails: {
        name: candidateDetails.name.trim(),
        email: candidateDetails.email.trim().toLowerCase(),
        phone: candidateDetails.phone.trim(),
        education: candidateDetails.education || '',
        currentStatus: candidateDetails.currentStatus || 'College Student'
      },
      amountPaid: finalPrice,
      couponApplied: validCouponDoc ? validCouponDoc.code : null,
      discountAmount: discountApplied,
      paymentStatus: 'Pending',
      testStatus: 'Pending'
    });

    if (validCouponDoc) {
      await Coupon.findByIdAndUpdate(validCouponDoc._id, { $inc: { usedCount: 1 } });
    }

    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay keys not configured in environment variables');
      return NextResponse.json({ error: 'Payment gateway is temporarily unavailable: missing credentials.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const options = {
      amount: finalPrice * 100, // paise
      currency: 'INR',
      receipt: `career_${Date.now()}`,
      notes: {
        assessmentId: assessment._id.toString(),
        candidateName: candidateDetails.name,
        candidateEmail: candidateDetails.email,
        couponApplied: validCouponDoc ? validCouponDoc.code : 'none'
      }
    };

    const order = await razorpay.orders.create(options);

    assessment.razorpayOrderId = order.id;
    await assessment.save();

    console.log(`[Razorpay Career Order] Created order ${order.id} for ₹${finalPrice} (Assessment: ${assessment._id})`);

    return NextResponse.json({
      isFree: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
      assessmentId: assessment._id
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Create Career Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 });
  }
}
