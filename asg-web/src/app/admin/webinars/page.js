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
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [seatsTotal, setSeatsTotal] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const handleEditClick = (webinar) => {
    setEditingId(webinar._id);
    setTitle(webinar.title);
    setDescription(webinar.description);
    // Date input expects YYYY-MM-DD
    const d = new Date(webinar.date);
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDate(dateString);
    setTime(webinar.time);
    setOriginalPrice(webinar.originalPrice || '');
    setPrice(webinar.price);
    setSeatsTotal(webinar.seatsTotal);
    setMeetingLink(webinar.meetingLink || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setOriginalPrice('');
    setPrice('');
    setSeatsTotal('');
    setMeetingLink('');
  };

  const handleAddWebinar = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingId ? `/api/admin/webinars/${editingId}` : '/api/admin/webinars';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date, time, originalPrice, price, seatsTotal, meetingLink })
      });
      
      if (!res.ok) throw new Error(editingId ? 'Failed to update webinar' : 'Failed to add webinar');
      
      // Reset form
      handleCancelEdit();
      
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
      if (editingId === id) handleCancelEdit();
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
          <h2>{editingId ? 'Edit Masterclass' : 'Schedule New Masterclass'}</h2>
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

            <div className={styles.inputGroup}>
              <label>Meeting Link (Zoom/Google Meet) - <span style={{fontWeight: 'normal', color: '#6B7280'}}>Users will see this in their dashboard after purchasing</span></label>
              <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://us02web.zoom.us/j/..." />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Original Price (₹)</label>
                <input type="number" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="e.g. 2000 (optional)" />
              </div>
              <div className={styles.inputGroup}>
                <label>Ticket Selling Price (₹)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Total Seats Capacity</label>
                <input type="number" min="1" value={seatsTotal} onChange={(e) => setSeatsTotal(e.target.value)} required />
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting} style={{flex: 1}}>
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Masterclass' : 'Publish Masterclass')}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary" style={{flex: 1}}>
                  Cancel
                </button>
              )}
            </div>
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
                        <td style={{display: 'flex', gap: '0.5rem'}}>
                          <button 
                            className="btn-secondary"
                            style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}
                            onClick={() => handleEditClick(webinar)}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}
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
