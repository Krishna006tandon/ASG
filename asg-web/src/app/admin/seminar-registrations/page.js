"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './seminarRegistrations.module.css';

export default function AdminSeminarRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [selectedQrReg, setSelectedQrReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch('/api/admin/seminar-registrations');
        if (!res.ok) throw new Error('Failed to fetch registrations');
        const data = await res.json();
        setRegistrations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistrations();
  }, []);

  if (loading) return <div className={styles.container}><h2>Loading Registrations...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Seminar Ticket Holders</h1>
        <p>View all attendees who have purchased tickets for physical seminars and manage their verification status.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Attendee Details</th>
                <th>Ticket Number</th>
                <th>Workshop / Course</th>
                <th>Payment</th>
                <th>Check-in Status</th>
                <th>QR & Action</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No seminar registrations found.</td>
                </tr>
              ) : (
                registrations.map(reg => {
                  const isEventOver = !reg.seminarId;
                  const isCheckedIn = reg.checkedIn;

                  return (
                    <tr key={reg._id}>
                      <td>
                        <div className={styles.name}>{reg.registrationData?.name}</div>
                        <div className={styles.contact}>{reg.registrationData?.email}</div>
                        <div className={styles.contact}>📞 {reg.registrationData?.whatsapp}</div>
                      </td>
                      <td>
                        <div className={styles.ticketBadge}>{reg.ticketNumber}</div>
                      </td>
                      <td>
                        <div className={styles.seminarTitle}>{reg.seminarId?.title || <span style={{ color: '#D97706' }}>Deleted Seminar</span>}</div>
                        {reg.seminarId && (
                          <div className={styles.seminarDate}>
                            {new Date(reg.seminarId.date).toLocaleDateString()} at {reg.seminarId.time}
                          </div>
                        )}
                        <div className={styles.seminarLocation}>📍 {reg.seminarId?.locationAddress || 'N/A'}</div>
                      </td>
                      <td>
                        <div className={`${styles.statusBadge} ${reg.paymentStatus === 'Paid' ? styles.paid : styles.pending}`}>
                          {reg.paymentStatus}
                        </div>
                        {reg.amountPaid > 0 && <div className={styles.amount}>₹{reg.amountPaid}</div>}
                      </td>
                      <td>
                        {isCheckedIn ? (
                          <div>
                            <span className={`${styles.statusBadge} ${styles.checkedInBadge}`}>
                              ⛔ Scanned (Used)
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                              {new Date(reg.checkedInAt).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ) : isEventOver ? (
                          <span className={`${styles.statusBadge} ${styles.eventOverBadge}`}>
                            ⚠️ Event Over
                          </span>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.verifiedBadge}`}>
                            ✓ Verified (Active)
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button 
                            className={styles.qrBtn}
                            onClick={() => setSelectedQrReg(reg)}
                          >
                            📱 View QR
                          </button>
                          <Link 
                            href={`/ticket/${reg.ticketNumber}`} 
                            target="_blank"
                            style={{ 
                              padding: '0.4rem 0.6rem', 
                              fontSize: '0.8rem', 
                              background: '#F1F5F9', 
                              borderRadius: '6px', 
                              color: '#334155', 
                              textDecoration: 'none',
                              fontWeight: '600',
                              border: '1px solid #CBD5E1'
                            }}
                          >
                            Ticket ↗
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin QR Code Modal */}
      {selectedQrReg && (
        <div className={styles.modalOverlay} onClick={() => setSelectedQrReg(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Attendee QR Pass</h3>
              <button className={styles.closeModalBtn} onClick={() => setSelectedQrReg(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ 
                position: 'relative', 
                background: 'white', 
                padding: '1rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0'
              }}>
                <QRCodeCanvas 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ticket/${selectedQrReg.ticketNumber}`}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"}
                  includeMargin={true}
                />
                {selectedQrReg.checkedIn && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-18deg)',
                    background: 'rgba(220, 38, 38, 0.92)', color: 'white', padding: '0.3rem 1rem',
                    borderRadius: '6px', fontSize: '1rem', fontWeight: '900', letterSpacing: '1px',
                    border: '2px solid white', pointerEvents: 'none', whiteSpace: 'nowrap'
                  }}>
                    USED / SCANNED
                  </div>
                )}
                {!selectedQrReg.seminarId && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-18deg)',
                    background: 'rgba(217, 119, 6, 0.92)', color: 'white', padding: '0.3rem 1rem',
                    borderRadius: '6px', fontSize: '1rem', fontWeight: '900', letterSpacing: '1px',
                    border: '2px solid white', pointerEvents: 'none', whiteSpace: 'nowrap'
                  }}>
                    EVENT OVER
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}>
                {selectedQrReg.ticketNumber}
              </div>

              <div style={{ marginTop: '0.5rem', fontWeight: '600', color: '#1E293B' }}>
                {selectedQrReg.registrationData?.name}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
                {selectedQrReg.seminarId?.title || 'Deleted Event'}
              </div>

              <div style={{ marginTop: '1rem' }}>
                {selectedQrReg.checkedIn ? (
                  <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    ⛔ Already Scanned / Used ({new Date(selectedQrReg.checkedInAt).toLocaleString('en-IN')})
                  </span>
                ) : !selectedQrReg.seminarId ? (
                  <span style={{ color: '#D97706', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    ⚠️ Event Over / Deleted
                  </span>
                ) : (
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    ✅ Verified & Ready to Scan
                  </span>
                )}
              </div>

              <div style={{ marginTop: '1.25rem', width: '100%' }}>
                <Link 
                  href={`/ticket/${selectedQrReg.ticketNumber}`}
                  target="_blank"
                  style={{
                    display: 'block',
                    padding: '0.65rem 1rem',
                    background: '#4F46E5',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  Open Full Ticket Page ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
