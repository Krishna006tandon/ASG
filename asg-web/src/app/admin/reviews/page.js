"use client";

import { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    booksCount: 0,
    webinarsCount: 0,
    seminarsCount: 0,
    platformCount: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('asg_token');
      let url = `/api/admin/reviews?itemType=${filterType}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to load reviews');
      }
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete review');
      }

      setReviews(prev => prev.filter(r => r._id !== id));
      setMessage({ type: 'success', text: 'Review deleted successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem 0' }}>
          Customer Reviews & Testimonials Management
        </h1>
        <p style={{ color: '#6B7280', margin: 0 }}>
          Monitor, filter, and moderate verified ratings and feedback submitted across books, workshops, seminars, and mentorship.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${message.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`,
          color: message.type === 'success' ? '#065F46' : '#991B1B'
        }}>
          {message.text}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Total Reviews</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginTop: '0.35rem' }}>{stats.totalCount || 0}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Avg Rating</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#F59E0B', marginTop: '0.35rem' }}>⭐ {stats.avgRating || '0.0'}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Books</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4F46E5', marginTop: '0.35rem' }}>{stats.booksCount || 0}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Workshops</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '0.35rem' }}>{stats.webinarsCount || 0}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Seminars</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#D97706', marginTop: '0.35rem' }}>{stats.seminarsCount || 0}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Mentorship</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#9333EA', marginTop: '0.35rem' }}>{stats.platformCount || 0}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'book', label: 'Books' },
            { id: 'webinar', label: 'Workshops' },
            { id: 'seminar', label: 'Seminars' },
            { id: 'platform', label: 'Platform' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: filterType === tab.id ? '1px solid #7942B5' : '1px solid #D1D5DB',
                background: filterType === tab.id ? '#7942B5' : '#ffffff',
                color: filterType === tab.id ? '#ffffff' : '#374151',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search reviewer or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '0.85rem',
              outline: 'none',
              width: '240px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: '#111827',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Reviews Table / List */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6B7280' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>No reviews found</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No reviews match your selected filter or search criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Reviewer</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Category & Item</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Rating</th>
                  <th style={{ padding: '0.9rem 1.25rem', width: '38%' }}>Feedback Comment</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '700', color: '#111827' }}>{rev.userName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{rev.userEmail}</div>
                      {rev.verified && (
                        <span style={{
                          display: 'inline-block',
                          marginTop: '0.25rem',
                          fontSize: '0.7rem',
                          color: '#059669',
                          background: '#ECFDF5',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          ✓ Verified
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background:
                          rev.itemType === 'book' ? '#EEF2FF' :
                          rev.itemType === 'webinar' ? '#ECFDF5' :
                          rev.itemType === 'seminar' ? '#FEF3C7' : '#F3E8FF',
                        color:
                          rev.itemType === 'book' ? '#4F46E5' :
                          rev.itemType === 'webinar' ? '#059669' :
                          rev.itemType === 'seminar' ? '#D97706' : '#7942B5',
                        marginBottom: '0.25rem'
                      }}>
                        {rev.itemType}
                      </span>
                      <div style={{ fontWeight: '600', color: '#374151' }}>{rev.itemTitle}</div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                      <StarRating rating={rev.rating} readOnly={true} size={15} />
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                        {rev.rating} / 5.0
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', color: '#4B5563', lineHeight: '1.5' }}>
                      {rev.comment}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', fontSize: '0.8rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(rev._id)}
                        disabled={deletingId === rev._id}
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {deletingId === rev._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
