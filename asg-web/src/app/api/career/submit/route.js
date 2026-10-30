import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CareerAssessment from '@/models/CareerAssessment';
import { computeAssessmentResults } from '@/lib/careerData';

export async function POST(req) {
  try {
    const { assessmentId, answers } = await req.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessment ID' }, { status: 400 });
    }

    if (!answers || Object.keys(answers).length < 30) {
      return NextResponse.json({ error: 'All 30 questions must be answered.' }, { status: 400 });
    }

    await connectToDatabase();

    const assessment = await CareerAssessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }

    // Verify payment was completed
    if (assessment.paymentStatus !== 'Paid') {
      return NextResponse.json({ error: 'Payment has not been confirmed for this assessment.' }, { status: 402 });
    }

    // Compute results
    const results = computeAssessmentResults(answers);

    assessment.answers = answers;
    assessment.scores = results.scores;
    assessment.topCategories = results.top3.map(item => ({
      code: item.code,
      name: item.name,
      score: item.score,
      roles: item.roles,
      badge: item.badge
    }));
    assessment.synergyInsight = results.synergyInsight;
    assessment.testStatus = 'Completed';
    assessment.completedAt = new Date();

    await assessment.save();

    return NextResponse.json({
      success: true,
      assessmentId: assessment._id,
      candidate: assessment.candidateDetails,
      results
    }, { status: 200 });

  } catch (error) {
    console.error('Career Submit Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit assessment' }, { status: 500 });
  }
}
