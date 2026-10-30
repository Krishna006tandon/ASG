import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import Book from '@/models/Book';
import Webinar from '@/models/Webinar';
import Seminar from '@/models/Seminar';
import { authenticateApi } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

    // Stats
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.isActive).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

    // Fetch available target items for dropdowns
    const books = await Book.find({}, 'title price').lean();
    const webinars = await Webinar.find({}, 'title price date').lean();
    const seminars = await Seminar.find({}, 'title price date').lean();

    return NextResponse.json({
      coupons,
      stats: {
        totalCoupons,
        activeCoupons,
        totalRedemptions
      },
      availableItems: {
        books: books.map(b => ({ id: b._id.toString(), title: b.title, price: b.price, type: 'store' })),
        webinars: webinars.map(w => ({ id: w._id.toString(), title: w.title, price: w.price, type: 'webinar' })),
        seminars: seminars.map(s => ({ id: s._id.toString(), title: s.title, price: s.price, type: 'seminar' })),
        career: [{ id: 'career_assessment', title: 'Career Nature Assessment Test', price: 299, type: 'career' }]
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Coupons GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      code,
      description = '',
      discountType = 'percentage',
      discountValue,
      applicableTo = 'career',
      targetItemId = '',
      targetItemTitle = '',
      minOrderAmount = 0,
      maxDiscountAmount = null,
      usageLimit = null,
      isActive = true,
      expiresAt = null
    } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    if (discountValue === undefined || discountValue === null || Number(discountValue) < 0) {
      return NextResponse.json({ error: 'A valid discount value is required.' }, { status: 400 });
    }

    if (discountType === 'percentage' && Number(discountValue) > 100) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 100%.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    await connectToDatabase();

    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: `Coupon code '${cleanCode}' already exists.` }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      applicableTo,
      targetItemId: targetItemId ? String(targetItemId) : '',
      targetItemTitle: targetItemTitle || '',
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: Boolean(isActive),
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    return NextResponse.json({
      success: true,
      message: `Coupon '${newCoupon.code}' created successfully.`,
      coupon: newCoupon
    }, { status: 201 });

  } catch (error) {
    console.error('Admin Coupons POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
