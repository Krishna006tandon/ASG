"use client";

import { useState, useEffect } from 'react';
import styles from '../orders/orders.module.css'; // Re-use the table styles from orders

export default function AppointmentsQueue() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.container}><h2>Loading Consultations...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Consulting Queue</h1>
        <p>Manage your 1-on-1 strategy sessions and client bookings.</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client Details</th>
              <th>Date & Time</th>
              <th>Meeting Status</th>
              <th>Charges (₹)</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No upcoming consultations.</td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt._id}>
                  <td>
                    <div style={{fontWeight: 600, color: '#111827'}}>{appt.customerDetails?.name || 'Unknown'}</div>
                    <div style={{fontSize: '0.85rem', color: '#6B7280'}}>{appt.customerDetails?.email || 'N/A'}</div>
                    {appt.message && (
                      <div style={{fontSize: '0.8rem', color: '#4B5563', marginTop: '0.5rem', fontStyle: 'italic', maxWidth: '200px'}}>
                        "{appt.message}"
                      </div>
                    )}
                    {appt.meetingLink && (
                      <div style={{marginTop: '0.5rem'}}>
                        <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.8rem', color: '#2D8CFF', textDecoration: 'underline'}}>
                          📹 Start Zoom Meeting
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{new Date(appt.date).toLocaleDateString()}</div>
                    <div style={{fontSize: '0.85rem', color: '#6B7280'}}>{appt.time}</div>
                  </td>
                  <td>
                    <select 
                      className={styles.statusSelect}
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt._id, 'status', e.target.value)}
                      disabled={updatingId === appt._id}
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
                      style={{ width: '80px' }}
                      defaultValue={appt.charges || ''}
                      placeholder="e.g. 2500"
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
                    <button 
                      onClick={() => handleDelete(appt._id)}
                      style={{ background: 'transparent', border: '1px solid #FCA5A5', color: '#EF4444', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer'}}
                    >
                      Delete
                    </button>
                    {updatingId === appt._id && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#6B7280' }}>...</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
