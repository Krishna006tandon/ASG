import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Razorpay from 'razorpay';
import Webinar from '@/models/Webinar';
import WebinarRegistration from '@/models/WebinarRegistration';
import Coupon from '@/models/Coupon';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/mailer';
import { webinarRegistrationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectToDatabase();
    
    const { webinarId, registrationData, couponCode } = await req.json();

    const webinar = await Webinar.findById(webinarId);
    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    if (webinar.seatsBooked >= webinar.seatsTotal) {
      return NextResponse.json({ error: 'This webinar is completely sold out.' }, { status: 400 });
    }

    const baseAmount = webinar.price;
    let finalAmount = baseAmount;
    let discountApplied = 0;
    let validCouponDoc = null;

    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (coupon) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const underLimit = coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;
        const validScope = coupon.applicableTo === 'all' || coupon.applicableTo === 'webinar';
        const targetMatch = !coupon.targetItemId || String(coupon.targetItemId) === String(webinar._id);
        const meetsMinAmount = !coupon.minOrderAmount || baseAmount >= coupon.minOrderAmount;

        if (notExpired && underLimit && validScope && targetMatch && meetsMinAmount) {
          validCouponDoc = coupon;
          if (coupon.discountType === 'percentage') {
            discountApplied = Math.round((baseAmount * coupon.discountValue) / 100);
            if (coupon.maxDiscountAmount && discountApplied > coupon.maxDiscountAmount) {
              discountApplied = coupon.maxDiscountAmount;
            }
          } else {
            discountApplied = Math.min(baseAmount, coupon.discountValue);
          }
          finalAmount = Math.max(0, baseAmount - discountApplied);
        }
      }
    }

    // CASE 1: 100% Free / ₹0
    if (finalAmount === 0) {
      const registration = await WebinarRegistration.create({
        userId: decoded.userId,
        webinarId,
        razorpayOrderId: `free_${Date.now()}`,
        razorpayPaymentId: `free_coupon_${Date.now()}`,
        razorpaySignature: 'free_coupon_signature',
        paymentStatus: 'Paid',
        registrationData,
        amountPaid: 0,
        couponApplied: validCouponDoc ? validCouponDoc.code : 'FREE_PASS',
        discountAmount: discountApplied
      });

      await Webinar.findByIdAndUpdate(webinarId, { $inc: { seatsBooked: 1 } });
      if (validCouponDoc) {
        await Coupon.findByIdAndUpdate(validCouponDoc._id, { $inc: { usedCount: 1 } });
      }

      if (registrationData && registrationData.email) {
        await sendEmail({
          to: registrationData.email,
          subject: 'Workshop Registration Confirmed (Free Access)',
          html: webinarRegistrationTemplate(registrationData.name || 'User')
        });
      }

      return NextResponse.json({
        isFree: true,
        success: true,
        message: '100% Free Access Coupon applied! Registration confirmed.',
        registration
      }, { status: 200 });
    }

    // CASE 2: Paid (partial discount or regular)
    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    const rzp = new Razorpay({
      key_id: razorpayKeyId || 'rzp_test_YourTestKeyHere',
      key_secret: razorpayKeySecret || 'YourTestSecretHere',
    });

    const amountInPaise = finalAmount * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `webinar_${Date.now()}`,
      notes: {
        webinarId: webinar._id.toString(),
        userId: decoded.userId,
        name: registrationData.name,
        email: registrationData.email,
        whatsapp: registrationData.whatsapp,
        profession: registrationData.profession,
        couponApplied: validCouponDoc ? validCouponDoc.code : null,
        discountAmount: String(discountApplied)
      }
    };

    const order = await rzp.orders.create(options);

    return NextResponse.json({
      isFree: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId || 'rzp_test_YourTestKeyHere',
      totalAmount: finalAmount,
      couponApplied: validCouponDoc ? validCouponDoc.code : null,
      discountAmount: discountApplied,
      registrationData
    }, { status: 200 });
    
  } catch (error) {
    console.error("Razorpay Webinar Create Error:", error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
