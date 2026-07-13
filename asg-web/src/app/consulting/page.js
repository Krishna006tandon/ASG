"use client";

import { useState } from 'react';
import styles from './consulting.module.css';

export default function Consulting() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const timeSlots = [
    "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"
  ];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBooking = async (e) => {
    e.preventDefault();
    if(!selectedDate || !selectedTime || !name || !email) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/consulting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, date: selectedDate, time: selectedTime, message })
      });
      
      if (!res.ok) throw new Error('Failed to book consultation');
      
      alert(`Consultation requested! Once the admin reviews it, you will receive a payment link to confirm your slot.`);
      
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
      setSelectedDate('');
      setSelectedTime('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>1-on-1 Consultation</h1>
        <p>Book a direct strategy session with Avinash to map out your startup's growth.</p>
      </header>

      <section className={styles.bookingEngine}>
        <div className={`glass-card ${styles.card}`}>
          <h2>Select Availability</h2>
          <form onSubmit={handleBooking} className={styles.form}>
            
            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="date">Choose a Date</label>
              <input 
                type="date" 
                id="date" 
                required 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Select Time Slot (IST)</label>
              <div className={styles.slotGrid}>
                {timeSlots.map((time) => (
                  <div 
                    key={time} 
                    className={`${styles.slot} ${selectedTime === time ? styles.selectedSlot : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="message">Reason for Consultation / Description</label>
              <textarea 
                id="message" 
                rows="3" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Briefly describe what you'd like to discuss..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className={styles.pricingInfo}>
              <span style={{ fontSize: '0.85rem' }}>* Charges will be applicable based on your requirements. The Admin will review your request and confirm the final fee.</span>
            </div>
            
            <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
              Proceed to Payment
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
