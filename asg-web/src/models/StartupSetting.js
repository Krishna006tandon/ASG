import mongoose from 'mongoose';

const StartupSettingSchema = new mongoose.Schema({
  introVideo: {
    videoUrl: { type: String, default: '' }, // If empty, public site shows "Coming Soon"
    title: { type: String, default: 'Why I Guide Aspiring Entrepreneurs' },
    duration: { type: String, default: '2 Min 45 Sec' },
    thumbnailUrl: { type: String, default: '/images/image1.png' },
    isEnabled: { type: Boolean, default: true }
  },
  caseStudyVideos: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      sector: { type: String, required: true },
      videoTitle: { type: String, required: true },
      videoUrl: { type: String, default: '' }, // If empty, shows "Coming Soon"
      thumbnailUrl: { type: String, default: '' },
      isEnabled: { type: Boolean, default: true }
    }
  ]
}, { timestamps: true });

export default mongoose.models.StartupSetting || mongoose.model('StartupSetting', StartupSettingSchema);
