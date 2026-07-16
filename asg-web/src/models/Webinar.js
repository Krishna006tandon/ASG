import mongoose from 'mongoose';

const WebinarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  originalPrice: { type: Number, default: 0 },
  price: { type: Number, required: true }, // Selling Price
  seatsTotal: { type: Number, required: true },
  seatsBooked: { type: Number, default: 0 },
  meetingLink: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Webinar || mongoose.model('Webinar', WebinarSchema);
