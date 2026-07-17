"use client";

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import styles from './scanner.module.css';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [hasError, setHasError] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only initialize once on mount
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          rememberLastUsedCamera: true
        },
        /* verbose= */ false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(error => {
            console.warn("Ignored async clear error: ", error);
          });
        } catch (error) {
          console.warn("Ignored sync clear error: ", error);
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const onScanSuccess = async (decodedText, decodedResult) => {
    // Prevent double scanning while processing
    if (isProcessing || scanResult) return;
    
    setIsProcessing(true);
    setScanResult(decodedText);
    
    try {
      // Extract ticketNumber from URL
      // Example URL: http://localhost:3000/ticket/SEM-123456
      const url = new URL(decodedText);
      const parts = url.pathname.split('/');
      const ticketNumber = parts[parts.length - 1];

      if (!ticketNumber || !ticketNumber.startsWith('SEM-')) {
        throw new Error("Invalid ASG Ticket QR Code");
      }

      // Pause the scanner to show result
      if (scannerRef.current) {
        scannerRef.current.pause(true);
      }

      // Check-in API Call
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
      
      if (!res.ok) {
        setHasError(true);
        setStatusMessage(data.error || "Check-in failed");
      } else {
        setHasError(false);
        setStatusMessage("✅ ADMITTED SUCCESSFULLY!");
      }

    } catch (error) {
      setHasError(true);
      setStatusMessage(error.message || "Invalid QR Code format.");
      if (scannerRef.current) {
        scannerRef.current.pause(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onScanFailure = (error) => {
    // Just ignore constant scan failures
  };

  const resumeScanning = () => {
    setScanResult(null);
    setStatusMessage(null);
    setTicketDetails(null);
    setHasError(false);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Live QR Ticket Scanner</h1>
        <p>Point camera at the attendee's ticket to admit them instantly.</p>
      </div>

      <div className={styles.scannerWrapper}>
        <div id="qr-reader" className={styles.qrReader}></div>
        
        {scanResult && (
          <div className={`${styles.resultOverlay} ${hasError ? styles.errorBg : styles.successBg}`}>
            <h2>{statusMessage}</h2>
            <p className={styles.scannedData}>Data: {scanResult}</p>
            <button className={styles.resumeBtn} onClick={resumeScanning}>
              SCAN NEXT TICKET
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.instructions}>
        <h3>Instructions:</h3>
        <ul>
          <li>Grant camera permissions when prompted by your browser.</li>
          <li>Hold the QR code 4-6 inches from the camera lens.</li>
          <li>Ensure adequate lighting for faster scanning.</li>
          <li>If the ticket is already scanned, a red warning will appear.</li>
        </ul>
      </div>
    </div>
  );
}
