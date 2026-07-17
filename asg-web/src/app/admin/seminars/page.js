"use client";

import { useState, useEffect } from 'react';
import styles from './adminSeminars.module.css';

export default function AdminSeminars() {
  const [seminars, setSeminars] = useState([]);
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
  const [locationAddress, setLocationAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const res = await fetch('/api/admin/seminars');
      if (!res.ok) throw new Error('Failed to fetch seminars');
      const data = await res.json();
      setSeminars(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (seminar) => {
    setEditingId(seminar._id);
    setTitle(seminar.title);
    setDescription(seminar.description);
    // Date input expects YYYY-MM-DD
    const d = new Date(seminar.date);
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDate(dateString);
    setTime(seminar.time);
    setOriginalPrice(seminar.originalPrice || '');
    setPrice(seminar.price);
    setSeatsTotal(seminar.seatsTotal);
    setLocationAddress(seminar.locationAddress || '');
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
    setLocationAddress('');
  };

  const handleAddSeminar = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingId ? `/api/admin/seminars/${editingId}` : '/api/admin/seminars';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date, time, originalPrice, price, seatsTotal, locationAddress })
      });
      
      if (!res.ok) throw new Error(editingId ? 'Failed to update seminar' : 'Failed to add seminar');
      
      // Reset form
      handleCancelEdit();
      
      // Refresh catalog
      fetchSeminars();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seminar?')) return;
    
    try {
      const res = await fetch(`/api/admin/seminars/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete seminar');
      if (editingId === id) handleCancelEdit();
      fetchSeminars();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.container}><h2>Loading Seminars...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>In-Person Seminars Manager</h1>
        <p>Schedule physical events and manage venue capacity.</p>
      </div>

      <div className={styles.grid}>
        {/* Left Side: Add New Seminar */}
        <div className={styles.card}>
          <h2>{editingId ? 'Edit Seminar' : 'Schedule New Seminar'}</h2>
          <form onSubmit={handleAddSeminar} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Seminar Title</label>
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
                <label>Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Venue / Location Address</label>
              <input type="text" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} required placeholder="e.g. Taj Hotel, Mumbai" />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Original Price (₹)</label>
                <input type="number" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="e.g. 5000 (optional)" />
              </div>
              <div className={styles.inputGroup}>
                <label>Ticket Price (₹)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Total Seats Capacity</label>
                <input type="number" min="1" value={seatsTotal} onChange={(e) => setSeatsTotal(e.target.value)} required />
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting} style={{flex: 1}}>
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Seminar' : 'Publish Seminar')}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary" style={{flex: 1}}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Current Seminars */}
        <div className={`${styles.card} ${styles.inventoryCard}`}>
          <h2>Scheduled Seminars</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event details</th>
                  <th>Pricing</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {seminars.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>No upcoming seminars.</td>
                  </tr>
                ) : (
                  seminars.map(seminar => {
                    const remaining = seminar.seatsTotal - seminar.seatsBooked;
                    return (
                      <tr key={seminar._id}>
                        <td>
                          <div style={{fontWeight: 600, color: '#111827'}}>{seminar.title}</div>
                          <div style={{fontSize: '0.85rem', color: '#6B7280'}}>
                            {new Date(seminar.date).toLocaleDateString()} at {seminar.time}
                          </div>
                          <div style={{fontSize: '0.75rem', color: '#4B5563', marginTop: '0.2rem'}}>📍 {seminar.locationAddress}</div>
                        </td>
                        <td style={{fontWeight: 500}}>₹{seminar.price}</td>
                        <td>
                          <span className={remaining > 0 ? styles.inStock : styles.outOfStock}>
                            {remaining} seats left
                          </span>
                          <div style={{fontSize: '0.75rem', color: '#9CA3AF'}}>of {seminar.seatsTotal} total</div>
                        </td>
                        <td style={{display: 'flex', gap: '0.5rem'}}>
                          <button 
                            className="btn-secondary"
                            style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}
                            onClick={() => handleEditClick(seminar)}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}
                            onClick={() => handleDelete(seminar._id)}
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
