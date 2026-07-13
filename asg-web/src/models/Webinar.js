import mongoose from 'mongoose';

const WebinarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  seatsTotal: { type: Number, required: true },
  seatsBooked: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Webinar || mongoose.model('Webinar', WebinarSchema);
