import mongoose from './node_modules/mongoose/index.js';
import dns from 'dns';
import fs from 'fs';

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

const PastWorkshop = mongoose.models.PastWorkshop || mongoose.model('PastWorkshop', PastWorkshopSchema);

const INITIAL_WORKSHOPS = [
  {
    title: "HAZOP Study Methodologies & Process Safety Leadership",
    date: new Date("2024-03-15"),
    location: "Sadara Chemical Company (JV Aramco & Dow), Jubail",
    category: "Safety & HAZOP",
    attendeesCount: "85+ Process & Safety Engineers",
    description: "Leading comprehensive Hazard and Operability (HAZOP) study sessions. Demonstrating a strong commitment to process safety management by training teams on critical safety documents, P&IDs, and risk assessment procedures.",
    highlights: [
      "Live P&ID node-by-node safety risk evaluation",
      "Process deviations, cause-consequence analysis, and LOPA",
      "Safety instrumentation system requirements and OSHA compliance standards",
      "Leadership strategies in emergency response scenarios"
    ],
    images: [
      { url: "/images/image1.png", caption: "Avinash Gore guiding safety engineers through plant P&ID schematics" },
      { url: "/images/image4.png", caption: "Leadership recognition at Sadara Chemical Company" }
    ],
    featured: true,
    order: 1
  },
  {
    title: "Jubail 2nd Energy Management & Sustainability Conference",
    date: new Date("2023-11-20"),
    location: "Jubail Industrial City, Saudi Arabia",
    category: "Engineering & Industry",
    attendeesCount: "250+ Industry Executives & Engineers",
    description: "Keynote presentation and practical engineering workshop addressing industrial decarbonization, energy conservation methodologies, and operational efficiency across mega-scale petrochemical operations.",
    highlights: [
      "Energy conservation principles in large-scale continuous processes",
      "Operational benchmarks for minimizing carbon intensity",
      "Case studies on utility system optimization and heat integration",
      "Industry honor received at the 2019/2023 Energy Summit"
    ],
    images: [
      { url: "/images/image 2.jpg", caption: "Keynote presentation on stage at Jubail Energy Summit" },
      { url: "/images/image3.jpg", caption: "Prestigious award ceremony for Excellence in Energy Leadership" }
    ],
    featured: true,
    order: 2
  },
  {
    title: "Transforming Anxiety into Focus: One Day Workshop for Youth",
    date: new Date("2024-08-10"),
    location: "Mumbai, India",
    category: "Youth Empowerment",
    attendeesCount: "350+ Students & Professionals",
    description: "Driven by a mission to unlock true potential, Avinash conducts powerful One Day Workshops for students and professionals. These sessions go beyond theoretical lectures—focusing on practical exercises, confidence building, and handling real-world pressure like a champion.",
    highlights: [
      "Scientific study techniques to dissolve exam phobia",
      "Active recall and spaced repetition for academic excellence",
      "Confidence building drills and goal visualization exercises",
      "Direct Q&A and interactive mindset transformation"
    ],
    images: [
      { url: "/images/image5.jpg", caption: "Avinash Gore interacting with participants and students" }
    ],
    featured: false,
    order: 3
  }
];

async function seed() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI, { dbName: 'ASG-Web' });
  console.log('Connected successfully!');

  const count = await PastWorkshop.countDocuments();
  console.log(`Current past workshops count: ${count}`);

  if (count === 0) {
    console.log('Seeding initial past workshops...');
    await PastWorkshop.insertMany(INITIAL_WORKSHOPS);
    console.log('Successfully seeded initial past workshops!');
  } else {
    console.log('Workshops already exist in database. No seeding needed.');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
