"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './EmailOtpModal.module.css';

export default function EmailOtpModal({
  isOpen,
  onClose,
  email,
  name = '',
  purpose = 'booking',
  purposeLabel = 'Booking / Purchase',
  onVerified
}) {
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [otpSent, setOtpSent] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Send OTP when modal opens with a valid email
  useEffect(() => {
    if (isOpen && email && !otpSent) {
      sendOtp();
    }
  }, [isOpen, email]);

  // Handle countdown timer for resend
  useEffect(() => {
    if (countdown > 0 && otpSent) {
      timerRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown, otpSent]);

  // Auto focus input when modal is ready
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else {
      // Reset state when closed
      setOtp('');
      setError('');
      setSuccess(false);
      setOtpSent(false);
      setCountdown(30);
    }
  }, [isOpen]);

  const sendOtp = async () => {
    if (!email) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose, name })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setOtpSent(true);
      setCountdown(30);
    } catch (err) {
      setError(err.message || 'Could not send verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: cleanOtp, purpose })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Incorrect code.');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onVerified) onVerified();
        onClose();
      }, 700);

    } catch (err) {
      setError(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    setError('');
    // Auto-verify when 6 digits are typed or pasted
    if (val.length === 6) {
      setTimeout(() => {
        // Trigger verification
        verifyCodeDirect(val);
      }, 50);
    }
  };

  const verifyCodeDirect = async (code) => {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, purpose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed.');
      setSuccess(true);
      setTimeout(() => {
        if (onVerified) onVerified();
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Incorrect verification code.');
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          className={styles.closeBtn} 
          aria-label="Close Verification"
          disabled={verifying}
        >
          ✕
        </button>

        <div className={styles.iconCircle}>
          {success ? '✓' : '✉️'}
        </div>

        <h3 className={styles.title}>
          {success ? 'Email Verified!' : 'Verify Your Email'}
        </h3>
        <div className={styles.purposeBadge}>
          {purposeLabel}
        </div>

        <p className={styles.subtitle}>
          {sending ? (
            <span>Sending verification code to <strong className={styles.emailHighlight}>{email}</strong>...</span>
          ) : (
            <span>
              Enter the 6-digit OTP code sent to{' '}
              <strong className={styles.emailHighlight}>{email}</strong>
            </span>
          )}
        </p>

        {error && (
          <div className={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className={styles.successBanner}>
            🎉 Verification successful! Completing your request...
          </div>
        )}

        {!success && (
          <form onSubmit={handleVerify}>
            <div className={styles.otpInputContainer}>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="••••••"
                className={styles.otpInput}
                disabled={verifying || sending}
              />
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || verifying || sending}
              className={styles.verifyBtn}
            >
              {verifying ? 'Verifying Code...' : 'Verify & Continue →'}
            </button>

            <div className={styles.footerRow}>
              <span>Didn&apos;t get the code?</span>
              <button
                type="button"
                onClick={sendOtp}
                disabled={countdown > 0 || sending || verifying}
                className={styles.resendBtn}
              >
                {sending ? 'Sending...' : countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
              </button>
            </div>

            <div className={styles.securityNote}>
              🔒 Secure email verification ensures genuine bookings and prevents unauthorized submissions.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
