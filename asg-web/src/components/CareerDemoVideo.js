"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './CareerDemoVideo.module.css';

const TOTAL_DURATION = 42; // 42 seconds total demo length

export default function CareerDemoVideo({ videoUrl, onCtaClick }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  // Web Audio subtle ambient chord generator for demo experience
  const playAmbientNote = (freq, duration = 1.2) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          const next = prev + 1;
          // Scene transition audio cues
          if (next === 1 || next === 9 || next === 19 || next === 29 || next === 38) {
            playAmbientNote(440);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isMuted]);

  const togglePlay = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const target = Math.max(0, Math.min(TOTAL_DURATION, Math.round(pos * TOTAL_DURATION)));
    setCurrentTime(target);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      playAmbientNote(523.25); // C5 cheerful sound
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Check if external video provided
  if (videoUrl && videoUrl.trim()) {
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    let embedSrc = videoUrl;
    if (isYouTube) {
      const vidIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      const vidId = vidIdMatch ? vidIdMatch[1] : '';
      embedSrc = `https://www.youtube.com/embed/${vidId}?autoplay=0&rel=0`;
    }

    return (
      <div className={styles.videoWrapper} ref={containerRef}>
        {isYouTube ? (
          <iframe
            src={embedSrc}
            title="Avinash Gore Career Guidance"
            className={styles.embedFrame}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={videoUrl} controls className={styles.embedFrame} />
        )}
      </div>
    );
  }

  // Current scene determination
  // Scene 1: 0 - 8s (Intro)
  // Scene 2: 9 - 18s (The Dilemma: Stream vs True Work)
  // Scene 3: 19 - 28s (Bhagavad Gita 3.35 Swadharma)
  // Scene 4: 29 - 37s (10 Archetypes preview)
  // Scene 5: 38 - 42s (CTA: Take Assessment)
  const currentScene = 
    currentTime < 9 ? 1 :
    currentTime < 19 ? 2 :
    currentTime < 29 ? 3 :
    currentTime < 38 ? 4 : 5;

  const currentSubtitle = 
    currentScene === 1 ? "Welcome to Career Guidance by Avinash Gore (Author of 'Come On... You Can Do It!')" :
    currentScene === 2 ? "Are you choosing a career stream based on friends, parents, or salary hype?" :
    currentScene === 3 ? "Gita 3.35: 'Better is one's own natural duty (Swadharma) than the imitated path of another.'" :
    currentScene === 4 ? "Discover which of the 10 core work archetypes matches your natural mind and energy." :
    "Take the 30-Question Assessment today and get your comprehensive Career Swadharma report!";

  return (
    <div className={styles.videoWrapper} ref={containerRef}>
      <div className={styles.playerStage} onClick={togglePlay}>
        <div className={styles.ambientOrb1} />
        <div className={styles.ambientOrb2} />

        {/* Scene 1: Intro */}
        {currentScene === 1 && (
          <div className={styles.sceneContainer}>
            <img src="/images/image5.jpg" alt="Avinash Gore" className={styles.speakerAvatar} />
            <div className={styles.badgePill}>
              <span>✨</span> Perpetual Solutions Presents
            </div>
            <h3 className={styles.mainTitle}>
              Discover Your <span>Swadharma</span>
            </h3>
            <p className={styles.subtitle}>
              Choosing a career is not just choosing a degree. It is finding the work you are naturally born to do.
            </p>
          </div>
        )}

        {/* Scene 2: The Core Problem */}
        {currentScene === 2 && (
          <div className={styles.sceneContainer}>
            <div className={styles.badgePill} style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#FCA5A5' }}>
              <span>⚠️</span> The Great Career Trap
            </div>
            <h3 className={styles.mainTitle}>
              Degree Does Not Equal <span>Fulfillment</span>
            </h3>
            <p className={styles.subtitle}>
              Thousands study hard, get a high-paying job, and still feel stressed or frustrated. Why? Because the work nature clashes with their core personality.
            </p>
          </div>
        )}

        {/* Scene 3: Bhagavad Gita */}
        {currentScene === 3 && (
          <div className={styles.sceneContainer}>
            <div className={styles.badgePill}>
              <span>🕉️</span> Shrimad Bhagavad Gita 3.35
            </div>
            <div className={styles.shlokaBox}>
              <div className={styles.sanskritText}>
                श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।
              </div>
              <div className={styles.sanskritMeaning}>
                &ldquo;It is better to follow one's own appropriate path, even imperfectly, than to imitate another's path merely because it appears successful.&rdquo;
              </div>
            </div>
            <p className={styles.subtitle} style={{ fontSize: '0.9rem' }}>
              Your friend&apos;s career may be great for them, but is it right for you?
            </p>
          </div>
        )}

        {/* Scene 4: 10 Archetypes */}
        {currentScene === 4 && (
          <div className={styles.sceneContainer}>
            <div className={styles.badgePill}>
              <span>🧭</span> 10 Work Dimensions
            </div>
            <h3 className={styles.mainTitle} style={{ fontSize: '1.6rem' }}>
              What Is Your <span>Professional DNA?</span>
            </h3>
            <div className={styles.archetypePills}>
              <span className={styles.archetypeTag}>🤝 Sales & Growth</span>
              <span className={styles.archetypeTag}>🔬 Research & Analysis</span>
              <span className={styles.archetypeTag}>💻 Tech & Systems</span>
              <span className={styles.archetypeTag}>🎨 Creative & Media</span>
              <span className={styles.archetypeTag}>👑 Leadership & Strategy</span>
              <span className={styles.archetypeTag}>⚙️ Operations</span>
              <span className={styles.archetypeTag}>📊 Finance & Data</span>
              <span className={styles.archetypeTag}>📚 Teaching & Mentorship</span>
            </div>
          </div>
        )}

        {/* Scene 5: Call to Action */}
        {currentScene === 5 && (
          <div className={styles.sceneContainer}>
            <div className={styles.badgePill} style={{ color: '#FCD34D' }}>
              <span>🚀</span> Ready For Clarity?
            </div>
            <h3 className={styles.mainTitle}>
              Know Yourself. <span>Take The Test.</span>
            </h3>
            <p className={styles.subtitle}>
              Answer 30 quick scenario questions to unlock your Top 3 Career Domains & Download your Official Career Roadmap.
            </p>
            {onCtaClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCtaClick();
                }}
                style={{
                  background: 'linear-gradient(135deg, #7942b5 0%, #F59E0B 100%)',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Unlock Assessment Now</span> &rarr;
              </button>
            )}
          </div>
        )}

        {/* Play Overlay if paused */}
        {!isPlaying && (
          <div className={styles.playOverlay} title="Play Video Demo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        )}

        {/* Dynamic Subtitle Bar */}
        <div className={styles.subtitleBar}>
          {currentSubtitle}
        </div>
      </div>

      {/* Video Controls Bar */}
      <div className={styles.controlsBar}>
        <button className={styles.controlBtn} onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>

        <button className={styles.controlBtn} onClick={toggleMute} title={isMuted ? "Unmute Audio" : "Mute Audio"}>
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>

        <div className={styles.timeDisplay}>
          {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
        </div>

        <div className={styles.scrubberWrapper} onClick={handleScrub}>
          <div className={styles.scrubberTrack}>
            <div
              className={styles.scrubberProgress}
              style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
            />
          </div>
        </div>

        <span className={styles.liveDemoBadge}>
          Demo Video
        </span>

        <button className={styles.controlBtn} onClick={toggleFullscreen} title="Toggle Fullscreen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
