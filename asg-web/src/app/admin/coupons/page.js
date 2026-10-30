"use client";

import { useState, useEffect } from 'react';
import styles from './coupons.module.css';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0 });
  const [availableItems, setAvailableItems] = useState({ books: [], webinars: [], seminars: [], career: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 100,
    applicableTo: 'career',
    targetItemId: '',
    targetItemTitle: 'Career Guidance Assessment',
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    isActive: true,
    expiresAt: ''
  });

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
        setStats(data.stats || { totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0 });
        setAvailableItems(data.availableItems || { books: [], webinars: [], seminars: [], career: [] });
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleApplicableToChange = (val) => {
    let defaultTitle = '';
    let defaultId = '';

    if (val === 'career') {
      defaultTitle = 'Career Guidance Assessment';
      defaultId = 'career_assessment';
    } else if (val === 'all') {
      defaultTitle = 'All Site Items';
      defaultId = '';
    } else if (val === 'store' && availableItems.books.length > 0) {
      defaultTitle = availableItems.books[0].title;
      defaultId = availableItems.books[0].id;
    } else if (val === 'webinar' && availableItems.webinars.length > 0) {
      defaultTitle = availableItems.webinars[0].title;
      defaultId = availableItems.webinars[0].id;
    } else if (val === 'seminar' && availableItems.seminars.length > 0) {
      defaultTitle = availableItems.seminars[0].title;
      defaultId = availableItems.seminars[0].id;
    }

    setFormData(prev => ({
      ...prev,
      applicableTo: val,
      targetItemId: defaultId,
      targetItemTitle: defaultTitle
    }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }

      setIsModalOpen(false);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 100,
        applicableTo: 'career',
        targetItemId: 'career_assessment',
        targetItemTitle: 'Career Guidance Assessment',
        minOrderAmount: 0,
        maxDiscountAmount: '',
        usageLimit: '',
        isActive: true,
        expiresAt: ''
      });
      fetchCoupons();
      alert(`🎉 Coupon '${data.coupon.code}' created successfully!`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'?`)) return;

    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied code '${code}' to clipboard!`);
  };

  const filteredCoupons = coupons.filter(c => {
    if (filter === 'active') return c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date());
    if (filter === 'expired') return c.expiresAt && new Date(c.expiresAt) <= new Date();
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🎟️ Coupon &amp; Discount Codes</h1>
          <p className={styles.subtitle}>
            Create secret percentage (%) or flat amount (₹) discount codes for specific items or site-wide.
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setFormError(''); }}
          className={styles.createBtn}
        >
          <span>＋</span> Create New Coupon
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Coupons</div>
          <div className={styles.statValue}>{stats.totalCoupons}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Active Coupons</div>
          <div className={styles.statValue} style={{ color: '#059669' }}>{stats.activeCoupons}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Redemptions</div>
          <div className={styles.statValue} style={{ color: '#7942B5' }}>{stats.totalRedemptions}</div>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>
            All Coupons ({filteredCoupons.length})
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? '#7942B5' : '#F3F4F6',
                color: filter === 'all' ? '#FFFFFF' : '#4B5563',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              style={{
                background: filter === 'active' ? '#059669' : '#F3F4F6',
                color: filter === 'active' ? '#FFFFFF' : '#4B5563',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('expired')}
              style={{
                background: filter === 'expired' ? '#DC2626' : '#F3F4F6',
                color: filter === 'expired' ? '#FFFFFF' : '#4B5563',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Expired
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Loading coupons...</div>
          ) : filteredCoupons.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎟️</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>No Coupons Found</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Click &quot;Create New Coupon&quot; to generate your first discount code.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Applies To</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td>
                      <span
                        className={styles.codeBadge}
                        onClick={() => copyToClipboard(coupon.code)}
                        title="Click to copy code"
                      >
                        {coupon.code} 📋
                      </span>
                      {coupon.description && (
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                          {coupon.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.discountBadge} ${coupon.discountType === 'percentage' ? styles.percentBadge : styles.fixedBadge}`}>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1F2937' }}>
                        {coupon.applicableTo === 'career' ? '🎯 Career Assessment' :
                         coupon.applicableTo === 'store' ? '📚 Store Book' :
                         coupon.applicableTo === 'webinar' ? '🎥 Webinar' :
                         coupon.applicableTo === 'seminar' ? '🏛️ Seminar' : '🌐 All Items'}
                      </div>
                      {coupon.targetItemTitle && coupon.applicableTo !== 'all' && coupon.applicableTo !== 'career' && (
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.15rem' }}>
                          {coupon.targetItemTitle}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#111827' }}>{coupon.usedCount}</span>
                      <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                        {' '}/ {coupon.usageLimit !== null ? coupon.usageLimit : '∞'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td>
                      <span
                        onClick={() => handleToggleStatus(coupon)}
                        style={{ cursor: 'pointer' }}
                        className={coupon.isActive ? styles.statusActive : styles.statusInactive}
                        title="Click to toggle status"
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0.2rem'
                        }}
                        title="Delete coupon"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Discount Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>✕</button>
            </div>

            {formError && (
              <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Coupon Code *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. CAREER100, WORKSHOPFREE, ASG50"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={styles.input}
                  style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}
                />
                <div className={styles.helpText}>Code will be saved in uppercase. Keep it clean and memorable.</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description (Internal Notes)</label>
                <input
                  type="text"
                  placeholder="e.g. Priyadarshini College Workshop 100% Free Pass"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                    className={styles.select}
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Flat Amount Off (₹)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {formData.discountType === 'percentage' ? 'Percentage Value (1-100) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? 100 : 10000}
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Item Application Scope */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Applies To (Target Item) *</label>
                <select
                  value={formData.applicableTo}
                  onChange={e => handleApplicableToChange(e.target.value)}
                  className={styles.select}
                >
                  <option value="career">🎯 Career Guidance Assessment Only</option>
                  <option value="store">📚 Specific Store Book</option>
                  <option value="webinar">🎥 Specific Webinar</option>
                  <option value="seminar">🏛️ Specific Seminar</option>
                  <option value="all">🌐 All Platform Items (Site-wide)</option>
                </select>
              </div>

              {/* Specific Item Picker if store/webinar/seminar */}
              {formData.applicableTo === 'store' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Book *</label>
                  <select
                    value={formData.targetItemId}
                    onChange={e => {
                      const selected = availableItems.books.find(b => b.id === e.target.value);
                      setFormData({
                        ...formData,
                        targetItemId: e.target.value,
                        targetItemTitle: selected ? selected.title : ''
                      });
                    }}
                    className={styles.select}
                  >
                    {availableItems.books.map(b => (
                      <option key={b.id} value={b.id}>{b.title} (₹{b.price})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.applicableTo === 'webinar' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Webinar *</label>
                  <select
                    value={formData.targetItemId}
                    onChange={e => {
                      const selected = availableItems.webinars.find(w => w.id === e.target.value);
                      setFormData({
                        ...formData,
                        targetItemId: e.target.value,
                        targetItemTitle: selected ? selected.title : ''
                      });
                    }}
                    className={styles.select}
                  >
                    {availableItems.webinars.map(w => (
                      <option key={w.id} value={w.id}>{w.title} (₹{w.price})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.applicableTo === 'seminar' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Seminar *</label>
                  <select
                    value={formData.targetItemId}
                    onChange={e => {
                      const selected = availableItems.seminars.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        targetItemId: e.target.value,
                        targetItemTitle: selected ? selected.title : ''
                      });
                    }}
                    className={styles.select}
                  >
                    {availableItems.seminars.map(s => (
                      <option key={s.id} value={s.id}>{s.title} (₹{s.price})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Max Usage Limit (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={formData.usageLimit}
                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                    className={styles.input}
                  />
                  <div className={styles.helpText}>e.g. 50 uses for a 50-student batch</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                    className={styles.input}
                  />
                  <div className={styles.helpText}>Leave empty for no expiry</div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
