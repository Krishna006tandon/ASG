import mongoose from 'mongoose';

const ConsultationSchema = new mongoose.Schema({
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  message: { type: String, required: false },
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
  }
}, { timestamps: true });

export default mongoose.models.Consultation || mongoose.model('Consultation', ConsultationSchema);
