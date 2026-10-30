import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import WorkshopReviewCampaign from '@/models/WorkshopReviewCampaign';
import CollegeReview from '@/models/CollegeReview';

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

export async function GET() {
  try {
    await connectToDatabase();

    const campaigns = await WorkshopReviewCampaign.find().sort({ createdAt: -1 }).lean();

    // Attach real-time review count and average rating to each campaign
    const enriched = await Promise.all(campaigns.map(async (camp) => {
      const reviewStats = await CollegeReview.aggregate([
        { $match: { campaignSlug: camp.slug, status: 'approved' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ]);

      const count = reviewStats[0]?.count || 0;
      const avg = reviewStats[0]?.avgRating ? Number(reviewStats[0].avgRating.toFixed(1)) : 5.0;

      return {
        ...camp,
        totalReviews: count,
        averageRating: avg
      };
    }));

    return NextResponse.json({ campaigns: enriched }, { status: 200 });

  } catch (error) {
    console.error('Fetch Campaigns error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { collegeName, workshopTitle, customSlug, date, speaker, description, questions } = body;

    if (!collegeName || !workshopTitle) {
      return NextResponse.json({ error: 'College Name and Workshop Title are required.' }, { status: 400 });
    }

    await connectToDatabase();

    // Generate or clean slug
    let slug = (customSlug || `${collegeName}-${workshopTitle}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      slug = `workshop-${Date.now().toString().slice(-6)}`;
    }

    // Check if slug already exists; if so, append random suffix
    const existing = await WorkshopReviewCampaign.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const campaign = await WorkshopReviewCampaign.create({
      collegeName: collegeName.trim(),
      workshopTitle: workshopTitle.trim(),
      slug,
      date: date ? new Date(date) : new Date(),
      speaker: speaker || 'Avinash Gore',
      description: description || 'Share your genuine feedback on the workshop with Avinash Gore & Perpetual Solutions.',
      questions: Array.isArray(questions) && questions.length > 0 ? questions : DEFAULT_QUESTIONS,
      isActive: true
    });

    return NextResponse.json({ campaign }, { status: 201 });

  } catch (error) {
    console.error('Create Campaign error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create campaign' }, { status: 500 });
  }
}
