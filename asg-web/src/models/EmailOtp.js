import mongoose from 'mongoose';

const EmailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['consultation', 'product_purchase', 'booking', 'general'],
    default: 'booking',
    index: true,
  },
  verified: {
    type: Boolean,
    default: false,
    index: true,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB automatic TTL cleanup when expiresAt passes
  },
}, { timestamps: true });

export default mongoose.models.EmailOtp || mongoose.model('EmailOtp', EmailOtpSchema);
