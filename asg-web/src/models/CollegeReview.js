import mongoose from 'mongoose';

const CollegeReviewSchema = new mongoose.Schema({
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkshopReviewCampaign',
    default: null
  },
  campaignSlug: { 
    type: String, 
    default: '' 
  },
  collegeName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  workshopTitle: { 
    type: String, 
    required: true, 
    trim: true 
  },
  studentName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  studentEmail: { 
    type: String, 
    trim: true, 
    lowercase: true,
    default: '' 
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  department: { 
    type: String, 
    trim: true,
    default: '' 
  },
  year: { 
    type: String, 
    trim: true,
    default: '' 
  },
  dob: {
    type: String,
    trim: true,
    default: ''
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    default: 5
  },
  ratingsBreakdown: {
    content: { type: Number, default: 5 },
    delivery: { type: Number, default: 5 },
    trainer1: { type: Number, default: 5 },
    trainer2: { type: Number, default: 5 },
    overall: { type: Number, default: 5 }
  },
  comment: { 
    type: String, 
    required: true, 
    trim: true 
  },
  keyTakeaway: { 
    type: String, 
    trim: true,
    default: '' 
  },
  improvementFeedback: {
    type: String,
    trim: true,
    default: ''
  },
  // Lead Intelligence: Capture student intent from Google Form
  leadInterests: {
    careerTest: { type: Boolean, default: false },
    book: { type: Boolean, default: false },
    counselling: { type: Boolean, default: false },
    upcomingWorkshops: { type: Boolean, default: false }
  },
  source: { 
    type: String, 
    enum: ['live_link', 'excel_import'],
    default: 'live_link'
  },
  status: { 
    type: String, 
    enum: ['approved', 'rejected'],
    default: 'approved'
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  workshopDate: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Indexes for fast searching & filtering
CollegeReviewSchema.index({ collegeName: 1, workshopTitle: 1 });
CollegeReviewSchema.index({ rating: -1, createdAt: -1 });
CollegeReviewSchema.index({ 'leadInterests.careerTest': 1, 'leadInterests.book': 1 });

export default mongoose.models.CollegeReview || mongoose.model('CollegeReview', CollegeReviewSchema);
