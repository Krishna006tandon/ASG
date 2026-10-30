import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Razorpay from 'razorpay';
import Seminar from '@/models/Seminar';
import SeminarRegistration from '@/models/SeminarRegistration';
import Coupon from '@/models/Coupon';
import { authenticateApi } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';
import { seminarTicketTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const { seminarId, quantity = 1, attendees, couponCode } = await req.json();

    const seminar = await Seminar.findById(seminarId);
    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    // Capacity Check
    const booked = seminar.seatsBooked || 0;
    const remaining = seminar.seatsTotal - booked;
    if (quantity > remaining) {
      return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 });
    }

    const baseAmount = seminar.price * quantity;
    let finalAmount = baseAmount;
    let discountApplied = 0;
    let validCouponDoc = null;

    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (coupon) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const underLimit = coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;
        const validScope = coupon.applicableTo === 'all' || coupon.applicableTo === 'seminar';
        const targetMatch = !coupon.targetItemId || String(coupon.targetItemId) === String(seminar._id);
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
      const registrations = [];
      for (const attendee of attendees) {
        const randomPart = Math.floor(100000 + Math.random() * 900000);
        const ticketNumber = `SEM-${randomPart}`;

        const reg = new SeminarRegistration({
          userId: decoded.userId,
          seminarId,
          razorpayOrderId: `free_${Date.now()}`,
          razorpayPaymentId: `free_coupon_${Date.now()}`,
          razorpaySignature: 'free_coupon_signature',
          amountPaid: 0,
          paymentStatus: 'Paid',
          ticketNumber: ticketNumber,
          couponApplied: validCouponDoc ? validCouponDoc.code : 'FREE_PASS',
          discountAmount: discountApplied,
          registrationData: {
            name: attendee.name,
            email: attendee.email,
            whatsapp: attendee.whatsapp,
            profession: attendee.profession
          }
        });
        
        await reg.save();
        registrations.push(reg);

        if (attendee.email) {
          await sendEmail({
            to: attendee.email,
            subject: `Your Pass for ${seminar.title} (Ticket: ${ticketNumber})`,
            html: seminarTicketTemplate(attendee.name, seminar.title, ticketNumber, seminar.date, seminar.location)
          });
        }
      }

      await Seminar.findByIdAndUpdate(seminarId, { $inc: { seatsBooked: quantity } });
      if (validCouponDoc) {
        await Coupon.findByIdAndUpdate(validCouponDoc._id, { $inc: { usedCount: 1 } });
      }

      return NextResponse.json({
        isFree: true,
        success: true,
        message: '100% Free Access Coupon applied! Seminar passes confirmed.',
        registrations
      }, { status: 200 });
    }

    // CASE 2: Paid
    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const rzp = new Razorpay({
      key_id: razorpayKeyId || 'rzp_test_YourTestKeyHere',
      key_secret: razorpayKeySecret || 'YourTestSecretHere',
    });

    const options = {
      amount: finalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `seminar_rcpt_${Date.now()}`,
      notes: {
        seminarId: seminar._id.toString(),
        userId: decoded.userId,
        attendees: JSON.stringify(attendees),
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
      attendees
    }, { status: 200 });
    
  } catch (error) {
    console.error("Razorpay Seminar Create Error:", error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
