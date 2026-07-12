"use client";

import { useState } from 'react';
import styles from './consulting.module.css';

export default function Consulting() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const timeSlots = [
    "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    if(!selectedDate || !selectedTime) {
      alert("Please select both a date and a time slot.");
      return;
    }
    alert(`Consultation booked for ${selectedDate} at ${selectedTime}. You will be redirected to payment.`);
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

            <div className={styles.pricingInfo}>
              <span>Consultation Fee:</span>
              <span className={styles.price}>₹4,999 / hr</span>
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
