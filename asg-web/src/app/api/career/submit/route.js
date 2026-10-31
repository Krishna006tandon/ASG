import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CareerAssessment from '@/models/CareerAssessment';
import { computeAssessmentResults } from '@/lib/careerData';
import { authenticateApi } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';
import { careerAssessmentResultTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { assessmentId, answers } = await req.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessment ID' }, { status: 400 });
    }

    if (!answers || Object.keys(answers).length < 30) {
      return NextResponse.json({ error: 'All 30 questions must be answered.' }, { status: 400 });
    }

    const decoded = authenticateApi(req);

    await connectToDatabase();

    const assessment = await CareerAssessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }

    if (!assessment.userId && decoded?.userId) {
      assessment.userId = decoded.userId;
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com';
    const reportUrl = `${siteUrl}/career-guidance?result=${assessment._id}`;
    const topArchetypes = results.top3.map(t => `${t.name} (${t.score} pts)`).join(', ');

    // 1. Send Results Report Email to Candidate
    const candidateEmail = assessment.candidateDetails?.email;
    const candidateName = assessment.candidateDetails?.name || 'Candidate';
    if (candidateEmail) {
      try {
        await sendEmail({
          to: candidateEmail,
          subject: `Your Career Nature Assessment Results & Swadharma Report | Avinash S. Gore`,
          html: careerAssessmentResultTemplate(
            candidateName, 
            topArchetypes, 
            results.synergyInsight?.headline || '', 
            reportUrl
          )
        });
      } catch (userMailErr) {
        console.error('Failed to send career result email to candidate:', userMailErr);
      }
    }

    // 2. Alert Admin about Completed Assessment
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Candidate Name:</strong> ${candidateName}</p>
        <p><strong>Email:</strong> ${candidateEmail || 'N/A'}</p>
        <p><strong>Phone:</strong> ${assessment.candidateDetails?.phone || 'N/A'}</p>
        <p><strong>Class / Stream:</strong> ${assessment.candidateDetails?.classStream || 'N/A'}</p>
        <p><strong>Top 3 Nature Archetypes:</strong> ${topArchetypes}</p>
        <p><strong>Synergy Insight:</strong> ${results.synergyInsight?.headline || 'Standard profile'}</p>
        <p><strong>Assessment ID:</strong> ${assessment._id}</p>
        <p style="margin-top: 15px;">
          <a href="${siteUrl}/admin/career-guidance" style="background:#4F46E5; color:#fff; padding:8px 16px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
            Open Career Assessment in Admin &rarr;
          </a>
        </p>
      `;
      try {
        await sendEmail({
          to: adminEmail,
          subject: `📊 Career Assessment Completed: ${candidateName}`,
          html: adminNotificationTemplate('Career Assessment Completed', detailsHtml)
        });
      } catch (mailErr) {
        console.error('Failed to send career completion admin email:', mailErr);
      }
    }

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
