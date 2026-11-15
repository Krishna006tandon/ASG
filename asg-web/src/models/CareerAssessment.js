import mongoose from 'mongoose';

const ActionItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
}, { _id: false });

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
  sessionStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  meetingLink: {
    type: String,
    default: null
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
  completedAt: { type: Date },

  // 1. Pre-meeting Requirements from Candidate
  requirements: {
    text: { type: String, default: '' },
    specificQuestions: { type: [String], default: [] },
    goals: { type: String, default: '' },
    attachments: { type: [String], default: [] },
    updatedAt: { type: Date, default: null }
  },

  // 2. Post-meeting Follow-up & Action Checklist
  followUp: {
    filled: { type: Boolean, default: false },
    keyTakeaways: { type: String, default: '' },
    actionItems: [ActionItemSchema],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    filledAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null }
  },

  // 3. Post-follow-up Feedback Form
  feedback: {
    filled: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    filledAt: { type: Date, default: null }
  }
}, { timestamps: true });

export default mongoose.models.CareerAssessment || mongoose.model('CareerAssessment', CareerAssessmentSchema);
