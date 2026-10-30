import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CareerAssessment from '@/models/CareerAssessment';
import { computeAssessmentResults } from '@/lib/careerData';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const assessment = await CareerAssessment.findById(id);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Recompute or return saved results
    let results = null;
    if (assessment.answers && Object.keys(assessment.answers).length === 30) {
      // If answers is a Mongoose Map, convert to plain object
      const answersObj = assessment.answers instanceof Map ? Object.fromEntries(assessment.answers) : assessment.answers;
      results = computeAssessmentResults(answersObj);
    }

    return NextResponse.json({
      assessmentId: assessment._id,
      candidate: assessment.candidateDetails,
      paymentStatus: assessment.paymentStatus,
      testStatus: assessment.testStatus,
      completedAt: assessment.completedAt,
      amountPaid: assessment.amountPaid,
      topCategories: assessment.topCategories,
      synergyInsight: assessment.synergyInsight,
      results
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch Career Result Error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment result' }, { status: 500 });
  }
}
