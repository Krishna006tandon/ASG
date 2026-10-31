"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './startupAdmin.module.css';

function getEmbedUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  const isYouTube = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');
  if (isYouTube) {
    const vidIdMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    const vidId = vidIdMatch ? vidIdMatch[1] : '';
    if (vidId) {
      return `https://www.youtube.com/embed/${vidId}?rel=0`;
    }
  }
  return trimmed;
}

export default function StartupGuidanceAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Settings State
  const [introVideo, setIntroVideo] = useState({
    videoUrl: '',
    title: 'Why I Guide Aspiring Entrepreneurs',
    duration: '2 Min 45 Sec',
    thumbnailUrl: '/images/image1.png',
    isEnabled: true
  });

  const [caseStudyVideos, setCaseStudyVideos] = useState([
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
  ]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/startup-guidance/settings');
      if (!res.ok) throw new Error('Failed to load startup guidance settings');
      const data = await res.json();
      if (data) {
        if (data.introVideo) {
          setIntroVideo({
            videoUrl: data.introVideo.videoUrl || '',
            title: data.introVideo.title || 'Why I Guide Aspiring Entrepreneurs',
            duration: data.introVideo.duration || '2 Min 45 Sec',
            thumbnailUrl: data.introVideo.thumbnailUrl || '/images/image1.png',
            isEnabled: data.introVideo.isEnabled !== false
          });
        }
        if (Array.isArray(data.caseStudyVideos) && data.caseStudyVideos.length > 0) {
          setCaseStudyVideos(data.caseStudyVideos);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/admin/startup-guidance/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          introVideo,
          caseStudyVideos
        })
      });

      if (!res.ok) throw new Error('Failed to save settings');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCaseStudyUrlChange = (id, newUrl) => {
    setCaseStudyVideos(prev => prev.map(c => c.id === id ? { ...c, videoUrl: newUrl } : c));
  };

  const introEmbedUrl = getEmbedUrl(introVideo.videoUrl);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2>Loading Start-up Guidance Settings...</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Start-up Guidance &amp; Video Manager</h1>
          <p className={styles.subtitle}>
            Manage introductory mentoring videos and founder case study links. If no video is provided, the website automatically displays an attractive &ldquo;Coming Soon&rdquo; card.
          </p>
        </div>
        <div className={styles.topActions}>
          <Link href="/startup-guidance" target="_blank" className={styles.btnSecondary}>
            View Live Page &nearr;
          </Link>
          <Link href="/admin/appointments" className={styles.btnSecondary}>
            Appointments Queue &rarr;
          </Link>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={saving} 
            className={styles.btnPrimary}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          background: '#DCFCE7',
          border: '1.5px solid #86EFAC',
          color: '#166534',
          padding: '0.9rem 1.25rem',
          borderRadius: '10px',
          fontWeight: 700,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✓</span> Start-up Guidance settings updated successfully! Changes are live on the website.
        </div>
      )}

      {error && (
        <div style={{
          background: '#FEE2E2',
          border: '1.5px solid #FCA5A5',
          color: '#991B1B',
          padding: '0.9rem 1.25rem',
          borderRadius: '10px',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          Error: {error}
        </div>
      )}

      {/* 1. INTRODUCTORY MENTORING VIDEO */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span>🎬</span> Main Introduction Video (Mentor Presentation)
          </h2>
          {introVideo.videoUrl.trim() ? (
            <span className={styles.badgeActive}>🟢 Live Video Active</span>
          ) : (
            <span className={styles.badgeComingSoon}>⏳ Coming Soon Mode Active</span>
          )}
        </div>

        <div className={styles.grid2}>
          {/* Left: Input Fields */}
          <div>
            <div className={styles.formGroup}>
              <label htmlFor="introVideoUrl">
                Video URL (YouTube Watch / Share / Shorts or MP4)
              </label>
              <input
                id="introVideoUrl"
                type="text"
                placeholder="https://www.youtube.com/watch?v=... (Leave blank for Coming Soon)"
                value={introVideo.videoUrl}
                onChange={(e) => setIntroVideo({ ...introVideo, videoUrl: e.target.value })}
                className={styles.inputField}
              />
              <span className={styles.hint}>
                💡 <strong>Tip:</strong> If you don&apos;t have a video yet, leave this field completely blank. The public website will automatically render the &ldquo;Coming Soon&rdquo; card.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label htmlFor="introVideoTitle">Display Title</label>
                <input
                  id="introVideoTitle"
                  type="text"
                  value={introVideo.title}
                  onChange={(e) => setIntroVideo({ ...introVideo, title: e.target.value })}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="introVideoDuration">Duration / Subtitle</label>
                <input
                  id="introVideoDuration"
                  type="text"
                  value={introVideo.duration}
                  onChange={(e) => setIntroVideo({ ...introVideo, duration: e.target.value })}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="introThumbnailUrl">Custom Thumbnail Image URL (Optional)</label>
              <input
                id="introThumbnailUrl"
                type="text"
                value={introVideo.thumbnailUrl}
                onChange={(e) => setIntroVideo({ ...introVideo, thumbnailUrl: e.target.value })}
                className={styles.inputField}
                placeholder="/images/image1.png or external image URL"
              />
            </div>

            {introVideo.videoUrl.trim() && (
              <button
                type="button"
                onClick={() => setIntroVideo({ ...introVideo, videoUrl: '' })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '0.25rem'
                }}
              >
                &times; Clear Video URL (Switch back to Coming Soon)
              </button>
            )}
          </div>

          {/* Right: Real-time Live Preview */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
              Real-Time Visual Preview
            </label>
            <div className={styles.previewBox}>
              {introEmbedUrl ? (
                <iframe
                  src={introEmbedUrl}
                  title="Intro Video Preview"
                  className={styles.previewIframe}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className={styles.comingSoonPreview}>
                  <div className={styles.comingSoonIcon}>⏳</div>
                  <div className={styles.comingSoonHeading}>Introductory Video Coming Soon</div>
                  <p className={styles.comingSoonDesc}>
                    This placeholder will automatically appear on the live website until you enter a YouTube or video URL.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CASE STUDY TESTIMONIAL VIDEOS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span>👥</span> Founder Case Study Videos (3 Journeys)
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Add founder interviews or leave blank for Coming Soon
          </span>
        </div>

        <div className={styles.caseStudyGrid}>
          {caseStudyVideos.map((c) => {
            const hasVideo = Boolean(c.videoUrl && c.videoUrl.trim());
            const embedUrl = getEmbedUrl(c.videoUrl);

            return (
              <div key={c.id} className={styles.caseStudyCard}>
                <div className={styles.caseStudyHeader}>
                  <div>
                    <div className={styles.caseStudyName}>{c.name}</div>
                    <div className={styles.caseStudySector}>{c.sector}</div>
                  </div>
                  {hasVideo ? (
                    <span className={styles.badgeActive} style={{ fontSize: '0.7rem' }}>🟢 Video Added</span>
                  ) : (
                    <span className={styles.badgeComingSoon} style={{ fontSize: '0.7rem' }}>⏳ Coming Soon</span>
                  )}
                </div>

                <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem' }}>Video URL (YouTube or MP4)</label>
                  <input
                    type="text"
                    placeholder="https://youtu.be/... (or leave blank)"
                    value={c.videoUrl || ''}
                    onChange={(e) => handleCaseStudyUrlChange(c.id, e.target.value)}
                    className={styles.inputField}
                    style={{ fontSize: '0.85rem', padding: '0.55rem 0.75rem' }}
                  />
                </div>

                <div style={{ marginTop: '0.65rem' }}>
                  {hasVideo ? (
                    <div style={{
                      background: '#0F172A',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      aspectRatio: '16 / 9'
                    }}>
                      <iframe
                        src={embedUrl}
                        title={c.videoTitle}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div style={{
                      background: '#E2E8F0',
                      borderRadius: '8px',
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      color: '#475569'
                    }}>
                      <div style={{ fontSize: '1.3rem' }}>⏳</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginTop: '0.2rem' }}>
                        Video Coming Soon
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Shows case study notes on live site
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button Action Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <Link href="/admin/appointments" className={styles.btnSecondary}>
          Cancel
        </Link>
        <button 
          type="button" 
          onClick={handleSave} 
          disabled={saving} 
          className={styles.btnPrimary}
          style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
        >
          {saving ? 'Saving Settings...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
