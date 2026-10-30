import mongoose from 'mongoose';

const WorkshopReviewCampaignSchema = new mongoose.Schema({
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
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  speaker: { 
    type: String, 
    default: 'Avinash Gore' 
  },
  description: { 
    type: String, 
    default: 'Share your genuine feedback on the workshop with Avinash Gore & Perpetual Solutions.' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  },
  averageRating: { 
    type: Number, 
    default: 5.0 
  }
}, { timestamps: true });

export default mongoose.models.WorkshopReviewCampaign || mongoose.model('WorkshopReviewCampaign', WorkshopReviewCampaignSchema);
