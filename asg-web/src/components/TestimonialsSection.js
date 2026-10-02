"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StarRating from './StarRating';
import { STATIC_REVIEWS } from '@/lib/staticReviews';

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
    <section style={{ margin: '5rem 0', position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 1rem',
          borderRadius: '9999px',
          background: '#F3E8FF',
          color: '#7942B5',
          fontSize: '0.8rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem'
        }}>
          <span>★</span> Verified Student & Reader Testimonials
        </div>
        <h2 style={{ fontSize: '2.5rem', color: '#111827', fontWeight: '900', letterSpacing: '-0.02em', margin: '0 0 0.75rem 0' }}>
          What Readers & Attendees Say
        </h2>
        <p style={{ color: '#6B7280', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
          Real feedback from readers of &quot;Come on... You can do it!&quot; on Amazon & BookGanga, and attendees of workshops & seminars.
        </p>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
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
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '30px',
                border: activeFilter === tab.id ? '2px solid #7942B5' : '1px solid #E5E7EB',
                background: activeFilter === tab.id ? '#7942B5' : '#ffffff',
                color: activeFilter === tab.id ? '#ffffff' : '#4B5563',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeFilter === tab.id ? '0 4px 12px rgba(121, 66, 181, 0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Reviews */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {filtered.map((rev) => (
          <div
            key={rev._id || rev.id}
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '20px',
              border: '1px solid rgba(229, 231, 235, 0.8)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: '#F3E8FF',
                    color: '#6B21A8'
                  }}>
                    {typePillLabels[rev.itemType] || rev.itemType}
                  </span>
                  {rev.source && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: rev.source.includes('Amazon') ? '#FEF3C7' : '#EFF6FF',
                      color: rev.source.includes('Amazon') ? '#B45309' : '#1D4ED8'
                    }}>
                      {rev.source}
                    </span>
                  )}
                </div>
                <StarRating rating={rev.rating} readOnly={true} size={16} />
              </div>

              <p style={{
                color: '#374151',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                marginBottom: '1.25rem',
                whiteSpace: 'pre-line'
              }}>
                {rev.comment}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>
                  {rev.userName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  {rev.itemTitle} • {rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent')}
                </div>
              </div>
              {rev.verified && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: '#059669',
                  background: '#ECFDF5',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA for Verified Attendees/Buyers */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
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
