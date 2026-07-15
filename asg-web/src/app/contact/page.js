"use client";

import { useState } from 'react';
import styles from './contact.module.css';
import Link from 'next/link';

export default function Contact() {
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Message sent successfully! We will get back to you shortly.');
    e.target.reset();
  };

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Contact Us</h1>
        <p>Reach out for masterclass inquiries, business advice, or direct consultations.</p>
      </header>

      <section className={styles.formSection}>
        {/* Left Side: Contact Form */}
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

        {/* Right Side: Consultation CTA */}
        <div className={`glass-card ${styles.formCard} ${styles.ctaCard}`}>
          <h2 style={{fontSize: '1.75rem', marginBottom: '1rem', color: '#111827'}}>Looking for direct advice?</h2>
          <p style={{color: '#4B5563', lineHeight: '1.7', marginBottom: '1.5rem'}}>
            Sometimes an email isn't enough to solve complex business and financial challenges. 
            Book a dedicated <strong>1-on-1 Consultation</strong> to dive deep into your startup strategy, 
            e-commerce scaling, or financial planning.
          </p>
          <ul style={{listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: '#374151', lineHeight: '2'}}>
            <li>✅ Personalized Strategy Sessions</li>
            <li>✅ Direct access to expert frameworks</li>
            <li>✅ Dedicated Zoom video call</li>
            <li>✅ Follow-up action plans</li>
          </ul>
          <Link href="/consulting" className="btn-accent" style={{display: 'block', textAlign: 'center', width: '100%'}}>
            Book a 1-on-1 Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
