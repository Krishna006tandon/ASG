import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CareerAssessment from '@/models/CareerAssessment';
import CareerSetting from '@/models/CareerSetting';

export async function GET() {
  try {
    await connectToDatabase();

    const [setting, assessments] = await Promise.all([
      CareerSetting.findOne(),
      CareerAssessment.find().sort({ createdAt: -1 }).limit(200)
    ]);

    const totalSubmissions = assessments.length;
    const paidAssessments = assessments.filter(a => a.paymentStatus === 'Paid');
    const totalPaid = paidAssessments.length;
    const completedAssessments = assessments.filter(a => a.testStatus === 'Completed');
    const totalCompleted = completedAssessments.length;
    const totalRevenue = paidAssessments.reduce((sum, a) => sum + (a.amountPaid || 0), 0);

    return NextResponse.json({
      setting: setting || { price: 299, originalPrice: 999, isEnabled: true, videoUrl: '' },
      stats: {
        totalSubmissions,
        totalPaid,
        totalCompleted,
        totalRevenue
      },
      assessments
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Career Guidance GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admin data' }, { status: 500 });
  }
}
