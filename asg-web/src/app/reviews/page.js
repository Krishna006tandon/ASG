"use client";

import { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating';
import ReviewModal from '@/components/ReviewModal';
import { STATIC_REVIEWS, getStaticReviewStats } from '@/lib/staticReviews';

export default function ReviewsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User verification & review modal
  const [canReviewPlatform, setCanReviewPlatform] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dbReviews, setDbReviews] = useState([]);

  const checkUserStatus = async () => {
    const token = localStorage.getItem('asg_token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const res = await fetch('/api/user/reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.verifiedItems?.canReviewPlatform) {
            setCanReviewPlatform(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchDbReviews = async () => {
    try {
      const res = await fetch('/api/reviews?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setDbReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error('Failed to load DB reviews:', err);
    }
  };

  useEffect(() => {
    checkUserStatus();
    fetchDbReviews();
  }, []);

  // Merge real verified reviews from database with curated static reviews
  const allCombinedReviews = [
    ...dbReviews,
    ...STATIC_REVIEWS.filter(sr => !dbReviews.some(dr => (dr._id === sr.id) || (dr.comment === sr.comment)))
  ];

  const categoryReviews = activeCategory === 'all'
    ? allCombinedReviews
    : allCombinedReviews.filter(r => r.itemType === activeCategory);

  // Dynamic statistics calculated from combined reviews
  const categoryTotalReviews = categoryReviews.length;
  const categoryAvgRating = categoryTotalReviews > 0
    ? Number((categoryReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / categoryTotalReviews).toFixed(1))
    : 5.0;

  const categoryRatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  categoryReviews.forEach(r => {
    const stars = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    categoryRatingBreakdown[stars] = (categoryRatingBreakdown[stars] || 0) + 1;
  });

  const stats = {
    totalReviews: categoryTotalReviews,
    averageRating: categoryAvgRating,
    ratingBreakdown: categoryRatingBreakdown
  };

  const filteredReviews = categoryReviews.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.userName && r.userName.toLowerCase().includes(q)) ||
      (r.itemTitle && r.itemTitle.toLowerCase().includes(q)) ||
      (r.comment && r.comment.toLowerCase().includes(q)) ||
      (r.source && r.source.toLowerCase().includes(q))
    );
  });

  const typePillLabels = {
    book: '📖 Book Review',
    webinar: '💻 Workshop',
    seminar: '📍 Seminar',
    platform: '🌟 Mentorship'
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      alert("Please log in to submit a review.");
      window.location.href = '/login';
      return;
    }
    if (!canReviewPlatform) {
      alert("Reviews are reserved for verified readers and attendees. You can write a review once you have purchased a book or registered for a workshop!");
      return;
    }
    setReviewModalOpen(true);
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
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
          <span>★</span> Verified Feedback & Community Voice
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.025em', margin: '0 0 1rem 0' }}>
          Student & Reader Reviews
        </h1>
        <p style={{ color: '#6B7280', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Genuine, verified customer reviews from readers of "Come on... You can do it!" on Amazon & BookGanga, as well as workshop & seminar attendees.
        </p>
      </div>

      {/* Ratings Summary Card */}
      <div className="glass-card" style={{
        padding: '2rem',
        marginBottom: '2.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
        borderRadius: '24px',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        background: '#ffffff'
      }}>
        {/* Score Column */}
        <div style={{ textAlign: 'center', minWidth: '160px' }}>
          <div style={{ fontSize: '3.75rem', fontWeight: '900', color: '#111827', lineHeight: 1 }}>
            {stats.averageRating.toFixed(1)}
          </div>
          <div style={{ margin: '0.5rem 0' }}>
            <StarRating rating={stats.averageRating} readOnly={true} size={22} />
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: '500' }}>
            Overall Rating based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Breakdown Bar Chart */}
        <div style={{ flexGrow: 1, minWidth: '260px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.ratingBreakdown?.[stars] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : (stars === 5 ? 100 : 0);
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#4B5563' }}>
                <span style={{ width: '40px', textAlign: 'right', fontWeight: '600' }}>{stars} ★</span>
                <div style={{ flexGrow: 1, height: '10px', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: '#F59E0B', borderRadius: '6px' }}></div>
                </div>
                <span style={{ width: '35px', color: '#9CA3AF', fontSize: '0.8rem' }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div style={{ textAlign: 'center', minWidth: '200px' }}>
          <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '0.75rem' }}>
            Attended a session or read the book?
          </div>
          <button
            onClick={handleWriteReviewClick}
            className="btn-accent"
            style={{
              padding: '0.75rem 1.75rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #7942B5 0%, #4F46E5 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 15px rgba(121, 66, 181, 0.3)'
            }}
          >
            <span>✍️</span> Share Your Review
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'book', label: 'Books (Amazon & BookGanga)' },
            { id: 'webinar', label: 'Workshops' },
            { id: 'seminar', label: 'Seminars' },
            { id: 'platform', label: 'Mentorship' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '30px',
                border: activeCategory === tab.id ? '2px solid #7942B5' : '1px solid #D1D5DB',
                background: activeCategory === tab.id ? '#7942B5' : '#ffffff',
                color: activeCategory === tab.id ? '#ffffff' : '#374151',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeCategory === tab.id ? '0 4px 12px rgba(121, 66, 181, 0.2)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 1rem 0.5rem 2.2rem',
              borderRadius: '9999px',
              border: '1px solid #D1D5DB',
              fontSize: '0.85rem',
              outline: 'none',
              width: '240px'
            }}
          />
          <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.85rem' }}>
            🔍
          </span>
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          color: '#6B7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>No reviews found</h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            {searchQuery ? 'Try adjusting your search terms.' : 'Be among the first verified attendees to share your feedback!'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {filteredReviews.map((rev) => (
            <div
              key={rev._id || rev.id}
              className="glass-card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        item={{
          itemType: 'platform',
          itemId: null,
          itemTitle: 'Avinash Gore Platform & Mentorship'
        }}
        onSuccess={() => {
          fetchDbReviews();
          checkUserStatus();
        }}
      />
    </main>
  );
}
