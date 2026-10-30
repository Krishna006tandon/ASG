import mongoose from 'mongoose';

const CareerSettingSchema = new mongoose.Schema({
  price: { type: Number, default: 299 },
  originalPrice: { type: Number, default: 999 },
  isEnabled: { type: Boolean, default: true },
  videoUrl: { type: String, default: '' }, // Admin can set a custom YouTube/Vimeo/MP4 URL, or leave blank to show the interactive demo video
  headline: { type: String, default: 'Discover Your True Nature & Swadharma' },
  subheadline: { type: String, default: 'Find the work you were naturally designed to do with our 30-Question Career Nature Assessment.' }
}, { timestamps: true });

export default mongoose.models.CareerSetting || mongoose.model('CareerSetting', CareerSettingSchema);
