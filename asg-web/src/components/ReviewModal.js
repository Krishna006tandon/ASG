"use client";

import { useState, useEffect } from 'react';
import StarRating from './StarRating';

export default function ReviewModal({
  isOpen,
  onClose,
  item = {},
  initialReview = null,
  onSuccess = null
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating || 5);
      setComment(initialReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setError(null);
    setSuccessMsg(null);
  }, [initialReview, isOpen, item]);

  if (!isOpen) return null;

  const typeLabels = {
    book: 'Book Review',
    webinar: 'Workshop Review',
    seminar: 'Seminar Review',
    platform: 'Platform Testimonial'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (comment.trim().length < 5) {
      setError('Please share at least a few words (minimum 5 characters).');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('asg_token');
      if (!token) {
        throw new Error('Please log in to submit a review.');
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: item.itemType,
          itemId: item.itemId || null,
          itemTitle: item.itemTitle,
          rating,
          comment: comment.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccessMsg('Thank you! Your review has been published.');
      if (onSuccess) {
        onSuccess(data.review);
      }
      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              {typeLabels[item.itemType] || 'Review'}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#111827', fontWeight: '800' }}>
              {item.itemTitle || 'Write a Review'}
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #6EE7B7',
              color: '#047857',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              ✓ {successMsg}
            </div>
          )}

          {/* Verification Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            color: '#15803D',
            fontWeight: '600',
            marginBottom: '1.25rem'
          }}>
            <span>✓ Verified Reviewer</span>
            <span style={{ color: '#86EFAC' }}>•</span>
            <span style={{ color: '#4B5563', fontWeight: 'normal' }}>Appears with Verified Badge</span>
          </div>

          {/* Rating Picker */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Your Overall Rating
            </label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={32}
              showLabel={true}
            />
          </div>

          {/* Comment Textarea */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Your Detailed Feedback & Experience
            </label>
            <textarea
              required
              rows={4}
              maxLength={1000}
              placeholder="What did you think of the content, key takeaways, and practical application? Share your honest thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
              <span>Minimum 5 characters</span>
              <span>{comment.length} / 1000</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #F3F4F6', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                background: '#ffffff',
                color: '#4B5563',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!successMsg}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #7942B5 0%, #4F46E5 100%)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading || !!successMsg ? 'not-allowed' : 'pointer',
                opacity: loading || !!successMsg ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(121, 66, 181, 0.25)'
              }}
            >
              {loading ? 'Submitting...' : initialReview ? 'Update Review' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
