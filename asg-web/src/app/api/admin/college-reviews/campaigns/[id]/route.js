import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import WorkshopReviewCampaign from '@/models/WorkshopReviewCampaign';
import CollegeReview from '@/models/CollegeReview';

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const campaign = await WorkshopReviewCampaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete campaign and optionally its reviews
    await WorkshopReviewCampaign.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Campaign deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Campaign error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete campaign' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const updated = await WorkshopReviewCampaign.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign: updated }, { status: 200 });
  } catch (error) {
    console.error('Update Campaign error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update campaign' }, { status: 500 });
  }
}
