import mongoose from 'mongoose';

const WebinarRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  webinarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webinar', required: true },
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
  amountPaid: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.WebinarRegistration || mongoose.model('WebinarRegistration', WebinarRegistrationSchema);
