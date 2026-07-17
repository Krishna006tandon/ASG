import mongoose from 'mongoose';

const SeminarRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seminarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seminar', required: true },
  ticketNumber: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  registrationData: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    whatsapp: { type: String, required: true },
    profession: { type: String, required: true }
  },
  amountPaid: { type: Number, required: true },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.SeminarRegistration || mongoose.model('SeminarRegistration', SeminarRegistrationSchema);
