"use client";

import { useState, useEffect } from 'react';
import styles from './careerAdmin.module.css';

export default function CareerGuidanceAdmin() {
  const [data, setData] = useState({
    setting: { price: 299, originalPrice: 999, isEnabled: true, videoUrl: '' },
    stats: { totalSubmissions: 0, totalPaid: 0, totalCompleted: 0, totalRevenue: 0 },
    assessments: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Settings form state
  const [price, setPrice] = useState(299);
  const [originalPrice, setOriginalPrice] = useState(999);
  const [videoUrl, setVideoUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  async function fetchAdminData() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/career-guidance');
      if (!res.ok) throw new Error('Failed to load career data');
      const resData = await res.json();
      setData(resData);
      
      if (resData.setting) {
        setPrice(resData.setting.price || 299);
        setOriginalPrice(resData.setting.originalPrice || 999);
        setVideoUrl(resData.setting.videoUrl || '');
        setIsEnabled(resData.setting.isEnabled !== false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSetting(true);
    try {
      const res = await fetch('/api/career/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(price),
          originalPrice: Number(originalPrice),
          videoUrl: videoUrl.trim(),
          isEnabled: Boolean(isEnabled)
        })
      });

      if (!res.ok) throw new Error('Failed to save settings');
      alert('Career Assessment settings updated successfully!');
      fetchAdminData();
    } catch (err) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setIsSavingSetting(false);
    }
  };

  if (loading) {
    return <div className={styles.container}><h2>Loading Career Guidance Data...</h2></div>;
  }

  if (error) {
    return <div className={styles.container}><h2>Error: {error}</h2></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Career Guidance Management</h1>
          <p className={styles.subtitle}>
            Manage dynamic pricing, custom video URL, and view all student assessment submissions.
          </p>
        </div>
      </div>

      {/* METRIC STATS ROW */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Revenue</div>
          <div className={styles.statValue} style={{ color: '#059669' }}>
            ₹{data.stats.totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>Paid Candidates</div>
          <div className={styles.statValue} style={{ color: '#7942b5' }}>
            {data.stats.totalPaid}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>Completed Tests</div>
          <div className={styles.statValue} style={{ color: '#2563EB' }}>
            {data.stats.totalCompleted}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Registrations</div>
          <div className={styles.statValue}>
            {data.stats.totalSubmissions}
          </div>
        </div>
      </div>

      {/* DYNAMIC PRICING & VIDEO SETTINGS */}
      <div className={styles.settingsCard}>
        <h2 className={styles.cardHeading}>
          <span>⚙️</span> Dynamic Pricing &amp; Media Configuration
        </h2>

        <form onSubmit={handleSaveSettings}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Current Test Price (₹) *</label>
              <input
                required
                type="number"
                min="0"
                className={styles.inputField}
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Strikethrough / Original Price (₹)</label>
              <input
                type="number"
                min="0"
                className={styles.inputField}
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Custom Promo Video URL (Optional)</label>
              <input
                type="url"
                placeholder="Leave blank to use built-in interactive demo video"
                className={styles.inputField}
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
              />
            </div>

            <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.25rem' }}>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={e => setIsEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: '600', color: '#1F2937' }}>Enable Career Assessment</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingSetting}
            className={styles.saveBtn}
          >
            {isSavingSetting ? "Saving Settings..." : "Save Settings"}
          </button>
        </form>
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
            Recent Student Submissions ({data.assessments.length})
          </h2>
        </div>

        {data.assessments.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
            No assessment registrations yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Stage</th>
                  <th>Fee Paid</th>
                  <th>Status</th>
                  <th>Primary Swadharma</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.assessments.map(item => {
                  const candidate = item.candidateDetails || {};
                  const topCategory = item.topCategories?.[0];

                  return (
                    <tr key={item._id}>
                      <td style={{ color: '#6B7280' }}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ fontWeight: '700', color: '#111827' }}>
                        {candidate.name}
                      </td>
                      <td style={{ color: '#4B5563', fontSize: '0.85rem' }}>
                        <div>{candidate.email}</div>
                        <div style={{ color: '#9CA3AF' }}>{candidate.phone}</div>
                      </td>
                      <td style={{ color: '#4B5563' }}>
                        {candidate.currentStatus || 'N/A'}
                      </td>
                      <td style={{ fontWeight: '700', color: '#111827' }}>
                        ₹{item.amountPaid}
                      </td>
                      <td>
                        {item.paymentStatus === 'Paid' ? (
                          <span className={styles.badgePaid}>Paid</span>
                        ) : (
                          <span className={styles.badgePending}>Pending</span>
                        )}
                      </td>
                      <td>
                        {topCategory ? (
                          <span style={{ fontWeight: '600', color: '#7942b5' }}>
                            {topCategory.name} ({topCategory.score}/15)
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>Not completed</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={styles.viewBtn}
                          onClick={() => setSelectedAssessment(item)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedAssessment && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedAssessment(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedAssessment(null)}>&times;</button>
            
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827' }}>
              Candidate Assessment Details
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              ID: {selectedAssessment._id} &middot; Registered on {new Date(selectedAssessment.createdAt).toLocaleString()}
            </p>

            <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>Name:</strong> {selectedAssessment.candidateDetails?.name}</div>
              <div><strong>Email:</strong> {selectedAssessment.candidateDetails?.email}</div>
              <div><strong>Phone:</strong> {selectedAssessment.candidateDetails?.phone}</div>
              <div><strong>Status:</strong> {selectedAssessment.candidateDetails?.currentStatus}</div>
              <div><strong>Amount Paid:</strong> ₹{selectedAssessment.amountPaid} ({selectedAssessment.paymentStatus})</div>
              <div><strong>Test Status:</strong> {selectedAssessment.testStatus}</div>
            </div>

            {selectedAssessment.topCategories && selectedAssessment.topCategories.length > 0 ? (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem' }}>Top 3 Domains</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {selectedAssessment.topCategories.map((c, i) => (
                    <div key={i} style={{ background: '#FAF5FF', border: '1px solid #DCBFFF', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7942b5', textTransform: 'uppercase' }}>
                        {c.badge || `#${i + 1}`}
                      </div>
                      <div style={{ fontWeight: '700', color: '#111827', margin: '0.25rem 0' }}>{c.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>Score: <strong>{c.score}/15</strong></div>
                    </div>
                  ))}
                </div>

                {selectedAssessment.synergyInsight && (
                  <div style={{ background: '#F1EAFF', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                    <strong>Synergy Insight:</strong> {selectedAssessment.synergyInsight}
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Candidate has not submitted the 30-question assessment yet.</p>
            )}

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setSelectedAssessment(null)}
                style={{ background: '#E5E7EB', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
