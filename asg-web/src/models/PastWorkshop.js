import mongoose from 'mongoose';

const PastWorkshopImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: '' },
}, { _id: false });

const PastWorkshopSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  category: { type: String, default: 'Workshop', trim: true },
  attendeesCount: { type: String, default: '', trim: true },
  description: { type: String, required: true },
  highlights: [{ type: String, trim: true }],
  images: [PastWorkshopImageSchema],
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.PastWorkshop || mongoose.model('PastWorkshop', PastWorkshopSchema);
