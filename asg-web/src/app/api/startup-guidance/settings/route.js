import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StartupSetting from '@/models/StartupSetting';

const DEFAULT_SETTINGS = {
  introVideo: {
    videoUrl: '', // Default empty => "Coming Soon"
    title: 'Why I Guide Aspiring Entrepreneurs',
    duration: '2 Min 45 Sec',
    thumbnailUrl: '/images/image1.png',
    isEnabled: true
  },
  caseStudyVideos: [
    {
      id: 1,
      name: 'Rahul Sharma',
      sector: 'Industrial Process Components (B2B)',
      videoTitle: "Rahul's Journey: From Corporate Employee to Sustainable B2B Founder",
      videoUrl: '',
      thumbnailUrl: '',
      isEnabled: true
    },
    {
      id: 2,
      name: 'Priya Deshmukh',
      sector: 'Pre-school & Educational Daycare',
      videoTitle: "Priya's Journey: Building Systems in Education & Services",
      videoUrl: '',
      thumbnailUrl: '',
      isEnabled: true
    },
    {
      id: 3,
      name: 'Vikram Joshi',
      sector: 'Corporate Events & Brand Activations',
      videoTitle: "Vikram's Journey: Mastering Working Capital & Event Logistics",
      videoUrl: '',
      thumbnailUrl: '',
      isEnabled: true
    }
  ]
};

export async function GET() {
  try {
    await connectToDatabase();
    let setting = await StartupSetting.findOne().lean();
    if (!setting) {
      setting = await StartupSetting.create(DEFAULT_SETTINGS);
    }
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch startup settings:', error);
    // Graceful fallback to default settings if DB offline
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }
}
