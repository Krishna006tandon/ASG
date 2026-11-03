"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setStatus('Sending reset link...');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setStatus(data.message || 'If that email is registered, a password reset link has been sent. Please check your inbox.');
      } else {
        setIsSuccess(false);
        setStatus(data.error || 'Unable to process request. Please try again.');
      }
    } catch (err) {
      setIsSuccess(false);
      setStatus('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={`glass-card ${styles.authCard}`}>
        <div className={styles.header}>
          <h2>Forgot Password</h2>
          <p>Enter the email address registered with your account and we&apos;ll send you a password reset link.</p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <div className={styles.statusMsg} style={{ marginBottom: '1.5rem', textAlign: 'left', lineHeight: '1.5' }}>
              {status}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                type="button" 
                onClick={() => { setIsSuccess(false); setStatus(''); }} 
                className="btn-secondary"
                style={{ padding: '0.75rem', width: '100%' }}
              >
                Try Another Email
              </button>
              <Link href="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.75rem' }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Registered Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className={`btn-primary ${styles.submitBtn}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
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
          </form>
        )}

        <div className={styles.footer}>
          <p>Remember your password? <Link href="/login">Sign in here</Link></p>
        </div>
      </div>
    </main>
  );
}
