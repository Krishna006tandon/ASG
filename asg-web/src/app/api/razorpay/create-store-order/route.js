import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import { authenticateApi } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to checkout.' }, { status: 401 });
    }

    const { cart, customerDetails = {}, couponCode } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Calculate base total securely
    const baseTotal = cart.reduce((sum, item) => {
      let itemTotal = item.price * item.quantity;
      if (item.isPhysicalRequested) {
        itemTotal += ((item.physicalPrice || 0) + (item.shippingCost || 0)) * item.quantity;
      }
      return sum + itemTotal;
    }, 0);

    let finalAmount = baseTotal;
    let discountApplied = 0;
    let validCouponDoc = null;

    // Validate Coupon if provided
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

      if (coupon) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const underLimit = coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;
        const validScope = coupon.applicableTo === 'all' || coupon.applicableTo === 'store';
        let targetMatch = true;

        if (coupon.targetItemId) {
          targetMatch = cart.some(item => String(item._id) === coupon.targetItemId || String(item.bookId) === coupon.targetItemId);
        }

        const meetsMinAmount = !coupon.minOrderAmount || baseTotal >= coupon.minOrderAmount;

        if (notExpired && underLimit && validScope && targetMatch && meetsMinAmount) {
          validCouponDoc = coupon;
          if (coupon.discountType === 'percentage') {
            discountApplied = Math.round((baseTotal * coupon.discountValue) / 100);
            if (coupon.maxDiscountAmount && discountApplied > coupon.maxDiscountAmount) {
              discountApplied = coupon.maxDiscountAmount;
            }
          } else {
            discountApplied = Math.min(baseTotal, coupon.discountValue);
          }
          finalAmount = Math.max(0, baseTotal - discountApplied);
        }
      }
    }

    // CASE 1: 100% DISCOUNT / FREE ORDER (₹0)
    if (finalAmount === 0) {
      const newOrder = await Order.create({
        razorpayOrderId: `free_${Date.now()}`,
        razorpayPaymentId: `free_pass_${Date.now()}`,
        razorpaySignature: 'free_coupon_signature',
        items: cart.map(item => ({
          bookId: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          isPhysicalRequested: Boolean(item.isPhysicalRequested),
          shippingAddress: item.isPhysicalRequested ? (customerDetails.address || '') : '',
          physicalStatus: item.isPhysicalRequested ? 'Pending Dispatch' : 'Not Requested'
        })),
        totalAmount: 0,
        couponApplied: validCouponDoc ? validCouponDoc.code : 'FREE_PASS',
        discountAmount: discountApplied,
        customerDetails: {
          name: customerDetails.name || user.name || 'User',
          email: customerDetails.email || user.email,
          phone: customerDetails.phone || '',
          address: customerDetails.address || ''
        },
        status: 'Paid'
      });

      if (validCouponDoc) {
        await Coupon.findByIdAndUpdate(validCouponDoc._id, { $inc: { usedCount: 1 } });
      }

      console.log(`[Store Order] Free Order ${newOrder._id} created with coupon '${validCouponDoc?.code}'`);

      return NextResponse.json({
        isFree: true,
        success: true,
        orderId: newOrder._id,
        message: '100% Free Coupon applied! Order placed successfully.'
      }, { status: 200 });
    }

    // CASE 2: PAID ORDER (Partial discount or regular)
    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    const razorpay = new Razorpay({
      key_id: razorpayKeyId || 'rzp_test_YourTestKeyHere',
      key_secret: razorpayKeySecret || 'YourTestSecretHere',
    });

    const options = {
      amount: finalAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `store_${Date.now()}`,
      notes: {
        userId: user.userId || '',
        couponApplied: validCouponDoc ? validCouponDoc.code : 'none',
        discountAmount: String(discountApplied)
      }
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({
      isFree: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId || 'rzp_test_YourTestKeyHere',
      totalAmount: finalAmount,
      couponApplied: validCouponDoc ? validCouponDoc.code : null,
      discountAmount: discountApplied,
      customerDetails: {
        name: customerDetails.name || user.name || 'User',
        email: customerDetails.email || user.email,
        phone: customerDetails.phone || '',
        address: customerDetails.address || ''
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Store Create Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 });
  }
}
