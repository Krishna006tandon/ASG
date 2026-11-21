"use client";

import { useState, useEffect, use } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './ticket.module.css';

export default function TicketVerification({ params }) {
  const unwrappedParams = use(params);
  const ticketNumber = unwrappedParams.ticketNumber;
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState(null); // 'verified' | 'unverified' | 'event_over' | 'already_scanned'
  const [statusReason, setStatusReason] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('asg_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(`/api/ticket/${ticketNumber}`, { headers });
      const data = await res.json();

      if (!res.ok && !data.ticket) {
        setStatus('unverified');
        setError(data.error || 'Invalid or fake ticket.');
        return;
      }

      setTicket(data.ticket);
      setStatus(data.status || 'verified');
      setStatusReason(data.statusReason || '');
      setIsAdmin(data.isAdmin);
    } catch (err) {
      setStatus('unverified');
      setError(err.message || 'Failed to verify ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketNumber]);

  const handleCheckIn = async () => {
    if (!confirm("Are you sure you want to admit this attendee? This will mark the ticket as USED and prevent any future scans.")) return;
    
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
      if (!res.ok) throw new Error(data.error || 'Check-in failed');
      
      alert("✅ Attendee Admitted Successfully! Ticket is now marked as USED.");
      fetchTicket(); // refresh ticket state to show as already scanned
    } catch (err) {
      alert("Check-in failed: " + err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', color: '#4B5563' }}>
          <h3>Verifying Ticket...</h3>
        </div>
      </div>
    );
  }

  // UNVERIFIED: Ticket Not Found / Fake
  if (status === 'unverified' || !ticket) {
    return (
      <div className={styles.container}>
        <div className={`${styles.ticketCard} ${styles.unverifiedBorder}`}>
          <div className={`${styles.header} ${styles.headerUnverified}`}>
            <div className={styles.icon}>❌</div>
            <h2>UNVERIFIED TICKET</h2>
            <p className={styles.statusDesc}>{error || statusReason || 'This ticket number does not exist in our system.'}</p>
          </div>
          <div className={styles.ticketDetails}>
            <div className={styles.row}>
              <span className={styles.label}>Ticket Number</span>
              <span className={styles.ticketNumberDisplay}>{ticketNumber}</span>
            </div>
          </div>
          <div className={styles.footer}>
            ASG Security: Please consult the event registration desk.
          </div>
        </div>
      </div>
    );
  }

  const qrUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ticket/${ticket.ticketNumber}` 
    : `https://avinashsgore.com/ticket/${ticket.ticketNumber}`;

  return (
    <div className={styles.container}>
      <div className={`${styles.ticketCard} ${
        status === 'verified' ? styles.validBorder :
        status === 'already_scanned' ? styles.alreadyScannedBorder :
        status === 'event_over' ? styles.eventOverBorder :
        styles.unverifiedBorder
      }`}>
        
        {/* Header based on status */}
        {status === 'verified' && (
          <div className={`${styles.header} ${styles.headerVerified}`}>
            <div className={styles.icon}>✅</div>
            <h2>VERIFIED TICKET</h2>
            <p className={styles.statusDesc}>Official pass is valid and ready for admission</p>
          </div>
        )}

        {status === 'already_scanned' && (
          <div className={`${styles.header} ${styles.headerAlreadyScanned}`}>
            <div className={styles.icon}>⛔</div>
            <h2>ALREADY SCANNED / USED</h2>
            <p className={styles.statusDesc}>This ticket has already been used to admit an attendee</p>
          </div>
        )}

        {status === 'event_over' && (
          <div className={`${styles.header} ${styles.headerEventOver}`}>
            <div className={styles.icon}>⚠️</div>
            <h2>EVENT OVER</h2>
            <p className={styles.statusDesc}>
              {!ticket.seminarId 
                ? 'This seminar event has been deleted and no longer exists' 
                : 'This seminar event has already ended'}
            </p>
          </div>
        )}

        {/* Website QR Code Display */}
        <div className={styles.qrSection}>
          <div className={styles.qrWrapper}>
            <QRCodeCanvas 
              value={qrUrl}
              size={180}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"Q"}
              includeMargin={true}
            />
            {status === 'already_scanned' && (
              <div className={styles.qrStamp}>USED / SCANNED</div>
            )}
            {status === 'event_over' && (
              <div className={styles.qrEventOverStamp}>EVENT OVER</div>
            )}
          </div>
          <div className={styles.ticketNumberDisplay}>
            {ticket.ticketNumber}
          </div>
          <div className={styles.qrCaption}>
            {status === 'verified' && '📱 Present this QR Code at the entry desk for scanning'}
            {status === 'already_scanned' && '❌ Cannot be scanned again (Entry already registered)'}
            {status === 'event_over' && '⚠️ Event is over or deleted'}
          </div>
        </div>

        {/* Ticket & Attendee Details */}
        <div className={styles.ticketDetails}>
          <div className={styles.row}>
            <span className={styles.label}>Attendee Name</span>
            <span className={styles.value}>{ticket.registrationData?.name}</span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Course / Workshop</span>
            <span className={styles.value}>
              {ticket.seminarId?.title || <span style={{ color: '#D97706' }}>Deleted Event</span>}
            </span>
          </div>

          {ticket.seminarId && (
            <>
              <div className={styles.row}>
                <span className={styles.label}>Date & Time</span>
                <span className={styles.value}>
                  {new Date(ticket.seminarId.date).toLocaleDateString()} at {ticket.seminarId.time}
                </span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>Venue</span>
                <span className={styles.value}>📍 {ticket.seminarId.locationAddress}</span>
              </div>
            </>
          )}

          <div className={styles.row}>
            <span className={styles.label}>Payment Status</span>
            <span className={`${styles.badge} ${ticket.paymentStatus === 'Paid' ? styles.badgePaid : styles.badgePending}`}>
              {ticket.paymentStatus}
            </span>
          </div>
        </div>

        {/* Scan notice if already scanned */}
        {status === 'already_scanned' && (
          <div className={styles.scanNotice}>
            <strong>⚠️ Entry Already Granted:</strong>
            Scanned on {ticket.checkedInAt 
              ? new Date(ticket.checkedInAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
              : 'Earlier'}
            <br />
            Duplicate admission with the same QR ticket is strictly prevented.
          </div>
        )}

        {/* Admin Check-in button */}
        {isAdmin && status === 'verified' && (
          <div className={styles.adminAction}>
            <button 
              onClick={handleCheckIn}
              disabled={checkInLoading}
              className={styles.admitBtn}
            >
              {checkInLoading ? 'Admitting...' : '✓ ADMIT ATTENDEE (SCAN)'}
            </button>
          </div>
        )}

        <div className={styles.footer}>
          Official Verification Portal &middot; Avinash S. Gore (ASG)
        </div>
      </div>
    </div>
  );
}
