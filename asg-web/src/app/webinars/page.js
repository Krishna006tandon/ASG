"use client";

import { useState, useEffect } from 'react';
import styles from './webinar.module.css';

export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const res = await fetch('/api/admin/webinars');
        if (res.ok) {
          const data = await res.json();
          setWebinars(data);
        }
      } catch (error) {
        console.error("Failed to load webinars", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWebinars();
  }, []);

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Live Masterclasses</h1>
        <p>Book your seat for upcoming interactive sessions and transform your strategy.</p>
      </header>

      {loading ? (
        <div className={styles.loader}>Loading scheduled masterclasses...</div>
      ) : (
        <section className={styles.list}>
          {webinars.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No masterclasses are currently scheduled. Check back soon!</p>
          ) : (
            webinars.map((webinar) => {
              const remaining = webinar.seatsTotal - webinar.seatsBooked;
              return (
                <div key={webinar._id} className={`glass-card ${styles.webinarCard}`}>
                  <div className={styles.dateBlock}>
                    <span className={styles.month}>
                      {new Date(webinar.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className={styles.day}>
                      {new Date(webinar.date).getDate()}
                    </span>
                  </div>
                  
                  <div className={styles.content}>
                    <h2>{webinar.title}</h2>
                    <div className={styles.metaRow}>
                      <span className={styles.time}>🕒 {webinar.time}</span>
                      <span className={styles.seats}>🪑 {remaining} seats left</span>
                    </div>
                    <p className={styles.desc}>{webinar.desc}</p>
                  </div>
                  
                  <div className={styles.actionBlock}>
                    <div className={styles.price}>₹{webinar.price}</div>
                    <button 
                      className={`btn-primary ${styles.bookBtn}`}
                      disabled={remaining <= 0}
                      onClick={() => alert("Registration integration coming soon!")}
                    >
                      {remaining > 0 ? 'Book Seat' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}
    </main>
  );
}
