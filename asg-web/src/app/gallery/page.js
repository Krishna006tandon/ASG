"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './gallery.module.css';
import { getImageUrl } from '@/lib/imageHelper';

// Fallback initial workshops in case DB is initially waiting for first admin entries
const FALLBACK_WORKSHOPS = [
  {
    _id: "demo-1",
    title: "HAZOP Study Methodologies & Process Safety Leadership",
    date: new Date("2024-03-15"),
    location: "Sadara Chemical Company (JV Aramco & Dow), Jubail",
    category: "Safety & HAZOP",
    attendeesCount: "85+ Process Engineers",
    description: "Leading comprehensive Hazard and Operability (HAZOP) study sessions. Demonstrating a strong commitment to process safety management by training teams on critical safety documents, P&IDs, and risk assessment procedures.",
    highlights: [
      "Live P&ID node-by-node safety risk evaluation",
      "Process deviations, cause-consequence analysis, and LOPA",
      "Industry safety compliance and mitigation layers",
      "Emergency mitigation protocols in hydrocarbon plants"
    ],
    images: [
      { url: "/images/image1.png", caption: "Avinash Gore guiding safety engineers through plant P&ID schematics" },
      { url: "/images/image4.png", caption: "Leadership recognition at Sadara Chemical Company" }
    ],
    featured: true
  },
  {
    _id: "demo-2",
    title: "Jubail 2nd Energy Management Conference & Sustainability",
    date: new Date("2023-11-20"),
    location: "Jubail Industrial City, Saudi Arabia",
    category: "Engineering & Industry",
    attendeesCount: "250+ Industry Delegates",
    description: "Honored on stage with a prestigious industry award at the Jubail 2nd Energy Management Conference. Delivering insights on driving operational sustainability and mega-scale process optimization.",
    highlights: [
      "Keynote address on decarbonization & energy efficiency",
      "Utility system optimization case studies",
      "Award of Excellence conferred by industry leaders"
    ],
    images: [
      { url: "/images/image3.jpg", caption: "Honored with prestigious award at Jubail 2nd Energy Management Conference" },
      { url: "/images/image 2.jpg", caption: "Keynote presentation on stage at Jubail Energy Summit" }
    ],
    featured: true
  },
  {
    _id: "demo-3",
    title: "Transforming Anxiety into Focus: Student Phobia Masterclass",
    date: new Date("2024-08-10"),
    location: "Mumbai, India",
    category: "Youth Empowerment",
    attendeesCount: "350+ Students & Parents",
    description: "A high-impact, practical workshop based on the acclaimed book 'Come on... You can do it!'. Transforming exam fear into unstoppable self-confidence, goal clarity, and scientific study habits.",
    highlights: [
      "Scientific study techniques to dissolve exam phobia",
      "Building confidence and handling real-world pressure",
      "Actionable psychology to unlock hidden potential",
      "Live interactive Q&A and personalized mentorship"
    ],
    images: [
      { url: "/images/image5.jpg", caption: "Avinash Gore delivering inspirational keynote session" }
    ],
    featured: false
  }
];

