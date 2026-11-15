import mongoose from 'mongoose';

const ActionItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
}, { _id: false });

const ConsultationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    enum: ['general', 'startup', 'career'],
    default: 'general'
  },
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  message: { type: String, required: false },

  // 1. Pre-meeting Requirements from User (visible to Admin)
  requirements: {
    text: { type: String, default: '' },
    specificQuestions: { type: [String], default: [] },
    goals: { type: String, default: '' },
    attachments: { type: [String], default: [] },
    updatedAt: { type: Date, default: null }
  },

  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid'
  },
  charges: {
    type: Number,
    default: null
  },
  meetingLink: {
    type: String,
    default: null
  },

  // 2. Post-meeting Follow-up & Action Checklist (filled by user after meet, visible to user & admin)
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

  // 3. Post-follow-up Feedback Form (filled by user after follow-up, visible to user & admin)
  feedback: {
    filled: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    filledAt: { type: Date, default: null }
  }
}, { timestamps: true });

export default mongoose.models.Consultation || mongoose.model('Consultation', ConsultationSchema);
