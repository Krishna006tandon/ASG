import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['rating', 'text', 'choice'], 
    default: 'rating' 
  },
  question: { type: String, required: true, trim: true },
  required: { type: Boolean, default: true },
  options: [{ type: String, trim: true }]
}, { _id: false });

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
  questions: [QuestionSchema],
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
