"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [editingMeetingLink, setEditingMeetingLink] = useState('');
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);

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

  const handleUpdateSession = async (assessmentId, field, value) => {
    setIsUpdatingSession(true);
    try {
      const payload = {};
      payload[field] = value;
      const res = await fetch(`/api/admin/career-guidance/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update session');
      const updated = await res.json();

      setData(prev => ({
        ...prev,
        assessments: prev.assessments.map(a => a._id === updated._id ? { ...a, ...updated } : a)
      }));
      if (selectedAssessment && selectedAssessment._id === updated._id) {
        setSelectedAssessment({ ...selectedAssessment, ...updated });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdatingSession(false);
    }
  };

  const handleToggleTask = async (assessmentId, taskId, currentVal) => {
    try {
      const res = await fetch(`/api/admin/career-guidance/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, taskCompleted: !currentVal })
      });
      if (res.ok) {
        const updated = await res.json();
        setData(prev => ({
          ...prev,
          assessments: prev.assessments.map(a => a._id === updated._id ? { ...a, ...updated } : a)
        }));
        if (selectedAssessment && selectedAssessment._id === updated._id) {
          setSelectedAssessment({ ...selectedAssessment, ...updated });
        }
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleCopyMeetingBrief = (assessment) => {
    const name = assessment.candidateDetails?.name || 'Candidate';
    const email = assessment.candidateDetails?.email || 'N/A';
    const phone = assessment.candidateDetails?.phone || 'N/A';
    const topArchetype = assessment.topCategories?.[0]?.name || 'Not completed';
    const goal = assessment.requirements?.goals || 'Not specified';
    const text = assessment.requirements?.text || 'No background description provided';
    const questions = (assessment.requirements?.specificQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n') || 'None listed';

    const brief = `
=== 🎯 Career Mentorship Session Brief ===
👤 Candidate: ${name}
📞 Contact: ${phone} | ${email}
✨ Top Swadharma Archetype: ${topArchetype}

🎯 Target Career Goal:
${goal}

📋 Candidate Situation & Questions:
${text}

❓ Key Discussion Questions:
${questions}
==========================================
`.trim();

    navigator.clipboard.writeText(brief);
    alert('📋 Career Meeting Brief copied to clipboard! You can paste it into Zoom chat or your notes.');
  };

  const handleJoinWithCompanion = (assessment) => {
    if (assessment.meetingLink) {
      window.open(assessment.meetingLink, '_blank');
    }
    setSelectedAssessment(assessment);
    setEditingMeetingLink(assessment.meetingLink || '');
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
            Manage assessment pricing, track candidate requirements, review 1-on-1 mentorship follow-up checklists, and monitor student feedback.
          </p>
        </div>
        <Link
          href="/admin/coupons"
          style={{
            background: '#FAF5FF',
            color: '#7942B5',
            border: '1.5px solid #D8B4FE',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}
        >
          🎟️ Manage Discount Coupons
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Registrations</div>
          <div className={styles.statValue}>{data.stats.totalSubmissions}</div>
          <div className={styles.statMeta}>All student enquiries</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Paid Assessments</div>
          <div className={styles.statValue} style={{ color: '#059669' }}>
            {data.stats.totalPaid}
          </div>
          <div className={styles.statMeta}>Confirmed test-takers</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tests Completed</div>
          <div className={styles.statValue} style={{ color: '#7942B5' }}>
            {data.stats.totalCompleted}
          </div>
          <div className={styles.statMeta}>Reports generated</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Revenue</div>
          <div className={styles.statValue} style={{ color: '#2563EB' }}>
            ₹{data.stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className={styles.statMeta}>From assessments</div>
        </div>
      </div>

      {/* PRICING & SETTINGS FORM */}
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2>Dynamic Pricing &amp; Demo Video Settings</h2>
          <p>Update live pricing and customize the career guidance experience.</p>
        </div>

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
            Student Submissions &amp; Mentorship ({data.assessments.length})
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
                  <th>Status &amp; Mentorship</th>
                  <th>Archetype</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.assessments.map(item => {
                  const candidate = item.candidateDetails || {};
                  const topCategory = item.topCategories?.[0];
                  const hasReqs = Boolean(item.requirements?.text);
                  const hasFollowUp = Boolean(item.followUp?.filled);
                  const actionItems = item.followUp?.actionItems || [];
                  const doneTasks = actionItems.filter(i => i.completed).length;
                  const hasFeedback = Boolean(item.feedback?.filled);
                  const isSessionCompleted = item.sessionStatus === 'Completed';

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
                        {item.meetingLink && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#2563EB', textDecoration: 'underline' }}>
                              📹 Zoom Link
                            </a>
                          </div>
                        )}
                      </td>
                      <td style={{ color: '#4B5563' }}>
                        {candidate.currentStatus || 'N/A'}
                      </td>
                      <td style={{ fontWeight: '700', color: '#111827' }}>
                        ₹{item.amountPaid}
                        {item.couponApplied && (
                          <div style={{ fontSize: '0.72rem', color: '#059669', background: '#ECFDF5', padding: '1px 5px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                            🎟️ {item.couponApplied}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div>
                            {item.paymentStatus === 'Paid' ? (
                              <span className={styles.badgePaid}>Paid</span>
                            ) : (
                              <span className={styles.badgePending}>Pending</span>
                            )}
                          </div>

                          {/* Mentorship Workflow Tags */}
                          {hasReqs && (
                            <span style={{ fontSize: '0.72rem', background: '#EFF6FF', color: '#1D4ED8', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                              📋 Req Added
                            </span>
                          )}

                          {hasFollowUp ? (
                            <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                              📝 Follow-up: {doneTasks}/{actionItems.length} Done
                            </span>
                          ) : isSessionCompleted ? (
                            <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                              ⏳ Follow-up Awaited
                            </span>
                          ) : null}

                          {hasFeedback && (
                            <span style={{ fontSize: '0.72rem', background: '#FAF5FF', color: '#6B21A8', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                              ⭐ {item.feedback.rating}/5 Feedback
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {topCategory ? (
                          <span style={{ fontWeight: '600', color: '#7942b5' }}>
                            {topCategory.badge || '✨'} {topCategory.name} ({topCategory.score}/15)
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>Not completed</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            className={styles.viewBtn}
                            onClick={() => {
                              setSelectedAssessment(item);
                              setEditingMeetingLink(item.meetingLink || '');
                            }}
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyMeetingBrief(item)}
                            title="Copy Meeting Brief for Zoom chat or notes"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              padding: '0.3rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            📋 Brief
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS & MENTORSHIP COMPANION MODAL */}
      {selectedAssessment && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedAssessment(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '92vh', overflowY: 'auto' }}>
            <button className={styles.modalClose} onClick={() => setSelectedAssessment(null)}>&times;</button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                background: '#FAF5FF',
                color: '#6B21A8',
                border: '1px solid #D8B4FE',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                🎯 CAREER GUIDANCE &amp; SWADHARMA
              </span>
              <span style={{
                background: selectedAssessment.sessionStatus === 'Completed' ? '#DCFCE7' : '#FEF3C7',
                color: selectedAssessment.sessionStatus === 'Completed' ? '#166534' : '#92400E',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                Mentorship: {selectedAssessment.sessionStatus || 'Pending'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#111827' }}>
              {selectedAssessment.candidateDetails?.name}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              ID: {selectedAssessment._id} &middot; Registered on {new Date(selectedAssessment.createdAt).toLocaleString()}
            </p>

            <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div><strong>Email:</strong> {selectedAssessment.candidateDetails?.email}</div>
              <div><strong>Phone:</strong> {selectedAssessment.candidateDetails?.phone}</div>
              <div><strong>Status:</strong> {selectedAssessment.candidateDetails?.currentStatus}</div>
              <div><strong>Fee Paid:</strong> ₹{selectedAssessment.amountPaid} ({selectedAssessment.paymentStatus})</div>
              <div><strong>Test Status:</strong> {selectedAssessment.testStatus}</div>
              <div><strong>Education:</strong> {selectedAssessment.candidateDetails?.education || 'Not provided'}</div>
            </div>

            {/* Quick Action Buttons & Meeting Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedAssessment.candidateDetails?.phone && (
                <a
                  href={`https://wa.me/${selectedAssessment.candidateDetails.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#25D366',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}
                >
                  💬 WhatsApp
                </a>
              )}

              {/* Copy Brief Button */}
              <button
                type="button"
                onClick={() => handleCopyMeetingBrief(selectedAssessment)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📋 Copy Meeting Brief
              </button>

              {/* Launch Zoom with Companion Brief */}
              {selectedAssessment.meetingLink && (
                <button
                  type="button"
                  onClick={() => handleJoinWithCompanion(selectedAssessment)}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📹 Join Zoom Call
                </button>
              )}

              {/* Quick Mark Completed */}
              {selectedAssessment.sessionStatus !== 'Completed' ? (
                <button
                  type="button"
                  onClick={() => handleUpdateSession(selectedAssessment._id, 'sessionStatus', 'Completed')}
                  disabled={isUpdatingSession}
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✓ Mark Session Completed (Enable Follow-up)
                </button>
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#166534', background: '#DCFCE7', padding: '0.45rem 0.85rem', borderRadius: '8px', fontWeight: 700 }}>
                  ✓ Guidance Session Conducted
                </span>
              )}
            </div>

            {/* Meeting Link Edit */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                📹 Video Meeting Link (Zoom / Google Meet)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="url"
                  value={editingMeetingLink}
                  onChange={(e) => setEditingMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  style={{ flex: 1, minWidth: '220px', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateSession(selectedAssessment._id, 'meetingLink', editingMeetingLink)}
                  style={{ background: '#7942B5', color: '#FFF', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Link
                </button>
              </div>
            </div>

            {/* Top 3 Domains */}
            {selectedAssessment.topCategories && selectedAssessment.topCategories.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>
                  Natural Career Archetypes
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {selectedAssessment.topCategories.map((c, i) => (
                    <div key={i} style={{ background: '#FAF5FF', border: '1px solid #DCBFFF', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#7942b5', textTransform: 'uppercase' }}>
                        {c.badge || `#${i + 1}`}
                      </div>
                      <div style={{ fontWeight: '700', color: '#111827', margin: '0.2rem 0' }}>{c.name}</div>
                      <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>Score: <strong>{c.score}/15</strong></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 1: CANDIDATE REQUIREMENTS & QUESTIONS */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>📋</span> Candidate Pre-Guidance Requirements &amp; Career Goals
              </h3>
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '1rem', fontSize: '0.88rem', color: '#0C4A6E', lineHeight: '1.55' }}>
                {selectedAssessment.requirements?.goals && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#0369A1', fontSize: '0.78rem', textTransform: 'uppercase' }}>Target Goal:</strong>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedAssessment.requirements.goals}</div>
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap', color: '#1E293B' }}>
                  {selectedAssessment.requirements?.text || 'No pre-guidance requirements entered by student yet.'}
                </div>
                {selectedAssessment.requirements?.specificQuestions && selectedAssessment.requirements.specificQuestions.length > 0 && (
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px dashed #BAE6FD' }}>
                    <strong style={{ color: '#0369A1', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                      Specific Questions to Cover:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#0F172A' }}>
                      {selectedAssessment.requirements.specificQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: POST-MEETING FOLLOW-UP & ACTION PLAN */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>📝</span> Post-Meeting Follow-Up &amp; Action Plan
                </h3>
                {selectedAssessment.followUp?.filled && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: selectedAssessment.followUp.status === 'completed' ? '#166534' : '#92400E', background: selectedAssessment.followUp.status === 'completed' ? '#DCFCE7' : '#FEF3C7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {selectedAssessment.followUp.status === 'completed' ? '✓ All Tasks Done' : '⚡ Action Plan In Progress'}
                  </span>
                )}
              </div>

              {!selectedAssessment.followUp || !selectedAssessment.followUp.filled ? (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.85rem', color: '#92400E', fontSize: '0.85rem' }}>
                  <span>⏳ Follow-up not submitted yet. (Available once guidance session is marked Completed).</span>
                </div>
              ) : (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                  {selectedAssessment.followUp.keyTakeaways && (
                    <div style={{ marginBottom: '0.85rem' }}>
                      <strong style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                        💡 Session Takeaways &amp; Mentor Advice:
                      </strong>
                      <div style={{ background: '#FFFFFF', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#1E293B', whiteSpace: 'pre-wrap' }}>
                        {selectedAssessment.followUp.keyTakeaways}
                      </div>
                    </div>
                  )}

                  {/* Tasks Checklist */}
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                      Action Items ({selectedAssessment.followUp.actionItems?.filter(i => i.completed).length || 0} of {selectedAssessment.followUp.actionItems?.length || 0} Completed):
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {selectedAssessment.followUp.actionItems?.map((task) => (
                        <div
                          key={task.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: task.completed ? '#F0FDF4' : '#FFFFFF',
                            border: `1px solid ${task.completed ? '#BBF7D0' : '#E2E8F0'}`,
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            gap: '0.5rem'
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={Boolean(task.completed)}
                              onChange={() => handleToggleTask(selectedAssessment._id, task.id, task.completed)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: task.completed ? '#166534' : '#1E293B', textDecoration: task.completed ? 'line-through' : 'none', fontWeight: task.completed ? 600 : 500 }}>
                              {task.title}
                            </span>
                          </label>
                          {task.completed && (
                            <span style={{ fontSize: '0.7rem', color: '#166534', background: '#DCFCE7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                              ✓ Done
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: CANDIDATE FEEDBACK */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>⭐</span> Candidate Guidance Feedback
              </h3>
              {!selectedAssessment.feedback || !selectedAssessment.feedback.filled ? (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem', color: '#64748B', fontSize: '0.85rem' }}>
                  <span>🔒 Feedback not submitted yet (Unlocked after student fills follow-up).</span>
                </div>
              ) : (
                <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '1.15rem', color: '#EAB308' }}>
                      {'★'.repeat(selectedAssessment.feedback.rating)}{'☆'.repeat(5 - selectedAssessment.feedback.rating)}
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: '#6B21A8' }}>
                      {selectedAssessment.feedback.rating} out of 5 Stars
                    </strong>
                    {selectedAssessment.feedback.filledAt && (
                      <span style={{ fontSize: '0.75rem', color: '#7E22CE', marginLeft: 'auto' }}>
                        Submitted {new Date(selectedAssessment.feedback.filledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.55', background: '#FFFFFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D8B4FE' }}>
                    &ldquo;{selectedAssessment.feedback.comment}&rdquo;
                  </div>
                </div>
              )}
            </div>

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
