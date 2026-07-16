"use client";

import { useState, useEffect } from 'react';
import styles from './webinarRegistrations.module.css';

export default function AdminWebinarRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch('/api/admin/webinar-registrations');
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
        <h1>Webinar Registrations</h1>
        <p>View all attendees who have registered for masterclasses.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Attendee Details</th>
                <th>Masterclass</th>
                <th>Profession / Role</th>
                <th>Payment</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No registrations found.</td>
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
                      <div className={styles.webinarTitle}>{reg.webinarId?.title || 'Deleted Webinar'}</div>
                      {reg.webinarId && (
                        <div className={styles.webinarDate}>
                          {new Date(reg.webinarId.date).toLocaleDateString()} at {reg.webinarId.time}
                        </div>
                      )}
                    </td>
                    <td>{reg.registrationData?.profession}</td>
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
