"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/login.module.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no token is provided in the URL
  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '0.75rem' }}>
          Invalid Reset Link
        </h3>
        <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          This password reset link is invalid, incomplete, or missing a token. Please request a new link.
        </p>
        <Link href="/forgot-password" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.85rem' }}>
          Request a New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setIsSuccess(false);
      setStatus('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsSuccess(false);
      setStatus('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Updating password...');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setStatus('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1800);
      } else {
        setIsSuccess(false);
        setStatus(data.error || 'Failed to update password. Your reset link may have expired.');
      }
    } catch (err) {
      setIsSuccess(false);
      setStatus('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSuccess ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <div className={styles.statusMsg} style={{ marginBottom: '1.5rem', background: '#D1FAE5', color: '#059669' }}>
            {status}
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Taking you to the login screen now...
          </p>
          <Link href="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.85rem' }}>
            Go to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Re-enter your new password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className={`btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating Password...' : 'Save New Password'}
          </button>

          {status && (
            <div
              className={styles.statusMsg}
              style={{
                background: isSuccess ? '#D1FAE5' : '#FEE2E2',
                color: isSuccess ? '#059669' : '#DC2626'
              }}
            >
              {status}
            </div>
          )}

          {!isSuccess && status && status.toLowerCase().includes('expired') && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link href="/forgot-password" style={{ color: '#7942B5', fontWeight: '600', fontSize: '0.9rem' }}>
                &rarr; Request a fresh reset link
              </Link>
            </div>
          )}
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className={styles.main}>
      <div className={`glass-card ${styles.authCard}`}>
        <div className={styles.header}>
          <h2>Set New Password</h2>
          <p>Please enter your new password below.</p>
        </div>

        <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className={styles.footer}>
          <p>Remember your password? <Link href="/login">Sign in here</Link></p>
        </div>
      </div>
    </main>
  );
}
