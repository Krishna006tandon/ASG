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
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [physicalPrice, setPhysicalPrice] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [stock, setStock] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track item being edited
  const [previewUrl, setPreviewUrl] = useState(null); // Track PDF preview URL

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

  const handleEditClick = (book) => {
    setEditingId(book._id);
    setTitle(book.title);
    setDescription(book.description);
    setOriginalPrice(book.originalPrice || '');
    setPrice(book.price);
    setPhysicalPrice(book.physicalPrice || '');
    setShippingCost(book.shippingCost || '');
    setStock(book.stock);
    setFile(null); // Force them to keep existing file if not re-uploading
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setOriginalPrice('');
    setPrice('');
    setPhysicalPrice('');
    setShippingCost('');
    setStock('');
    setFile(null);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('originalPrice', originalPrice);
      formData.append('price', price);
      formData.append('physicalPrice', physicalPrice);
      formData.append('shippingCost', shippingCost);
      formData.append('stock', stock);
      if (file) {
        formData.append('file', file);
      }

      const url = editingId ? `/api/admin/books/${editingId}` : '/api/admin/books';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData // No Content-Type header so browser sets multipart boundary
      });
      
      if (!res.ok) throw new Error(editingId ? 'Failed to update book' : 'Failed to add book');
      
      // Reset form
      handleCancelEdit();
      e.target.reset();
      
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
      if (editingId === id) handleCancelEdit();
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
          <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
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
                <label>Original Price (₹)</label>
                <input type="number" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="e.g. 1500 (optional)" />
              </div>
              <div className={styles.inputGroup}>
                <label>E-Book Selling Price (₹)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Stock Count</label>
                <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Physical Upgrade Price (₹)</label>
                <input type="number" min="0" value={physicalPrice} onChange={(e) => setPhysicalPrice(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Shipping Cost (₹)</label>
                <input type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Upload E-Book PDF {editingId && '(Optional: Leave empty to keep existing)'}</label>
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required={!editingId} />
              <small style={{color: '#6B7280'}}>Hosted securely on Vercel Blob.</small>
            </div>
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting} style={{flex: 1}}>
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Item' : 'Publish to Store')}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary" style={{flex: 1}}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Current Inventory Table */}
        <div className={`${styles.card} ${styles.inventoryCard}`}>
          <h2>Current Inventory</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>E-Book Pricing</th>
                  <th>Physical Pricing</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '1rem'}}>No items in your store yet.</td>
                  </tr>
                ) : (
                  books.map(book => (
                    <tr key={book._id}>
                      <td style={{maxWidth: '250px'}}>
                        <div style={{fontWeight: 600, color: '#111827'}}>{book.title}</div>
                        <div style={{fontSize: '0.8rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem'}}>
                          {book.description}
                        </div>
                        {book.ebookUrl && (
                          <button 
                            type="button"
                            onClick={() => setPreviewUrl(book.ebookUrl)}
                            style={{fontSize: '0.75rem', color: '#4F46E5', background: 'none', border: 'none', padding: 0, display: 'inline-block', cursor: 'pointer', textDecoration: 'underline'}}
                          >
                            📄 Preview PDF
                          </button>
                        )}
                      </td>
                      <td>
                        {book.originalPrice > book.price && (
                          <span style={{textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.85rem', marginRight: '0.5rem'}}>
                            ₹{book.originalPrice}
                          </span>
                        )}
                        <span style={{fontWeight: 500}}>₹{book.price}</span>
                      </td>
                      <td>
                        <div style={{fontWeight: 500}}>₹{book.physicalPrice || 0}</div>
                        <div style={{fontSize: '0.8rem', color: '#6B7280'}}>+ ₹{book.shippingCost || 0} shipping</div>
                      </td>
                      <td>
                        <span className={book.stock > 0 ? styles.inStock : styles.outOfStock}>
                          {book.stock}
                        </span>
                      </td>
                      <td style={{display: 'flex', gap: '0.5rem'}}>
                        <button 
                          className="btn-secondary"
                          style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}
                          onClick={() => handleEditClick(book)}
                        >
                          Edit
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}
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

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', flexDirection: 'column', padding: '2rem'
        }}>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
            <button 
              onClick={() => setPreviewUrl(null)}
              style={{background: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              Close Preview
            </button>
          </div>
          <iframe 
            src={previewUrl} 
            style={{width: '100%', flex: 1, border: 'none', backgroundColor: 'white', borderRadius: '8px'}}
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
}
