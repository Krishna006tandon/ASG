"use client";

import { useState } from 'react';
import styles from './contact.module.css';

export default function Contact() {
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate backend alert count flash
    setStatus('Message sent successfully! We will get back to you shortly.');
    e.target.reset();
  };

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Contact Us</h1>
        <p>Reach out for consultation, masterclass inquiries, or business advice.</p>
      </header>

      <section className={styles.formSection}>
        <div className={`glass-card ${styles.formCard}`}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" required />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" required />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" required />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" required />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="message">Message</label>
              <textarea id="message" rows="5" required></textarea>
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Send Message
            </button>
            
            {status && <div className={styles.alert}>{status}</div>}
          </form>
        </div>
      </section>
    </main>
  );
}
