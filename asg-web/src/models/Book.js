import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  coverImage: { type: String, default: '' },
  stock: { type: Number, required: true, default: 0 },
  weight: { type: Number, default: 500 }, // in grams, for shipping calculation
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model('Book', BookSchema);
