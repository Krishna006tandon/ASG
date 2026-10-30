import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import WorkshopReviewCampaign from '@/models/WorkshopReviewCampaign';
import CollegeReview from '@/models/CollegeReview';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    const campaign = await WorkshopReviewCampaign.findOne({ slug: slug.toLowerCase() }).lean();

    if (!campaign) {
      return NextResponse.json({ error: 'Workshop session not found or link has expired.' }, { status: 404 });
    }

    return NextResponse.json({ campaign }, { status: 200 });

  } catch (error) {
    console.error('Fetch Workshop Feedback Info Error:', error);
    return NextResponse.json({ error: 'Failed to fetch session information' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const { studentName, studentEmail, department, year, rating, comment, keyTakeaway } = body;

    if (!studentName || !comment) {
      return NextResponse.json({ error: 'Please provide your name and your feedback message.' }, { status: 400 });
    }

    await connectToDatabase();

    const campaign = await WorkshopReviewCampaign.findOne({ slug: slug.toLowerCase() });

    if (!campaign) {
      return NextResponse.json({ error: 'Workshop campaign not found' }, { status: 404 });
    }

    if (!campaign.isActive) {
      return NextResponse.json({ error: 'This workshop feedback link is no longer accepting new responses.' }, { status: 403 });
    }

    const parsedRating = Math.min(5, Math.max(1, Number(rating) || 5));

    // Save student feedback
    const review = await CollegeReview.create({
      campaignId: campaign._id,
      campaignSlug: campaign.slug,
      collegeName: campaign.collegeName,
      workshopTitle: campaign.workshopTitle,
      studentName: studentName.trim(),
      studentEmail: (studentEmail || '').trim().toLowerCase(),
      department: (department || '').trim(),
      year: (year || '').trim(),
      rating: parsedRating,
      comment: comment.trim(),
      keyTakeaway: (keyTakeaway || '').trim(),
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

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your feedback has been recorded successfully.',
      reviewId: review._id
    }, { status: 201 });

  } catch (error) {
    console.error('Submit Workshop Feedback Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
