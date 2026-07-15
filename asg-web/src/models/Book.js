import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, default: 0 },
  price: { type: Number, required: true }, // Selling Price
  coverImage: { type: String, default: '' },
  ebookUrl: { type: String, default: '' }, // For Vercel Blob PDF URL
  physicalPrice: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  weight: { type: Number, default: 500 }, // in grams, for shipping calculation
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model('Book', BookSchema);
