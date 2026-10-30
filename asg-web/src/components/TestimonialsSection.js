"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StarRating from './StarRating';
import { STATIC_REVIEWS } from '@/lib/staticReviews';
import styles from './TestimonialsSection.module.css';

export default function TestimonialsSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dbReviews, setDbReviews] = useState([]);

  useEffect(() => {
    const fetchDbReviews = async () => {
      try {
        const res = await fetch('/api/reviews?limit=30');
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            setDbReviews(data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to load DB reviews in testimonials:', err);
      }
    };
    fetchDbReviews();
  }, []);

  const allReviewsCombined = [
    ...dbReviews,
    ...STATIC_REVIEWS.filter(sr => !dbReviews.some(dr => (dr._id === sr.id) || (dr.comment === sr.comment)))
  ];

  const filtered = activeFilter === 'all'
    ? allReviewsCombined
    : allReviewsCombined.filter(r => r.itemType === activeFilter);

  const typePillLabels = {
    book: '📖 Book Review',
    webinar: '💻 Workshop',
    seminar: '📍 Seminar',
    platform: '🌟 Mentorship'
  };

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.header}>
        <div className={styles.pillBadge}>
          <span>★</span> Verified Student & Reader Testimonials
        </div>
        <h2 className={styles.title}>
          What Readers & Attendees Say
        </h2>
        <p className={styles.subtitle}>
          Real feedback from readers of &quot;Come on... You can do it!&quot; on Amazon & BookGanga, and attendees of workshops & seminars.
        </p>

        {/* Filter Pills */}
        <div className={styles.filterBar}>
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'book', label: 'Books (Amazon & BookGanga)' },
            { id: 'webinar', label: 'Workshops' },
            { id: 'seminar', label: 'Seminars' },
            { id: 'platform', label: 'Mentorship' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={styles.filterBtn}
              style={{
                border: activeFilter === tab.id ? '2px solid #7942B5' : '1px solid #E5E7EB',
                background: activeFilter === tab.id ? '#7942B5' : '#ffffff',
                color: activeFilter === tab.id ? '#ffffff' : '#4B5563',
                boxShadow: activeFilter === tab.id ? '0 4px 12px rgba(121, 66, 181, 0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Reviews */}
      <div className={styles.grid}>
        {filtered.map((rev) => (
          <div
            key={rev._id || rev.id}
            className={`glass-card ${styles.reviewCard}`}
          >
            <div>
              <div className={styles.cardHeader}>
                <div className={styles.tagGroup}>
                  <span className={styles.typePill}>
                    {typePillLabels[rev.itemType] || rev.itemType}
                  </span>
                  {rev.source && (
                    <span 
                      className={styles.sourcePill}
                      style={{
                        background: rev.source.includes('Amazon') ? '#FEF3C7' : '#EFF6FF',
                        color: rev.source.includes('Amazon') ? '#B45309' : '#1D4ED8'
                      }}
                    >
                      {rev.source}
                    </span>
                  )}
                </div>
                <StarRating rating={rev.rating} readOnly={true} size={16} />
              </div>

              <p className={styles.commentText}>
                {rev.comment}
              </p>
            </div>

            <div className={styles.cardFooter}>
              <div>
                <div className={styles.authorName}>
                  {rev.userName}
                </div>
                <div className={styles.metaInfo}>
                  {rev.itemTitle} • {rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent')}
                </div>
              </div>
              {rev.verified && (
                <span className={styles.verifiedBadge}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA for Verified Attendees/Buyers */}
      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '0 1rem' }}>
        <p style={{ fontSize: '0.95rem', color: '#6B7280', marginBottom: '0.75rem' }}>
          Have you purchased a book or attended a session?
        </p>
        <Link
          href="/dashboard"
          className="btn-accent"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.5rem',
            fontSize: '0.9rem',
            textDecoration: 'none'
          }}
        >
          <span>✍️</span> Add Your Review from Dashboard
        </Link>
      </div>
    </section>
  );
}
