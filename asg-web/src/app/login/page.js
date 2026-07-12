"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('Authenticating...');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('Success! Redirecting to dashboard...');
        localStorage.setItem('asg_token', data.token);
        // Simulate redirect
        setTimeout(() => {
          window.location.href = data.user.role === 'admin' ? '/admin' : '/';
        }, 1500);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Network error. Please try again.');
    }
  };

  return (
    <main className={styles.main}>
      <div className={`glass-card ${styles.authCard}`}>
        <div className={styles.header}>
          <h2>Welcome Back</h2>
          <p>Sign in to access your consultations, orders, and webinars.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="you@example.com"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>
          
          <div className={styles.options}>
            <label className={styles.remember}>
              <input type="checkbox" /> Remember me
            </label>
            <Link href="#" className={styles.forgot}>Forgot password?</Link>
          </div>
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign In
          </button>
          
          {status && <div className={styles.statusMsg}>{status}</div>}
        </form>

        <div className={styles.footer}>
          <p>Don't have an account? <Link href="/register">Register here</Link></p>
        </div>
      </div>
    </main>
  );
}
