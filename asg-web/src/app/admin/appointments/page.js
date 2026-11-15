"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../orders/orders.module.css'; // Re-use the table styles from orders

export default function AppointmentsQueue() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'startup' | 'general'
  const [selectedAppt, setSelectedAppt] = useState(null); // For detail modal
  const [editingMeetingLink, setEditingMeetingLink] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/admin/appointments');
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, field, value) => {
    setUpdatingId(id);
    try {
      const payload = {};
      payload[field] = value;

      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error(`Failed to update ${field}`);
      const updatedAppt = await res.json();
      
      setAppointments(appointments.map(appt => 
        appt._id === updatedAppt._id ? updatedAppt : appt
      ));
      if (selectedAppt && selectedAppt._id === updatedAppt._id) {
        setSelectedAppt(updatedAppt);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleTask = async (apptId, taskId, currentVal) => {
    try {
      const res = await fetch(`/api/admin/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, taskCompleted: !currentVal })
      });
      if (res.ok) {
        const updatedAppt = await res.json();
        setAppointments(appointments.map(a => a._id === updatedAppt._id ? updatedAppt : a));
        if (selectedAppt && selectedAppt._id === updatedAppt._id) {
          setSelectedAppt(updatedAppt);
        }
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleSaveMeetingLink = async (id) => {
    if (!editingMeetingLink) return;
    await handleStatusChange(id, 'meetingLink', editingMeetingLink);
    alert('Meeting link updated successfully!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment permanently?")) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete appointment');
      if (selectedAppt && selectedAppt._id === id) setSelectedAppt(null);
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const isStartup = (appt) => {
    return Boolean(
      appt?.type === 'startup' ||
      appt?.message?.includes('[START-UP GUIDANCE') || 
      appt?.message?.toLowerCase().includes('start-up') ||
      appt?.message?.toLowerCase().includes('startup')
    );
  };

  const startupCount = appointments.filter(isStartup).length;
  const generalCount = appointments.length - startupCount;

  const filteredAppointments = appointments.filter(appt => {
    if (activeFilter === 'startup') return isStartup(appt);
    if (activeFilter === 'general') return !isStartup(appt);
    return true;
  });

  if (loading) return <div className={styles.container}><h2>Loading Consultations &amp; Start-up Enquiries...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Consulting &amp; Start-up Guidance Queue</h1>
          <p>Track client requirements, manage sessions, review post-meeting follow-up checklists, and monitor client feedback.</p>
        </div>
        <Link 
          href="/admin/startup-guidance"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#059669',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          ⚙️ Manage Start-up Video &amp; Content
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: activeFilter === 'all' ? '2px solid #0284c7' : '1px solid #E2E8F0',
            background: activeFilter === 'all' ? '#E0F2FE' : '#FFFFFF',
            color: activeFilter === 'all' ? '#0369A1' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          All Requests ({appointments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('startup')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: activeFilter === 'startup' ? '2px solid #059669' : '1px solid #E2E8F0',
            background: activeFilter === 'startup' ? '#DCFCE7' : '#FFFFFF',
            color: activeFilter === 'startup' ? '#166534' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          🚀 Start-up Guidance ({startupCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('general')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: activeFilter === 'general' ? '2px solid #4F46E5' : '1px solid #E2E8F0',
            background: activeFilter === 'general' ? '#EEF2FF' : '#FFFFFF',
            color: activeFilter === 'general' ? '#3730A3' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          💼 1-on-1 Consulting ({generalCount})
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Program &amp; Client Details</th>
              <th>Date &amp; Time</th>
              <th>Session &amp; Progress</th>
              <th>Charges (₹)</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  No requests found under this filter.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appt) => {
                const isStart = isStartup(appt);
                const hasReqs = Boolean(appt.requirements?.text || appt.message);
                const hasFollowUp = Boolean(appt.followUp?.filled);
                const actionItems = appt.followUp?.actionItems || [];
                const completedTasks = actionItems.filter(i => i.completed).length;
                const hasFeedback = Boolean(appt.feedback?.filled);

                return (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ marginBottom: '0.35rem' }}>
                        {isStart ? (
                          <span style={{
                            background: '#DCFCE7',
                            color: '#166534',
                            border: '1px solid #86EFAC',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            display: 'inline-block'
                          }}>
                            🚀 START-UP GUIDANCE
                          </span>
                        ) : (
                          <span style={{
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            display: 'inline-block'
                          }}>
                            💼 CONSULTING
                          </span>
                        )}
                      </div>
                      <div style={{fontWeight: 700, color: '#111827', fontSize: '0.95rem'}}>{appt.customerDetails?.name || 'Unknown'}</div>
                      <div style={{fontSize: '0.83rem', color: '#4B5563'}}>{appt.customerDetails?.email || 'N/A'}</div>
                      {appt.customerDetails?.phone && (
                        <div style={{fontSize: '0.8rem', color: '#059669', fontWeight: 600}}>
                          📞 {appt.customerDetails.phone}
                        </div>
                      )}
                      {appt.meetingLink && (
                        <div style={{marginTop: '0.4rem'}}>
                          <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.8rem', color: '#2563EB', textDecoration: 'underline'}}>
                            📹 Join Session Link
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{new Date(appt.date).toLocaleDateString()}</div>
                      <div style={{fontSize: '0.85rem', color: '#6B7280'}}>{appt.time}</div>
                    </td>
                    <td>
                      {/* Session Status Dropdown */}
                      <select 
                        className={styles.statusSelect}
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt._id, 'status', e.target.value)}
                        disabled={updatingId === appt._id}
                        style={{
                          fontWeight: 700,
                          borderColor: appt.status === 'Confirmed' ? '#10B981' : appt.status === 'Completed' ? '#3B82F6' : '#D1D5DB'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed (Meet Done)</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {/* Workflow Progress Indicators */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.45rem' }}>
                        {/* Requirements Indicator */}
                        {hasReqs ? (
                          <span style={{ fontSize: '0.72rem', background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            📋 Requirements Submitted
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#64748B', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            📋 Requirements Awaited
                          </span>
                        )}

                        {/* Follow-up Indicator */}
                        {hasFollowUp ? (
                          <span style={{ 
                            fontSize: '0.72rem', 
                            background: completedTasks === actionItems.length && actionItems.length > 0 ? '#DCFCE7' : '#FEF3C7', 
                            color: completedTasks === actionItems.length && actionItems.length > 0 ? '#166534' : '#92400E', 
                            border: `1px solid ${completedTasks === actionItems.length && actionItems.length > 0 ? '#86EFAC' : '#FDE68A'}`, 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px', 
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            📝 Follow-up: {completedTasks}/{actionItems.length} Tasks Done
                          </span>
                        ) : appt.status === 'Completed' ? (
                          <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                            ⏳ Follow-up Awaited
                          </span>
                        ) : null}

                        {/* Feedback Indicator */}
                        {hasFeedback && (
                          <span style={{ fontSize: '0.72rem', background: '#FAF5FF', color: '#6B21A8', border: '1px solid #E9D5FF', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                            ⭐ Rated {appt.feedback.rating}/5
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number"
                        className={styles.statusSelect}
                        style={{ width: '85px' }}
                        defaultValue={appt.charges || ''}
                        placeholder={isStart ? 'Pay Value' : 'e.g. 2500'}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if(val !== String(appt.charges)) {
                            handleStatusChange(appt._id, 'charges', val);
                          }
                        }}
                        disabled={updatingId === appt._id}
                      />
                    </td>
                    <td>
                      <select 
                        className={styles.statusSelect}
                        value={appt.paymentStatus}
                        onChange={(e) => handleStatusChange(appt._id, 'paymentStatus', e.target.value)}
                        disabled={updatingId === appt._id}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAppt(appt);
                            setEditingMeetingLink(appt.meetingLink || '');
                          }}
                          style={{
                            background: '#0284c7',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleDelete(appt._id)}
                          style={{ background: 'transparent', border: '1px solid #FCA5A5', color: '#EF4444', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem'}}
                        >
                          Delete
                        </button>
                      </div>
                      {updatingId === appt._id && <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Updating...</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedAppt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <button 
              onClick={() => setSelectedAppt(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F1F5F9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B'
              }}
            >
              &times;
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {isStartup(selectedAppt) ? (
                <span style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  border: '1px solid #86EFAC',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}>
                  🚀 START-UP GUIDANCE ENQUIRY
                </span>
              ) : (
                <span style={{
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}>
                  💼 1-ON-1 CONSULTATION
                </span>
              )}

              <span style={{
                background: selectedAppt.status === 'Completed' ? '#DCFCE7' : selectedAppt.status === 'Confirmed' ? '#E0F2FE' : '#FEF3C7',
                color: selectedAppt.status === 'Completed' ? '#166534' : selectedAppt.status === 'Confirmed' ? '#0369A1' : '#92400E',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                Status: {selectedAppt.status}
              </span>

              {selectedAppt.paymentStatus === 'Paid' ? (
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                  ✓ Paid (₹{selectedAppt.charges || 0})
                </span>
              ) : (
                <span style={{ background: '#F1F5F9', color: '#64748B', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                  Unpaid
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
              {selectedAppt.customerDetails?.name}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Email</strong>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}>{selectedAppt.customerDetails?.email || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Phone</strong>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}>{selectedAppt.customerDetails?.phone || 'Not provided'}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Preferred Date</strong>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}>{new Date(selectedAppt.date).toLocaleDateString()}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Preferred Time</strong>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}>{selectedAppt.time}</div>
              </div>
            </div>

            {/* Direct Connect & Session Control Buttons */}
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedAppt.customerDetails?.phone && (
                <a
                  href={`https://wa.me/${selectedAppt.customerDetails.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#25D366',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  💬 Chat on WhatsApp
                </a>
              )}
              {selectedAppt.customerDetails?.email && (
                <a
                  href={`mailto:${selectedAppt.customerDetails.email}?subject=Regarding Your Consultation with Avinash S. Gore`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#0284c7',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  ✉️ Send Email
                </a>
              )}

              {/* Quick Status Toggle Button */}
              {selectedAppt.status !== 'Completed' ? (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedAppt._id, 'status', 'Completed')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✓ Mark Session Completed (Enable Follow-up)
                </button>
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, background: '#DCFCE7', padding: '0.5rem 0.9rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  ✓ Session Conducted
                </span>
              )}
            </div>

            {/* Meeting Link Manager */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem' }}>
                📹 Video Meeting Link (Zoom / Google Meet)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input 
                  type="url"
                  value={editingMeetingLink}
                  onChange={(e) => setEditingMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  style={{
                    flex: '1',
                    minWidth: '240px',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveMeetingLink(selectedAppt._id)}
                  style={{
                    background: '#4F46E5',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Link
                </button>
              </div>
            </div>

            {/* SECTION 1: CLIENT REQUIREMENTS & PRE-SESSION GOALS */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📋</span> Client Pre-Session Requirements &amp; Goals
                </h3>
                {selectedAppt.requirements?.updatedAt && (
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Updated {new Date(selectedAppt.requirements.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: '10px',
                padding: '1.25rem',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: '#0C4A6E'
              }}>
                {selectedAppt.requirements?.goals && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#0369A1', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Primary Goal / Focus
                    </strong>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedAppt.requirements.goals}</div>
                  </div>
                )}

                <div style={{ whiteSpace: 'pre-wrap', color: '#1E293B' }}>
                  {selectedAppt.requirements?.text || selectedAppt.message || 'No requirements text provided by client yet.'}
                </div>

                {selectedAppt.requirements?.specificQuestions && selectedAppt.requirements.specificQuestions.length > 0 && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed #BAE6FD' }}>
                    <strong style={{ color: '#0369A1', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Specific Questions for Session:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#0F172A' }}>
                      {selectedAppt.requirements.specificQuestions.map((q, idx) => (
                        <li key={idx} style={{ marginBottom: '0.2rem' }}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: POST-MEETING FOLLOW-UP & ACTION PLAN */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📝</span> Post-Meeting Follow-Up &amp; Client Action Plan
                </h3>
                {selectedAppt.followUp?.filled && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: selectedAppt.followUp.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                    color: selectedAppt.followUp.status === 'completed' ? '#166534' : '#92400E',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px'
                  }}>
                    {selectedAppt.followUp.status === 'completed' ? '✓ All Action Items Completed' : '⚡ Action Plan In Progress'}
                  </span>
                )}
              </div>

              {!selectedAppt.followUp || !selectedAppt.followUp.filled ? (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '1rem', color: '#92400E', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>⏳ Follow-Up Not Submitted Yet</div>
                  <div>
                    {selectedAppt.status === 'Completed'
                      ? 'The session has been marked Completed. The client has access to fill out their post-meeting follow-up and action items.'
                      : 'Once this session is conducted and marked "Completed", the client will be prompted to submit their session takeaways and task checklist.'}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem' }}>
                  {selectedAppt.followUp.keyTakeaways && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                        💡 Client Session Takeaways &amp; Key Notes:
                      </strong>
                      <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', color: '#1E293B', whiteSpace: 'pre-wrap' }}>
                        {selectedAppt.followUp.keyTakeaways}
                      </div>
                    </div>
                  )}

                  {/* Action Checklist */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>
                        Execution Tasks Checklist ({selectedAppt.followUp.actionItems?.filter(i => i.completed).length || 0} of {selectedAppt.followUp.actionItems?.length || 0} Done)
                      </strong>
                    </div>

                    {(!selectedAppt.followUp.actionItems || selectedAppt.followUp.actionItems.length === 0) ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', margin: 0 }}>No specific action items listed.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedAppt.followUp.actionItems.map((task) => (
                          <div 
                            key={task.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: task.completed ? '#F0FDF4' : '#FFFFFF',
                              border: `1px solid ${task.completed ? '#BBF7D0' : '#E2E8F0'}`,
                              borderRadius: '8px',
                              padding: '0.65rem 0.85rem',
                              gap: '0.75rem'
                            }}
                          >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flex: 1 }}>
                              <input 
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(selectedAppt._id, task.id, task.completed)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{
                                fontSize: '0.9rem',
                                color: task.completed ? '#166534' : '#1E293B',
                                textDecoration: task.completed ? 'line-through' : 'none',
                                fontWeight: task.completed ? 600 : 500
                              }}>
                                {task.title}
                              </span>
                            </label>
                            {task.completed && (
                              <span style={{ fontSize: '0.72rem', color: '#166534', background: '#DCFCE7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                                ✓ Completed
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: CLIENT FEEDBACK */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>⭐</span> Client Consultation Feedback &amp; Review
                </h3>
              </div>

              {!selectedAppt.feedback || !selectedAppt.feedback.filled ? (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', color: '#64748B', fontSize: '0.88rem' }}>
                  <span>🔒 Feedback not submitted yet. (Client gets feedback form after filling their post-session follow-up).</span>
                </div>
              ) : (
                <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '1.25rem', color: '#EAB308' }}>
                      {'★'.repeat(selectedAppt.feedback.rating)}{'☆'.repeat(5 - selectedAppt.feedback.rating)}
                    </div>
                    <strong style={{ fontSize: '0.95rem', color: '#6B21A8' }}>
                      {selectedAppt.feedback.rating} out of 5 Stars
                    </strong>
                    {selectedAppt.feedback.filledAt && (
                      <span style={{ fontSize: '0.75rem', color: '#7E22CE', marginLeft: 'auto' }}>
                        Submitted {new Date(selectedAppt.feedback.filledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#374151', lineHeight: '1.6', background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #D8B4FE' }}>
                    &ldquo;{selectedAppt.feedback.comment}&rdquo;
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  background: '#E2E8F0',
                  color: '#334155',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
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