export default function GalleryPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal / Lightbox State
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const res = await fetch('/api/past-workshops');
      if (res.ok) {
        const data = await res.json();
        if (data.workshops && data.workshops.length > 0) {
          setWorkshops(data.workshops);
        } else {
          setWorkshops(FALLBACK_WORKSHOPS);
        }
      } else {
        setWorkshops(FALLBACK_WORKSHOPS);
      }
    } catch (err) {
      console.warn("Using fallback workshops data:", err);
      setWorkshops(FALLBACK_WORKSHOPS);
    } finally {
      setLoading(false);
    }
  };

  // Categories list
  const categories = ['All', ...Array.from(new Set(workshops.map(w => w.category).filter(Boolean)))];

  const filteredWorkshops = selectedCategory === 'All'
    ? workshops
    : workshops.filter(w => w.category?.toLowerCase() === selectedCategory.toLowerCase());

  // Modal open handler
  const handleOpenWorkshop = (workshop, imgIndex = 0) => {
    setActiveWorkshop(workshop);
    setCurrentImageIndex(imgIndex);
  };

  const handleCloseModal = () => {
    setActiveWorkshop(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!activeWorkshop || !activeWorkshop.images || activeWorkshop.images.length <= 1) return;
    setCurrentImageIndex(prev => (prev + 1) % activeWorkshop.images.length);
  }, [activeWorkshop]);

  const handlePrevImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!activeWorkshop || !activeWorkshop.images || activeWorkshop.images.length <= 1) return;
    setCurrentImageIndex(prev => (prev - 1 + activeWorkshop.images.length) % activeWorkshop.images.length);
  }, [activeWorkshop]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeWorkshop) return;
      if (e.key === 'Escape') handleCloseModal();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWorkshop, handleNextImage, handlePrevImage]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (activeWorkshop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeWorkshop]);

  return (
    <main className={styles.main}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.badge}>Moments &amp; Impact</div>
        <h1>
          Past Workshops &amp; <span className={styles.gradientText}>Event Gallery</span>
        </h1>
        <p>
          Relive transformative masterclasses, process safety leadership summits, and youth empowerment workshops led by Avinash Gore across the globe.
        </p>

        {/* Quick Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>25+</span>
            <span className={styles.statLabel}>Years of Experience</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50+</span>
            <span className={styles.statLabel}>Workshops Conducted</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>10,000+</span>
            <span className={styles.statLabel}>Professionals &amp; Students</span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      {categories.length > 1 && (
        <section className={styles.filtersSection}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.filterBtn} ${selectedCategory === cat ? styles.activeFilter : ''}`}
            >
              {cat}
            </button>
          ))}
        </section>
      )}

      {/* Workshops Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
          Loading workshops gallery...
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3rem' }}>📷</div>
          <h3>No workshops found</h3>
          <p>No past workshops are currently available under this category.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredWorkshops.map(workshop => {
            const hasImages = workshop.images && workshop.images.length > 0;
            const coverImage = hasImages ? workshop.images[0].url : null;
            const eventDate = new Date(workshop.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <article
                key={workshop._id}
                className={styles.card}
                onClick={() => handleOpenWorkshop(workshop, 0)}
              >
                <div className={styles.imageWrap}>
                  {coverImage ? (
                    <img
                      src={getImageUrl(coverImage)}
                      alt={workshop.title}
                      className={styles.cardImg}
                    />
                  ) : (
                    <div className={styles.noImgCover}>🎓</div>
                  )}

                  {hasImages && (
                    <span className={styles.photoBadge}>
                      📷 {workshop.images.length} {workshop.images.length === 1 ? 'photo' : 'photos'}
                    </span>
                  )}

                  {workshop.featured && (
                    <span className={styles.featuredBadge}>★ Featured</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.metaRow}>
                    <span className={styles.category}>{workshop.category || 'Workshop'}</span>
                    <span className={styles.date}>{eventDate}</span>
                  </div>

                  <h2 className={styles.cardTitle}>{workshop.title}</h2>

                  <div className={styles.locationRow}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{workshop.location}</span>
                  </div>

                  <p className={styles.desc}>{workshop.description}</p>

                  {/* Thumbnail Strip */}
                  {hasImages && workshop.images.length > 1 && (
                    <div className={styles.thumbnailStrip} onClick={e => e.stopPropagation()}>
                      {workshop.images.slice(0, 4).map((img, i) => (
                        <img
                          key={i}
                          src={getImageUrl(img.url)}
                          alt={img.caption || `Photo ${i + 1}`}
                          className={styles.stripThumb}
                          onClick={() => handleOpenWorkshop(workshop, i)}
                        />
                      ))}
                      {workshop.images.length > 4 && (
                        <div
                          className={styles.moreThumbs}
                          onClick={() => handleOpenWorkshop(workshop, 4)}
                        >
                          +{workshop.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    {workshop.attendeesCount ? (
                      <span className={styles.attendees}>
                        👥 {workshop.attendeesCount}
                      </span>
                    ) : <span></span>}

                    <div className={styles.viewBtn}>
                      <span>View Gallery &amp; Recap</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CTA section to upcoming workshops */}
      <section style={{
        marginTop: '6rem',
        padding: '3.5rem 2rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(121, 66, 181, 0.08) 0%, rgba(79, 70, 229, 0.08) 100%)',
        textAlign: 'center',
        border: '1px solid rgba(121, 66, 181, 0.15)'
      }}>
        <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.75rem' }}>
          Ready to attend an upcoming session?
        </h3>
        <p style={{ color: '#4B5563', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
          Explore our upcoming live workshops, interactive seminars, and mentorship masterclasses.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/webinars" className="btn-primary" style={{ textDecoration: 'none' }}>
            Browse Online Workshops
          </Link>
          <Link href="/seminars" className="btn-accent" style={{ textDecoration: 'none' }}>
            Book In-Person Seminars
          </Link>
        </div>
      </section>

      {/* Lightbox & Workshop Details Modal */}
      {activeWorkshop && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <h2>{activeWorkshop.title}</h2>
                <div className={styles.modalMetaGroup}>
                  <span className={styles.category}>{activeWorkshop.category || 'Workshop'}</span>
                  <span>🗓️ {new Date(activeWorkshop.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>📍 {activeWorkshop.location}</span>
                  {activeWorkshop.attendeesCount && (
                    <span className={styles.attendees}>👥 {activeWorkshop.attendeesCount}</span>
                  )}
                </div>
              </div>
              <button
                className={styles.closeModalBtn}
                onClick={handleCloseModal}
                title="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Lightbox Image Stage (if images exist) */}
            {activeWorkshop.images && activeWorkshop.images.length > 0 && (
              <div className={styles.lightboxSection}>
                <div className={styles.mainStage}>
                  <img
                    src={getImageUrl(activeWorkshop.images[currentImageIndex]?.url)}
                    alt={activeWorkshop.images[currentImageIndex]?.caption || activeWorkshop.title}
                    className={styles.stageImage}
                  />

                  {activeWorkshop.images.length > 1 && (
                    <>
                      <button
                        className={`${styles.navArrow} ${styles.prevArrow}`}
                        onClick={handlePrevImage}
                        title="Previous photo (Left arrow)"
                      >
                        &#8249;
                      </button>
                      <button
                        className={`${styles.navArrow} ${styles.nextArrow}`}
                        onClick={handleNextImage}
                        title="Next photo (Right arrow)"
                      >
                        &#8250;
                      </button>
                    </>
                  )}
                </div>

                <div className={styles.captionBar}>
                  <span className={styles.captionText}>
                    {activeWorkshop.images[currentImageIndex]?.caption || ''}
                  </span>
                  <span className={styles.photoCounter}>
                    Photo {currentImageIndex + 1} of {activeWorkshop.images.length}
                  </span>
                </div>

                {/* Thumbnails row */}
                {activeWorkshop.images.length > 1 && (
                  <div className={styles.thumbsTrack}>
                    {activeWorkshop.images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`${styles.thumbBtn} ${currentImageIndex === idx ? styles.activeThumb : ''}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <img src={getImageUrl(img.url)} alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Workshop Details & Highlights */}
            <div className={styles.modalBody}>
              <div className={styles.modalDesc}>
                <h3>Workshop Overview &amp; Recap</h3>
                <p>{activeWorkshop.description}</p>
              </div>

              {activeWorkshop.highlights && activeWorkshop.highlights.length > 0 && (
                <div className={styles.modalHighlights}>
                  <h3>Key Highlights &amp; Covered Topics</h3>
                  <ul className={styles.highlightsList}>
                    {activeWorkshop.highlights.map((highlight, index) => (
                      <li key={index} className={styles.highlightItem}>
                        <span className={styles.checkIcon}>✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
