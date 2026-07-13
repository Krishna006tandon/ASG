"use client";

import { useState, useEffect } from 'react';
import styles from './adminWebinars.module.css';

export default function AdminWebinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [seatsTotal, setSeatsTotal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const res = await fetch('/api/admin/webinars');
      if (!res.ok) throw new Error('Failed to fetch webinars');
      const data = await res.json();
      setWebinars(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebinar = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/admin/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date, time, price, seatsTotal })
      });
      
      if (!res.ok) throw new Error('Failed to add webinar');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setPrice('');
      setSeatsTotal('');
      
      // Refresh catalog
      fetchWebinars();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this masterclass?')) return;
    
    try {
      const res = await fetch(`/api/admin/webinars/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete webinar');
      fetchWebinars();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.container}><h2>Loading Webinars...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Webinar & Masterclass Manager</h1>
        <p>Schedule live sessions and manage available seats.</p>
      </div>

      <div className={styles.grid}>
        {/* Left Side: Add New Webinar */}
        <div className={styles.card}>
          <h2>Schedule New Masterclass</h2>
          <form onSubmit={handleAddWebinar} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Webinar Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            </div>
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Time (e.g. 6:00 PM IST)</label>
                <input type="text" value={time} onChange={(e) => setTime(e.target.value)} required placeholder="e.g. 10:00 AM - 12:00 PM" />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Ticket Price (₹)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Total Seats Capacity</label>
                <input type="number" min="1" value={seatsTotal} onChange={(e) => setSeatsTotal(e.target.value)} required />
              </div>
            </div>
            
            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Masterclass'}
            </button>
          </form>
        </div>

        {/* Right Side: Current Webinars */}
        <div className={`${styles.card} ${styles.inventoryCard}`}>
          <h2>Scheduled Masterclasses</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Session details</th>
                  <th>Pricing</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {webinars.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>No upcoming webinars.</td>
                  </tr>
                ) : (
                  webinars.map(webinar => {
                    const remaining = webinar.seatsTotal - webinar.seatsBooked;
                    return (
                      <tr key={webinar._id}>
                        <td>
                          <div style={{fontWeight: 600, color: '#111827'}}>{webinar.title}</div>
                          <div style={{fontSize: '0.85rem', color: '#6B7280'}}>
                            {new Date(webinar.date).toLocaleDateString()} at {webinar.time}
                          </div>
                        </td>
                        <td style={{fontWeight: 500}}>₹{webinar.price}</td>
                        <td>
                          <span className={remaining > 0 ? styles.inStock : styles.outOfStock}>
                            {remaining} seats left
                          </span>
                          <div style={{fontSize: '0.75rem', color: '#9CA3AF'}}>of {webinar.seatsTotal} total</div>
                        </td>
                        <td>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(webinar._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
