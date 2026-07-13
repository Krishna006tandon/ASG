"use client";

import { useState, useEffect } from 'react';
import styles from './ecommerce.module.css';

export default function EcommerceSettings() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      if (!res.ok) throw new Error('Failed to fetch catalog');
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price, stock })
      });
      
      if (!res.ok) throw new Error('Failed to add book');
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      
      // Refresh catalog
      fetchBooks();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete book');
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.container}><h2>Loading E-Commerce catalog...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>E-Commerce Catalog</h1>
        <p>Manage your professional literature, books, and digital products.</p>
      </div>

      <div className={styles.grid}>
        {/* Left Side: Add New Book */}
        <div className={styles.card}>
          <h2>Add New Item</h2>
          <form onSubmit={handleAddBook} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Title / Name</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            </div>
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Price (₹)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Stock Count</label>
                <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
            </div>
            
            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish to Store'}
            </button>
          </form>
        </div>

        {/* Right Side: Current Inventory Table */}
        <div className={`${styles.card} ${styles.inventoryCard}`}>
          <h2>Current Inventory</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>No items in your store yet.</td>
                  </tr>
                ) : (
                  books.map(book => (
                    <tr key={book._id}>
                      <td style={{fontWeight: 500}}>{book.title}</td>
                      <td>₹{book.price}</td>
                      <td>
                        <span className={book.stock > 0 ? styles.inStock : styles.outOfStock}>
                          {book.stock}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(book._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
