import mongoose from './node_modules/mongoose/index.js';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (err) {}
}

let MONGODB_URI = 'mongodb://127.0.0.1:27017/ASG-Web';
try {
  const envContent = fs.readFileSync('g:/project/ASG/asg-web/.env.local', 'utf-8');
  const match = envContent.match(/MONGODB_URI\s*=\s*["']?([^"'\r\n]+)["']?/);
  if (match && match[1]) {
    MONGODB_URI = match[1].trim();
  }
} catch (e) {
  // Use fallback
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
}, { timestamps: true });

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, default: 0 },
  price: { type: Number, required: true },
  coverImage: { type: String, default: '' },
  ebookUrl: { type: String, default: '' },
  physicalPrice: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  weight: { type: Number, default: 500 },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true, trim: true },
  userEmail: { type: String, required: true, trim: true, lowercase: true },
  itemType: { type: String, required: true, enum: ['book', 'webinar', 'seminar', 'platform'] },
  itemId: { type: mongoose.Schema.Types.ObjectId, default: null },
  itemTitle: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  verified: { type: Boolean, default: true },
  status: { type: String, enum: ['approved', 'rejected'], default: 'approved' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

const realReviews = [
  {
    userName: 'Aishwarya S',
    userEmail: 'aishwarya.s@reader.com',
    rating: 5,
    createdAt: new Date('2013-08-08T05:30:00.000Z'),
    comment: 'great book.. it is meant for students, teachers and parents. it tells us how our inner sense of accomplishment helps us more than any amount of external pressure. i would recommend this book to all.'
  },
  {
    userName: 'Swapnil Kubde',
    userEmail: 'swapnil.kubde@reader.com',
    rating: 5,
    createdAt: new Date('2013-07-06T05:30:00.000Z'),
    comment: 'Excellent BOOK!!!!! It is very helpful...and very easy learning tips..'
  },
  {
    userName: 'rahul',
    userEmail: 'rahul@reader.com',
    rating: 5,
    createdAt: new Date('2013-04-22T05:30:00.000Z'),
    comment: 'frankly speaking it can change vivew of thinking because its not only for student (education) life ;it also for in real life lots thanks to mr avinash for changing my life.'
  },
  {
    userName: 'jashobanta',
    userEmail: 'jashobanta@reader.com',
    rating: 5,
    createdAt: new Date('2013-04-22T05:30:00.000Z'),
    comment: 'Very good book for beginners................'
  },
  {
    userName: 'Kalyani Nimkar',
    userEmail: 'kalyani.nimkar@reader.com',
    rating: 5,
    createdAt: new Date('2013-04-17T05:30:00.000Z'),
    comment: 'Really a good job.'
  },
  {
    userName: 'Ron',
    userEmail: 'ron@reader.com',
    rating: 5,
    createdAt: new Date('2013-04-14T05:30:00.000Z'),
    comment: 'Nice book'
  },
  {
    userName: 'Ashvin Khasale',
    userEmail: 'ashvin.khasale@reader.com',
    rating: 5,
    createdAt: new Date('2013-04-14T05:30:00.000Z'),
    comment: 'Excellent Book for encouraging I ever read!'
  },
  {
    userName: 'Neethu',
    userEmail: 'neethu.amazon@reader.com',
    rating: 5,
    createdAt: new Date('2014-12-16T12:00:00.000Z'),
    comment: 'Small & Beautiful, Come on, BUY IT, READ IT, and You Can Do it! I just loved this book. I just finished the whole book, the day I bought it .This book has more potential to always keep you awake with its simple examples and exercises. The book is primarily meant for students, however it applies to each and everybody. The author is primarily focussed on getting good scores in exam, however it applies to all life exams!! One small book with answers of all the major problem of us. Small, simple yet captivating enough. He has put forward the music method, which is equally interesting and useful. The principles/ methods put forwarded by this is easily adaptable to daily life. You will be a on your winning path when you will complete this book. Great delivery from Amazon. All the best and Happy reading ….'
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB at', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB!');

    // 1. Find or create the book
    let book = await Book.findOne({
      $or: [
        { title: { $regex: /come on/i } },
        { title: { $regex: /can do it/i } }
      ]
    });

    if (!book) {
      book = await Book.findOne({});
    }

    if (!book) {
      book = await Book.create({
        title: 'Come on... You can do it!',
        description: 'Empowering students and young professionals to choose the right career path, build confidence, and achieve their goals through practical scientific techniques.',
        originalPrice: 499,
        price: 299,
        stock: 50,
        physicalPrice: 199,
        shippingCost: 50,
        isFeatured: true
      });
      console.log('Created book:', book.title);
    } else {
      console.log('Found book:', book.title, book._id);
    }

    // 2. Insert each review
    for (const item of realReviews) {
      let user = await User.findOne({ email: item.userEmail });
      if (!user) {
        user = await User.create({
          name: item.userName,
          email: item.userEmail,
          password: 'hashed_placeholder_pwd',
          role: 'client'
        });
      }

      const reviewDoc = {
        userId: user._id,
        userName: item.userName,
        userEmail: item.userEmail,
        itemType: 'book',
        itemId: book._id,
        itemTitle: book.title,
        rating: item.rating,
        comment: item.comment,
        verified: true,
        status: 'approved',
        createdAt: item.createdAt,
        updatedAt: item.createdAt
      };

      await Review.findOneAndUpdate(
        { userId: user._id, itemType: 'book', itemId: book._id },
        reviewDoc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Seeded review from: ${item.userName}`);
    }

    console.log('All 8 reviews successfully seeded into MongoDB!');
    process.exit(0);

  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
