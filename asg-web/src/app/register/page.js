"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus('Creating account...');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('Account created! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
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
          <h2>Create an Account</h2>
          <p>Join the Avinash Platform to book masterclasses and manage your orders.</p>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="John Doe"
            />
          </div>

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
              placeholder="Create a strong password"
            />
          </div>
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign Up
          </button>
          
          {status && <div className={styles.statusMsg}>{status}</div>}
        </form>

        <div className={styles.footer}>
          <p>Already have an account? <Link href="/login">Sign in here</Link></p>
        </div>
      </div>
    </main>
  );
}
