import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CareerSetting from '@/models/CareerSetting';

export async function GET() {
  try {
    await connectToDatabase();
    let setting = await CareerSetting.findOne();
    if (!setting) {
      setting = await CareerSetting.create({
        price: 299,
        originalPrice: 999,
        isEnabled: true,
        videoUrl: '',
        headline: 'Discover Your True Nature & Swadharma',
        subheadline: 'Find the work you were naturally designed to do with our 30-Question Career Nature Assessment.'
      });
    }
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error('Career Settings GET error:', error);
    // Return graceful fallback so page never breaks
    return NextResponse.json({
      price: 299,
      originalPrice: 999,
      isEnabled: true,
      videoUrl: '',
      headline: 'Discover Your True Nature & Swadharma',
      subheadline: 'Find the work you were naturally designed to do with our 30-Question Career Nature Assessment.'
    }, { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    let setting = await CareerSetting.findOne();
    if (!setting) {
      setting = new CareerSetting(body);
    } else {
      if (body.price !== undefined) setting.price = Number(body.price);
      if (body.originalPrice !== undefined) setting.originalPrice = Number(body.originalPrice);
      if (body.isEnabled !== undefined) setting.isEnabled = Boolean(body.isEnabled);
      if (body.videoUrl !== undefined) setting.videoUrl = body.videoUrl;
      if (body.headline !== undefined) setting.headline = body.headline;
      if (body.subheadline !== undefined) setting.subheadline = body.subheadline;
    }
    await setting.save();
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error('Career Settings POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
