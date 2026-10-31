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
          <p>Manage 1-on-1 strategy consultations, entrepreneurial mentoring, and client inquiries.</p>
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
              <th>Session Status</th>
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
                      <select 
                        className={styles.statusSelect}
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt._id, 'status', e.target.value)}
                        disabled={updatingId === appt._id}
                        style={{
                          fontWeight: 600,
                          borderColor: appt.status === 'Confirmed' ? '#10B981' : appt.status === 'Completed' ? '#3B82F6' : '#D1D5DB'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
                          onClick={() => setSelectedAppt(appt)}
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
          background: 'rgba(0,0,0,0.6)',
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
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
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

            <div style={{ marginBottom: '1rem' }}>
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
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
              {selectedAppt.customerDetails?.name}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
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

            {/* Direct Connect Buttons */}
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
                  href={`mailto:${selectedAppt.customerDetails.email}?subject=Regarding Your Start-up Guidance Session with Avinash S. Gore`}
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
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
              Enquiry Breakdown &amp; Discussion Points
            </h3>
            <div style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '1.25rem',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.86rem',
              lineHeight: '1.6',
              color: '#0F172A',
              marginBottom: '1.5rem'
            }}>
              {selectedAppt.message || 'No additional details provided.'}
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
