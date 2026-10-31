import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import WorkshopReviewCampaign from '@/models/WorkshopReviewCampaign';
import CollegeReview from '@/models/CollegeReview';
import { sendEmail } from '@/lib/mailer';
import { workshopFeedbackAckTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

const DEFAULT_QUESTIONS = [
  {
    id: 'q_content_rating',
    type: 'rating',
    question: 'How would you rate the Training Content?',
    required: true
  },
  {
    id: 'q_delivery_rating',
    type: 'rating',
    question: 'How would you rate the Training Presentation & Delivery Style?',
    required: true
  },
  {
    id: 'q_overall_rating',
    type: 'rating',
    question: 'Overall, how would you rate this training program?',
    required: true
  },
  {
    id: 'q_apply_learning',
    type: 'choice',
    question: 'Will you be able to apply the learning in your professional or personal life?',
    required: true,
    options: ['Definitely', 'Probably', 'Maybe', 'Not sure']
  },
  {
    id: 'q_liked_most',
    type: 'text',
    question: 'What did you like most about the training session?',
    required: true
  },
  {
    id: 'q_improvement',
    type: 'text',
    question: 'What can we improve in future training programs?',
    required: false
  },
  {
    id: 'q_book_interest',
    type: 'choice',
    question: "Would you be interested in purchasing the book 'Come On You Can Do It'?",
    required: false,
    options: ['Yes', 'Maybe', 'No']
  },
  {
    id: 'q_career_test_interest',
    type: 'choice',
    question: 'Would you be interested in taking career counselling / career assessment test?',
    required: false,
    options: ['Yes', 'Maybe', 'No']
  },
  {
    id: 'q_counselling_interest',
    type: 'choice',
    question: 'Would you be interested in 1-on-1 Personal Guidance with Avinash Gore?',
    required: false,
    options: ['Yes', 'Maybe', 'No']
  },
  {
    id: 'q_other_comments',
    type: 'text',
    question: 'Any other comments, questions, or words for Avinash Sir?',
    required: false
  }
];

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    const campaign = await WorkshopReviewCampaign.findOne({ slug: slug.toLowerCase() }).lean();

    if (!campaign) {
      return NextResponse.json({ error: 'Workshop session not found or link has expired.' }, { status: 404 });
    }

    // Ensure questions array is present
    const questions = Array.isArray(campaign.questions) && campaign.questions.length > 0 
      ? campaign.questions 
      : DEFAULT_QUESTIONS;

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        questions
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch Workshop Feedback Info Error:', error);
    return NextResponse.json({ error: 'Failed to fetch session information' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const { 
      studentName, 
      studentEmail, 
      phone, 
      department, 
      year, 
      answers = {} 
    } = body;

    if (!studentName || !studentName.trim()) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Please enter your mobile number.' }, { status: 400 });
    }

    await connectToDatabase();

    const campaign = await WorkshopReviewCampaign.findOne({ slug: slug.toLowerCase() });

    if (!campaign) {
      return NextResponse.json({ error: 'Workshop campaign not found' }, { status: 404 });
    }

    if (!campaign.isActive) {
      return NextResponse.json({ error: 'This workshop feedback link is no longer accepting new responses.' }, { status: 403 });
    }

    // Smart answer parsing for ratings, lead interests, and comments
    const questions = Array.isArray(campaign.questions) && campaign.questions.length > 0 
      ? campaign.questions 
      : DEFAULT_QUESTIONS;

    let overallRating = 5;
    let contentRating = 5;
    let deliveryRating = 5;
    let primaryComment = '';
    let improvementFeedback = '';
    const leadInterests = {
      careerTest: false,
      book: false,
      counselling: false,
      upcomingWorkshops: false
    };

    questions.forEach(q => {
      const ans = answers[q.id];
      if (ans === undefined || ans === null) return;

      const qText = q.question.toLowerCase();
      const ansStr = String(ans).trim();

      // Check for ratings
      if (q.type === 'rating') {
        const rVal = Number(ans);
        if (!isNaN(rVal)) {
          if (qText.includes('overall') || q.id === 'q_overall_rating') {
            overallRating = rVal;
          } else if (qText.includes('content') || q.id === 'q_content_rating') {
            contentRating = rVal;
          } else if (qText.includes('delivery') || qText.includes('presentation') || q.id === 'q_delivery_rating') {
            deliveryRating = rVal;
          }
        }
      }

      // Check for comments
      if (q.type === 'text') {
        if (qText.includes('liked') || q.id === 'q_liked_most') {
          primaryComment = ansStr;
        } else if (qText.includes('improve') || q.id === 'q_improvement') {
          improvementFeedback = ansStr;
        } else if (!primaryComment && ansStr.length > 3) {
          primaryComment = ansStr;
        }
      }

      // Check for leads
      const ansLower = ansStr.toLowerCase();
      if (qText.includes('career') || qText.includes('assessment')) {
        if (ansLower.includes('yes') || ansLower.includes('definitely')) leadInterests.careerTest = true;
      }
      if (qText.includes('book') || qText.includes('come on')) {
        if (ansLower.includes('yes') || ansLower.includes('definitely')) leadInterests.book = true;
      }
      if (qText.includes('counselling') || qText.includes('guidance') || qText.includes('one-to-one')) {
        if (ansLower.includes('yes') || ansLower.includes('definitely')) leadInterests.counselling = true;
      }
    });

    // Fallback if no specific text entered
    if (!primaryComment) {
      primaryComment = `Attended workshop at ${campaign.collegeName}. Rated ${overallRating}/5 stars.`;
    }

    // Save student feedback
    const review = await CollegeReview.create({
      campaignId: campaign._id,
      campaignSlug: campaign.slug,
      collegeName: campaign.collegeName,
      workshopTitle: campaign.workshopTitle,
      studentName: studentName.trim(),
      studentEmail: (studentEmail || '').trim().toLowerCase(),
      phone: phone.trim(),
      department: (department || '').trim(),
      year: (year || '').trim(),
      rating: overallRating,
      ratingsBreakdown: {
        content: contentRating,
        delivery: deliveryRating,
        trainer1: overallRating,
        trainer2: overallRating,
        overall: overallRating
      },
      comment: primaryComment,
      keyTakeaway: primaryComment,
      improvementFeedback,
      leadInterests,
      answers,
      source: 'live_link',
      status: 'approved',
      workshopDate: campaign.date
    });

    // Update campaign counters
    const allForCampaign = await CollegeReview.find({ campaignSlug: campaign.slug, status: 'approved' });
    const count = allForCampaign.length;
    const avg = Number((allForCampaign.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1));

    campaign.totalReviews = count;
    campaign.averageRating = avg;
    await campaign.save();

    // 1. Send Thank You / Attendance Acknowledgement Email to Student
    if (studentEmail && studentEmail.includes('@')) {
      try {
        await sendEmail({
          to: studentEmail.trim().toLowerCase(),
          subject: `Thank you for attending the workshop at ${campaign.collegeName} | Avinash S. Gore`,
          html: workshopFeedbackAckTemplate(studentName, campaign.collegeName, campaign.workshopTitle)
        });
      } catch (mailErr) {
        console.error('Failed to send workshop student email:', mailErr);
      }
    }

    // 2. Alert Admin about New College Workshop Review & Student Lead
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const interests = [];
      if (leadInterests.careerTest) interests.push('Career Assessment');
      if (leadInterests.book) interests.push('Book: Come On You Can Do It');
      if (leadInterests.counselling) interests.push('1-on-1 Guidance');

      const detailsHtml = `
        <p><strong>College / Institution:</strong> ${campaign.collegeName}</p>
        <p><strong>Workshop:</strong> ${campaign.workshopTitle}</p>
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${studentEmail || 'N/A'}</p>
        <p><strong>Department &amp; Year:</strong> ${department || 'N/A'} ${year ? `(${year})` : ''}</p>
        <p><strong>Overall Rating:</strong> ${overallRating}/5</p>
        <p><strong>Key Takeaway:</strong> ${primaryComment}</p>
        ${interests.length > 0 ? `<p><strong>🎯 High Interest In:</strong> <span style="color:#059669; font-weight:bold;">${interests.join(', ')}</span></p>` : ''}
      `;
      try {
        await sendEmail({
          to: adminEmail,
          subject: `🎓 New Workshop Feedback from ${studentName} (${campaign.collegeName})`,
          html: adminNotificationTemplate('College Workshop Attendance & Feedback', detailsHtml)
        });
      } catch (mailErr) {
        console.error('Failed to send workshop review admin email:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your attendance and feedback have been recorded successfully.',
      reviewId: review._id
    }, { status: 201 });

  } catch (error) {
    console.error('Submit Workshop Feedback Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
