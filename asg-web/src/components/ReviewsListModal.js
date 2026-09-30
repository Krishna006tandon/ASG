"use client";

import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { STATIC_REVIEWS, getStaticReviewStats } from '@/lib/staticReviews';

export default function ReviewsListModal({
  isOpen,
  onClose,
  item = {}, // { itemType, itemId, itemTitle }
  onOpenWriteReview = null,
  isVerifiedUser = false
}) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0, ratingBreakdown: {} });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    if (!isOpen || !item.itemType) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        let url = `/api/reviews?itemType=${item.itemType}`;
        if (item.itemId) {
          url += `&itemId=${item.itemId}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
            setStats(data.stats);
          } else {
            // Use hardcoded fallback
            const hardcoded = STATIC_REVIEWS.filter(r => r.itemType === item.itemType);
            setReviews(hardcoded);
            setStats(getStaticReviewStats(item.itemType));
          }
        } else {
          const hardcoded = STATIC_REVIEWS.filter(r => r.itemType === item.itemType);
          setReviews(hardcoded);
          setStats(getStaticReviewStats(item.itemType));
        }
      } catch (err) {
        const hardcoded = STATIC_REVIEWS.filter(r => r.itemType === item.itemType);
        setReviews(hardcoded);
        setStats(getStaticReviewStats(item.itemType));
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, item.itemType, item.itemId]);

  if (!isOpen) return null;

  const currentReviews = reviews.length > 0 
    ? reviews 
    : STATIC_REVIEWS.filter(r => r.itemType === item.itemType);
  const currentStats = stats.totalReviews > 0 
    ? stats 
    : getStaticReviewStats(item.itemType);

  const filteredReviews = filterRating === 'all'
    ? currentReviews
    : currentReviews.filter(r => Math.round(r.rating) === parseInt(filterRating, 10));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9998,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)'
        }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#7942B5',
              display: 'block',
              marginBottom: '0.2rem'
            }}>
              Customer Ratings & Reviews
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '800' }}>
              {item.itemTitle || 'Reviews'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6B7280',
              lineHeight: 1,
              padding: '0.25rem'
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
          {/* Summary Card */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center',
            padding: '1.25rem',
            background: '#F9FAFB',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#111827', lineHeight: 1 }}>
                {currentStats.averageRating > 0 ? currentStats.averageRating.toFixed(1) : '5.0'}
              </div>
              <div style={{ margin: '0.4rem 0' }}>
                <StarRating rating={currentStats.averageRating || 5} readOnly={true} size={18} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Based on {currentStats.totalReviews} {currentStats.totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Bars */}
            <div style={{ flexGrow: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = currentStats.ratingBreakdown?.[stars] || 0;
                const percentage = currentStats.totalReviews > 0 ? (count / currentStats.totalReviews) * 100 : (stars === 5 ? 100 : 0);
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#4B5563' }}>
                    <span style={{ width: '45px', textAlign: 'right' }}>{stars} ★</span>
                    <div style={{ flexGrow: 1, height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#F59E0B', borderRadius: '4px' }}></div>
                    </div>
                    <span style={{ width: '30px', color: '#9CA3AF' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Write Review CTA */}
            {onOpenWriteReview && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #E5E7EB' }}>
                <button
                  onClick={onOpenWriteReview}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: 'linear-gradient(135deg, #7942B5 0%, #4F46E5 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(121, 66, 181, 0.25)'
                  }}
                >
                  <span>★</span> Write a Review
                </button>
              </div>
            )}
          </div>

          {/* Filter Pills */}
          {currentReviews.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterRating('all')}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  border: filterRating === 'all' ? '1px solid #7942B5' : '1px solid #D1D5DB',
                  background: filterRating === 'all' ? '#F3E8FF' : '#ffffff',
                  color: filterRating === 'all' ? '#6B21A8' : '#4B5563',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                All ({currentReviews.length})
              </button>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = currentStats.ratingBreakdown?.[stars] || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={stars}
                    onClick={() => setFilterRating(stars.toString())}
                    style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      border: filterRating === stars.toString() ? '1px solid #7942B5' : '1px solid #D1D5DB',
                      background: filterRating === stars.toString() ? '#F3E8FF' : '#ffffff',
                      color: filterRating === stars.toString() ? '#6B21A8' : '#4B5563',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {stars} ★ ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#F9FAFB', borderRadius: '12px', color: '#6B7280' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>No reviews yet</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Verified buyers and attendees will see their reviews published here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    padding: '1.25rem',
                    background: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>
                          {rev.userName}
                        </span>
                        {rev.source && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: rev.source.includes('Amazon') ? '#FEF3C7' : '#EFF6FF',
                            color: rev.source.includes('Amazon') ? '#B45309' : '#1D4ED8'
                          }}>
                            {rev.source}
                          </span>
                        )}
                        {rev.verified && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: '#ECFDF5',
                            color: '#059669',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                        Reviewed {rev.date ? `on ${rev.date}` : `on ${new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </div>
                    </div>
                    <StarRating rating={rev.rating} readOnly={true} size={16} />
                  </div>
                  <p style={{ margin: 0, color: '#374151', fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
