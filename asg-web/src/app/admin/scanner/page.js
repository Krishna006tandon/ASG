"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import styles from './scanner.module.css';

// Audio feedback helper
const playFeedback = (type) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'verified') {
      // Pleasant 2-tone chime (Success)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      // Low dual buzzer (Error/Warning)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    // Audio might fail if not permitted by browser autoplay policy
  }
};

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'verified' | 'unverified' | 'event_over' | 'already_scanned'
  const [statusMessage, setStatusMessage] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [manualTicketInput, setManualTicketInput] = useState('');
  const scannerRef = useRef(null);

  // Parse ticket number from scanned string or URL
  const extractTicketNumber = (input) => {
    if (!input) return null;
    const text = String(input).trim();

    // Check if it's a URL or contains /ticket/
    if (text.includes('/ticket/')) {
      const parts = text.split('/ticket/');
      const candidate = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
      return candidate.toUpperCase();
    }

    try {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const url = new URL(text);
        const parts = url.pathname.split('/');
        return parts[parts.length - 1].split('?')[0].trim().toUpperCase();
      }
    } catch (e) {}

    return text.toUpperCase();
  };

  const processTicketVerification = useCallback(async (ticketNumber, rawText) => {
    setIsProcessing(true);
    setScanResult(rawText || ticketNumber);

    try {
      // Pause scanner while showing result
      if (scannerRef.current) {
        try {
          scannerRef.current.pause(true);
        } catch (e) {
          console.warn('Pause error:', e);
        }
      }

      if (!ticketNumber || !ticketNumber.startsWith('SEM-')) {
        setStatus('unverified');
        setStatusMessage('Invalid QR Code. This is not a valid ASG seminar ticket.');
        setTicketDetails(null);
        playFeedback('unverified');
        return;
      }

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

      if (res.ok && data.status === 'verified') {
        setStatus('verified');
        setStatusMessage(data.message || 'Attendee successfully admitted!');
        setTicketDetails(data.ticket);
        playFeedback('verified');
      } else if (data.status === 'already_scanned') {
        setStatus('already_scanned');
        setStatusMessage(data.error || 'Ticket has already been scanned/used!');
        setTicketDetails(data.ticket);
        playFeedback('already_scanned');
      } else if (data.status === 'event_over') {
        setStatus('event_over');
        setStatusMessage(data.error || 'Event Over: This event does not exist or has passed.');
        setTicketDetails(data.ticket);
        playFeedback('event_over');
      } else {
        // Any other unverified status
        setStatus('unverified');
        setStatusMessage(data.error || 'Unverified: Ticket is invalid or payment not completed.');
        setTicketDetails(data.ticket || null);
        playFeedback('unverified');
      }

    } catch (error) {
      console.error('Scanning error:', error);
      setStatus('unverified');
      setStatusMessage(error.message || 'Failed to verify ticket.');
      setTicketDetails(null);
      playFeedback('unverified');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onScanSuccess = useCallback((decodedText) => {
    if (isProcessing || scanResult) return;
    const ticketNumber = extractTicketNumber(decodedText);
    processTicketVerification(ticketNumber, decodedText);
  }, [isProcessing, scanResult, processTicketVerification]);

  const onScanFailure = useCallback(() => {
    // Keep quiet during regular scanning frames
  }, []);

  const resumeScanning = useCallback(() => {
    setScanResult(null);
    setStatus(null);
    setStatusMessage(null);
    setTicketDetails(null);
    setManualTicketInput('');
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {
        console.warn('Resume error:', e);
      }
    }
  }, []);

  // Keyboard shortcut: Press Space or Enter to resume scanning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scanResult && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        resumeScanning();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanResult, resumeScanning]);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 260, height: 260 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          rememberLastUsedCamera: true
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(err => {
            console.warn("Async clear error: ", err);
          });
        } catch (err) {
          console.warn("Sync clear error: ", err);
        }
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanFailure]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicketInput.trim()) return;
    const ticketNumber = extractTicketNumber(manualTicketInput);
    processTicketVerification(ticketNumber, manualTicketInput.trim());
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>QR Ticket Verification Scanner</h1>
        <p>Point camera at attendee's ticket or enter ticket number to verify admission.</p>
      </div>

      <div className={styles.scannerWrapper}>
        <div id="qr-reader" className={styles.qrReader}></div>
        
        {scanResult && (
          <div className={`${styles.resultOverlay} ${
            status === 'verified' ? styles.verifiedBg :
            status === 'event_over' ? styles.eventOverBg :
            status === 'already_scanned' ? styles.alreadyScannedBg :
            styles.unverifiedBg
          }`}>
            
            {status === 'verified' && (
              <>
                <div className={styles.statusIcon}>✅</div>
                <h2 className={styles.statusTitle}>VERIFIED</h2>
                <p className={styles.statusSubtitle}>{statusMessage}</p>

                {ticketDetails && (
                  <div className={styles.ticketInfoCard}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Ticket No:</span>
                      <span className={styles.infoValue} style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                        {ticketDetails.ticketNumber}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Attendee:</span>
                      <span className={styles.infoValue}>{ticketDetails.attendeeName}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Workshop:</span>
                      <span className={styles.infoValue}>{ticketDetails.seminarTitle}</span>
                    </div>
                    {ticketDetails.seminarDate && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Date & Time:</span>
                        <span className={styles.infoValue}>
                          {new Date(ticketDetails.seminarDate).toLocaleDateString()} at {ticketDetails.seminarTime}
                        </span>
                      </div>
                    )}
                    {ticketDetails.locationAddress && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Venue:</span>
                        <span className={styles.infoValue}>📍 {ticketDetails.locationAddress}</span>
                      </div>
                    )}
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Check-in Status:</span>
                      <span className={styles.infoValue} style={{ color: '#D1FAE5' }}>✓ Admitted Just Now</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {status === 'already_scanned' && (
              <>
                <div className={styles.statusIcon}>⛔</div>
                <h2 className={styles.statusTitle}>ALREADY SCANNED</h2>
                <p className={styles.statusSubtitle}>{statusMessage}</p>

                {ticketDetails && (
                  <div className={styles.ticketInfoCard}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Ticket No:</span>
                      <span className={styles.infoValue} style={{ fontFamily: 'monospace' }}>
                        {ticketDetails.ticketNumber}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Attendee:</span>
                      <span className={styles.infoValue}>{ticketDetails.attendeeName}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Original Scan:</span>
                      <span className={styles.infoValue} style={{ color: '#FEE2E2' }}>
                        {ticketDetails.checkedInAt 
                          ? new Date(ticketDetails.checkedInAt).toLocaleString('en-IN') 
                          : 'Previously scanned'}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Action:</span>
                      <span className={styles.infoValue} style={{ color: '#FECACA' }}>
                        ⚠️ Second entry strictly forbidden
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {status === 'event_over' && (
              <>
                <div className={styles.statusIcon}>⚠️</div>
                <h2 className={styles.statusTitle}>EVENT OVER</h2>
                <p className={styles.statusSubtitle}>{statusMessage}</p>

                {ticketDetails && (
                  <div className={styles.ticketInfoCard}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Ticket No:</span>
                      <span className={styles.infoValue} style={{ fontFamily: 'monospace' }}>
                        {ticketDetails.ticketNumber}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Attendee:</span>
                      <span className={styles.infoValue}>{ticketDetails.attendeeName}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Event:</span>
                      <span className={styles.infoValue}>{ticketDetails.seminarTitle || 'Deleted Seminar'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Reason:</span>
                      <span className={styles.infoValue}>Event deleted or past scheduled date</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {status === 'unverified' && (
              <>
                <div className={styles.statusIcon}>❌</div>
                <h2 className={styles.statusTitle}>UNVERIFIED</h2>
                <p className={styles.statusSubtitle}>{statusMessage}</p>
                <p className={styles.scannedData}>Scanned Data: {scanResult}</p>
              </>
            )}

            <button className={styles.resumeBtn} onClick={resumeScanning}>
              SCAN NEXT TICKET [Space]
            </button>
          </div>
        )}
      </div>

      {/* Manual Entry Fallback */}
      <div className={styles.manualSection}>
        <h3>Manual Ticket Entry Fallback</h3>
        <form onSubmit={handleManualSubmit} className={styles.manualForm}>
          <input 
            type="text" 
            placeholder="Enter Ticket ID (e.g., SEM-123456)" 
            value={manualTicketInput} 
            onChange={(e) => setManualTicketInput(e.target.value)}
            className={styles.manualInput}
            disabled={isProcessing}
          />
          <button type="submit" className={styles.manualBtn} disabled={isProcessing || !manualTicketInput.trim()}>
            {isProcessing ? 'Verifying...' : 'Verify Ticket'}
          </button>
        </form>
      </div>
      
      <div className={styles.instructions}>
        <h3>Status Guide:</h3>
        <ul>
          <li><strong>VERIFIED:</strong> Valid ticket, admitted successfully. Ticket is marked as USED.</li>
          <li><strong>ALREADY SCANNED:</strong> Ticket was already used before. Second entry is blocked.</li>
          <li><strong>EVENT OVER:</strong> Event was deleted or the event date has already passed.</li>
          <li><strong>UNVERIFIED:</strong> Ticket not found, fake ticket, or payment not completed.</li>
        </ul>
      </div>
    </div>
  );
}
