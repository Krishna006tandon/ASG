import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  items: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: String,
    price: Number,
    quantity: Number
  }],
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
