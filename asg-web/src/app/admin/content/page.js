"use client";

import { useState, useEffect } from 'react';
import styles from '../ecommerce/ecommerce.module.css';

export default function AdminContent() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, readTime, excerpt, content })
      });
      
      if (!res.ok) throw new Error('Failed to publish blog');
      
      // Reset form
      setTitle('');
      setCategory('');
      setReadTime('');
      setExcerpt('');
      setContent('');
      
      // Refresh list
      fetchBlogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete blog');
      fetchBlogs();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.container}><h2>Loading Content...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Content & Blogs Manager</h1>
        <p>Publish articles, updates, and thought leadership content.</p>
      </div>

      <div className={styles.grid}>
        {/* Left Side: Compose Post */}
        <div className={styles.card}>
          <h2>Compose New Post</h2>
          <form onSubmit={handlePublish} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Post Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Category</label>
                <input type="text" placeholder="e.g. Strategy" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Read Time</label>
                <input type="text" placeholder="e.g. 5 min read" value={readTime} onChange={(e) => setReadTime(e.target.value)} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Short Excerpt (Summary)</label>
              <textarea rows="2" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required></textarea>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Full Content (Markdown or Text)</label>
              <textarea rows="8" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
            </div>
            
            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </form>
        </div>

        {/* Right Side: Published Content */}
        <div className={`${styles.card} ${styles.inventoryCard}`}>
          <h2>Published Posts</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Post Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{textAlign: 'center', padding: '1rem'}}>No posts published yet.</td>
                  </tr>
                ) : (
                  blogs.map(blog => (
                    <tr key={blog._id}>
                      <td>
                        <div style={{fontWeight: 600, color: '#111827'}}>{blog.title}</div>
                        <div style={{fontSize: '0.85rem', color: '#6B7280'}}>
                          {blog.category} • {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: blog.isPublished ? '#059669' : '#D97706', fontWeight: 600, fontSize: '0.9rem' }}>
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(blog._id)}
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
