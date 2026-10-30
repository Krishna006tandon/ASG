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
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    default: 5
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

// Index for fast search and aggregation
CollegeReviewSchema.index({ collegeName: 1, workshopTitle: 1 });
CollegeReviewSchema.index({ rating: -1, createdAt: -1 });

export default mongoose.models.CollegeReview || mongoose.model('CollegeReview', CollegeReviewSchema);
