import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { 
    type: String, 
    required: true,
    trim: true
  },
  userEmail: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  itemType: { 
    type: String, 
    required: true, 
    enum: ['book', 'webinar', 'seminar', 'platform'] 
  },
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: null 
  },
  itemTitle: { 
    type: String, 
    required: true,
    trim: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000 
  },
  verified: { 
    type: Boolean, 
    default: true 
  },
  status: { 
    type: String, 
    enum: ['approved', 'rejected'], 
    default: 'approved' 
  }
}, { timestamps: true });

ReviewSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
