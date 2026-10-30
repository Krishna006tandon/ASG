import mongoose from 'mongoose';

const CareerAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  candidateDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    education: { type: String, default: '' },
    currentStatus: { type: String, default: '' } // College Student, Graduate, Working Professional, School Student
  },
  amountPaid: { type: Number, required: true },
  couponApplied: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  testStatus: {
    type: String,
    enum: ['Pending', 'InProgress', 'Completed'],
    default: 'Pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  answers: {
    type: Map,
    of: Number,
    default: {}
  },
  scores: {
    type: Object,
    default: {}
  },
  topCategories: [
    {
      code: String,
      name: String,
      score: Number,
      roles: String,
      badge: String
    }
  ],
  synergyInsight: { type: String, default: '' },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.CareerAssessment || mongoose.model('CareerAssessment', CareerAssessmentSchema);
