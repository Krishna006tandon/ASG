import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StartupSetting from '@/models/StartupSetting';

const DEFAULT_SETTINGS = {
  introVideo: {
    videoUrl: '',
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
    console.error('Admin Startup Setting GET error:', error);
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { introVideo, caseStudyVideos } = body;

    let setting = await StartupSetting.findOne();
    if (!setting) {
      setting = new StartupSetting({
        introVideo: introVideo || DEFAULT_SETTINGS.introVideo,
        caseStudyVideos: caseStudyVideos || DEFAULT_SETTINGS.caseStudyVideos
      });
    } else {
      if (introVideo) {
        setting.introVideo = {
          videoUrl: (introVideo.videoUrl || '').trim(),
          title: (introVideo.title || 'Why I Guide Aspiring Entrepreneurs').trim(),
          duration: (introVideo.duration || '2 Min 45 Sec').trim(),
          thumbnailUrl: (introVideo.thumbnailUrl || '/images/image1.png').trim(),
          isEnabled: introVideo.isEnabled !== false
        };
      }
      if (Array.isArray(caseStudyVideos)) {
        setting.caseStudyVideos = caseStudyVideos.map((c, idx) => ({
          id: c.id || (idx + 1),
          name: c.name || `Founder ${idx + 1}`,
          sector: c.sector || 'Business',
          videoTitle: c.videoTitle || 'Case Study Video',
          videoUrl: (c.videoUrl || '').trim(),
          thumbnailUrl: (c.thumbnailUrl || '').trim(),
          isEnabled: c.isEnabled !== false
        }));
      }
    }

    await setting.save();
    return NextResponse.json({ success: true, setting }, { status: 200 });
  } catch (error) {
    console.error('Admin Startup Setting POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
