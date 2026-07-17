"use client";

import { useState, useEffect } from 'react';
import styles from './seminarRegistrations.module.css';

export default function AdminSeminarRegistrations() {
  const [registrations, setRegistrations] = useState([]);
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
        <p>View all attendees who have purchased tickets for physical seminars.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Attendee Details</th>
                <th>Ticket Number</th>
                <th>Seminar Event</th>
                <th>Payment</th>
                <th>Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No seminar registrations found.</td>
                </tr>
              ) : (
                registrations.map(reg => (
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
                      <div className={styles.seminarTitle}>{reg.seminarId?.title || 'Deleted Seminar'}</div>
                      {reg.seminarId && (
                        <div className={styles.seminarDate}>
                          {new Date(reg.seminarId.date).toLocaleDateString()} at {reg.seminarId.time}
                        </div>
                      )}
                      <div className={styles.seminarLocation}>📍 {reg.seminarId?.locationAddress}</div>
                    </td>
                    <td>
                      <div className={`${styles.statusBadge} ${reg.paymentStatus === 'Paid' ? styles.paid : styles.pending}`}>
                        {reg.paymentStatus}
                      </div>
                      {reg.amountPaid > 0 && <div className={styles.amount}>₹{reg.amountPaid}</div>}
                    </td>
                    <td className={styles.date}>
                      {new Date(reg.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
