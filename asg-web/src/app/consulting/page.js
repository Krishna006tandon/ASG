"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmailOtpModal from '@/components/EmailOtpModal';
import styles from './consulting.module.css';

export default function Consulting() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const timeSlots = [
    "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"
  ];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [questions, setQuestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Auto-populate user details if logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('asg_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch (e) {}
  }, []);

  const handleBooking = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDate || !selectedTime || !name || !email || !requirements) {
      alert("Please fill in all required fields including your consultation requirements.");
      return;
    }
    
    // Check if email OTP is verified
    if (!isOtpVerified) {
      setShowOtpModal(true);
      return;
    }

    executeConsultationBooking();
  };

  const handleOtpVerified = () => {
    setIsOtpVerified(true);
    executeConsultationBooking();
  };

  const executeConsultationBooking = async () => {
    setIsSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('asg_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const specificQuestionsList = questions
        .split('\n')
        .map(q => q.trim())
        .filter(Boolean);

      const res = await fetch('/api/consulting', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          name, 
          email, 
          phone,
          date: selectedDate, 
          time: selectedTime, 
          message: requirements,
          requirements,
          specificQuestions: specificQuestionsList
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book consultation');
      
      setBookingSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>1-on-1 Strategy Consultation</h1>
        <p>Book a direct advisory session with Avinash S. Gore. Share your requirements and strategic goals to get tailored mentorship.</p>
      </header>

      <section className={styles.bookingEngine}>
        <div className={`glass-card ${styles.card}`}>
          {bookingSuccess ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ color: '#166534', marginBottom: '0.5rem' }}>Consultation &amp; Requirements Submitted!</h2>
              <p style={{ color: '#374151', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                Your session requirements have been sent to <strong>Avinash S. Gore</strong> and our advisory team.
                We will review your goals, confirm the session slot, and notify you with the meeting link.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  href="/dashboard?tab=consultations" 
                  className="btn-primary" 
                  style={{ textDecoration: 'none', padding: '0.75rem 1.75rem', fontWeight: 700 }}
                >
                  View in My Dashboard &rarr;
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccess(false);
                    setRequirements('');
                    setQuestions('');
                    setSelectedDate('');
                    setSelectedTime('');
                  }}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Book Another Session
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2>Consultation Details &amp; Requirements</h2>
              <form onSubmit={handleBooking} className={styles.form}>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Full Name *</label>
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
                  <label htmlFor="email">Email Address *</label>
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
                  <label htmlFor="phone">Phone / WhatsApp Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="date">Choose Preferred Date *</label>
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
                  <label>Select Time Slot (IST) *</label>
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

                {/* Pre-session Requirements Section */}
                <div className={styles.inputGroup}>
                  <label htmlFor="requirements" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>📋</span> Session Requirements &amp; Discussion Goals *
                  </label>
                  <textarea 
                    id="requirements" 
                    rows="4" 
                    required
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Explain your situation, venture background, or specific problems where you need guidance and clarity..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      fontSize: '0.95rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      resize: 'vertical'
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                    💡 Admin reviews these requirements before confirming and conducting your consultation.
                  </span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="questions" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🎯</span> Specific Questions for Avinash Gore (Optional)
                  </label>
                  <textarea 
                    id="questions" 
                    rows="3" 
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                    placeholder="Enter 1-3 specific questions (one per line)..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      fontSize: '0.95rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className={styles.pricingInfo}>
                  <span style={{ fontSize: '0.85rem' }}>
                    * Charges will be applicable based on your requirements. The Admin will review your requirements and confirm the final fee and meeting link.
                  </span>
                </div>
                
                <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Requirements...' : 'Submit Consultation Request'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <EmailOtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={email}
        name={name}
        purpose="consultation"
        purposeLabel="1-on-1 Strategy Consultation"
        onVerified={handleOtpVerified}
      />
    </main>
  );
}
