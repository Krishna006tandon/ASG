"use client";

import { useState, useEffect, use } from 'react';
import styles from './ticket.module.css';

export default function TicketVerification({ params }) {
  const unwrappedParams = use(params);
  const ticketNumber = unwrappedParams.ticketNumber;
  const [ticket, setTicket] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('asg_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(`/api/ticket/${ticketNumber}`, { headers });
      if (!res.ok) {
        throw new Error('Invalid or fake ticket.');
      }
      const data = await res.json();
      setTicket(data.ticket);
      setIsAdmin(data.isAdmin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketNumber]);

  const handleCheckIn = async () => {
    if (!confirm("Are you sure you want to admit this attendee? This will mark the ticket as USED.")) return;
    
    setCheckInLoading(true);
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch('/api/admin/seminars/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ticketNumber })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert("Attendee Admitted Successfully!");
      fetchTicket(); // refresh ticket state to show as Used
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.container}><h3>Verifying Ticket...</h3></div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.invalidCard}>
          <div className={styles.icon}>❌</div>
          <h2>INVALID TICKET</h2>
          <p>This ticket number ({ticketNumber}) does not exist in our system.</p>
        </div>
      </div>
    );
  }

  // Already Scanned / Used Ticket
  if (ticket.checkedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.invalidCard} style={{ borderTopColor: '#F59E0B' }}>
          <div className={styles.icon}>⚠️</div>
          <h2 style={{ color: '#F59E0B' }}>TICKET ALREADY SCANNED</h2>
          <p>This ticket was already used to admit an attendee.</p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#FEF3C7', borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
            <strong>Scanned At:</strong><br />
            {new Date(ticket.checkedInAt).toLocaleString()}
            <br /><br />
            <strong>Original Attendee:</strong><br />
            {ticket.registrationData?.name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.validCard}>
        <div className={styles.header}>
          <div className={styles.icon}>✅</div>
          <h2>VALID TICKET</h2>
        </div>
        
        <div className={styles.ticketDetails}>
          <div className={styles.row}>
            <span className={styles.label}>Ticket Number</span>
            <span className={styles.value} style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '2px', color: '#059669' }}>
              {ticket.ticketNumber}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Attendee Name</span>
            <span className={styles.value}>{ticket.registrationData?.name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Event Title</span>
            <span className={styles.value}>{ticket.seminarId?.title}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Date & Time</span>
            <span className={styles.value}>
              {new Date(ticket.seminarId?.date).toLocaleDateString()} at {ticket.seminarId?.time}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Payment Status</span>
            <span className={styles.badge}>{ticket.paymentStatus}</span>
          </div>
        </div>

        {isAdmin ? (
          <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <button 
              onClick={handleCheckIn}
              disabled={checkInLoading}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {checkInLoading ? 'Processing...' : 'ADMIT ATTENDEE (SCAN)'}
            </button>
          </div>
        ) : (
          <div className={styles.footer}>
            This ticket is verified by the ASG System.
          </div>
        )}
      </div>
    </div>
  );
}
