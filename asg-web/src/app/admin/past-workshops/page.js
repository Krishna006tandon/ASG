"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './pastWorkshops.module.css';
import { getImageUrl } from '@/lib/imageHelper';

export default function AdminPastWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Youth Empowerment');
  const [attendeesCount, setAttendeesCount] = useState('');
  const [description, setDescription] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [images, setImages] = useState([]); // [{ url: '', caption: '' }]
  const [directUrl, setDirectUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/past-workshops');
      if (!res.ok) throw new Error('Failed to fetch past workshops');
      const data = await res.json();
      setWorkshops(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (workshop) => {
    setEditingId(workshop._id);
    setTitle(workshop.title || '');
    setLocation(workshop.location || '');
    setCategory(workshop.category || 'Youth Empowerment');
    setAttendeesCount(workshop.attendeesCount || '');
    setDescription(workshop.description || '');
    setHighlightsText(Array.isArray(workshop.highlights) ? workshop.highlights.join('\n') : '');
    setImages(Array.isArray(workshop.images) ? workshop.images : []);
    setFeatured(Boolean(workshop.featured));
    setOrder(workshop.order || 0);

    // Format date for date input
    if (workshop.date) {
      const d = new Date(workshop.date);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setDate(dateString);
    } else {
      setDate('');
    }

    setSuccessMsg(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDate('');
    setLocation('');
    setCategory('Youth Empowerment');
    setAttendeesCount('');
    setDescription('');
    setHighlightsText('');
    setImages([]);
    setDirectUrl('');
    setFeatured(false);
    setOrder(0);
    setError(null);
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }

      const res = await fetch('/api/admin/past-workshops/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload images');

      if (data.urls && data.urls.length > 0) {
        const newImages = data.urls.map(url => ({ url, caption: '' }));
        setImages(prev => [...prev, ...newImages]);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddDirectUrl = () => {
    if (!directUrl || !directUrl.trim()) return;
    setImages(prev => [...prev, { url: directUrl.trim(), caption: '' }]);
    setDirectUrl('');
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageCaptionChange = (index, value) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!title.trim() || !date || !location.trim() || !description.trim()) {
        throw new Error('Please fill in Title, Date, Location, and Description.');
      }

      const highlights = highlightsText
        .split('\n')
        .map(h => h.trim())
        .filter(Boolean);

      const payload = {
        title,
        date,
        location,
        category,
        attendeesCount,
        description,
        highlights,
        images,
        featured,
        order: Number(order) || 0
      };

      const url = editingId ? `/api/admin/past-workshops/${editingId}` : '/api/admin/past-workshops';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Operation failed');

      setSuccessMsg(editingId ? 'Past workshop updated successfully!' : 'Past workshop added successfully!');
      handleCancelEdit();
      fetchWorkshops();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, workshopTitle) => {
    if (!confirm(`Are you sure you want to delete "${workshopTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/past-workshops/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setSuccessMsg(`"${workshopTitle}" deleted successfully.`);
      if (editingId === id) handleCancelEdit();
      fetchWorkshops();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Past Workshops &amp; Gallery Management</h1>
          <p>Add, edit, and organize past workshops, attendees details, and event photos.</p>
        </div>
        <Link href="/gallery" target="_blank" className={styles.viewSiteBtn}>
          <span>View Public Gallery &rarr;</span>
        </Link>
      </div>

      {successMsg && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
        </div>
      )}

      <div className={styles.grid}>
        {/* Form Column */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{editingId ? 'Edit Past Workshop' : 'Add New Past Workshop'}</h2>
            {editingId && <span className={styles.editingBadge}>Editing Mode</span>}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Workshop Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. HAZOP Safety Leadership Masterclass"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Event Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Youth Empowerment">Youth Empowerment</option>
                  <option value="Safety &amp; HAZOP">Safety &amp; HAZOP</option>
                  <option value="Engineering &amp; Industry">Engineering &amp; Industry</option>
                  <option value="Executive Coaching">Executive Coaching</option>
                  <option value="Student Mentorship">Student Mentorship</option>
                  <option value="General Workshop">General Workshop</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Location / Venue *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Jubail, Saudi Arabia or Mumbai"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Attendees Scale (Optional)</label>
                <input
                  type="text"
                  value={attendeesCount}
                  onChange={e => setAttendeesCount(e.target.value)}
                  placeholder="e.g. 150+ Attendees"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Description &amp; Recap *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Comprehensive summary of the workshop, objectives achieved, and audience reception..."
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Key Highlights / Takeaways (Optional)</label>
              <textarea
                rows={3}
                value={highlightsText}
                onChange={e => setHighlightsText(e.target.value)}
                placeholder="Enter each highlight on a new line:&#10;Hands-on HAZOP study with real P&IDs&#10;Risk management assessment techniques&#10;Interactive group problem-solving"
              />
              <span className={styles.hint}>Put each point on a separate line</span>
            </div>

            {/* Image Upload and Gallery Section */}
            <div className={styles.imageSection}>
              <label style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.9rem' }}>
                Workshop Photos &amp; Moments ({images.length})
              </label>

              {/* Upload trigger */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div
                className={styles.uploadBox}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                {isUploading ? (
                  <p style={{ margin: 0, color: 'var(--primary-color, #7942B5)', fontWeight: '600' }}>
                    Uploading selected photos...
                  </p>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>📷</div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#374151' }}>
                      Click to upload photos from computer
                    </p>
                    <span className={styles.hint}>Supports JPG, PNG, WebP (Upload multiple at once)</span>
                  </div>
                )}
              </div>

              {/* Or Direct Image URL input */}
              <div className={styles.urlInputRow}>
                <input
                  type="text"
                  value={directUrl}
                  onChange={e => setDirectUrl(e.target.value)}
                  placeholder="Or paste an image URL (e.g. /images/image1.png)"
                />
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  className={styles.addUrlBtn}
                >
                  + Add URL
                </button>
              </div>

              {/* Uploaded Images Preview Grid */}
              {images.length > 0 && (
                <div className={styles.imageGridPreview}>
                  {images.map((img, idx) => (
                    <div key={idx} className={styles.imageCard}>
                      <img src={getImageUrl(img.url)} alt={`Preview ${idx + 1}`} />
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove image"
                      >
                        &times;
                      </button>
                      <input
                        type="text"
                        placeholder="Caption (opt)"
                        value={img.caption || ''}
                        onChange={e => handleImageCaptionChange(idx, e.target.value)}
                        className={styles.captionInput}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.row} style={{ alignItems: 'center' }}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                />
                Feature in Top Spotlight
              </label>

              <div className={styles.inputGroup} style={{ maxWidth: '120px' }}>
                <label>Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={e => setOrder(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className={styles.submitBtn}
              >
                {isSubmitting
                  ? (editingId ? 'Updating...' : 'Publishing...')
                  : (editingId ? 'Save Changes' : 'Publish Past Workshop')}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Workshops List Column */}
        <div className={styles.inventoryCard}>
          <div className={styles.inventoryHeader}>
            <h2>Existing Past Workshops</h2>
            <span className={styles.countBadge}>{workshops.length} Workshops</span>
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading workshops...</p>
            </div>
          ) : workshops.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
              <h3>No past workshops added yet</h3>
              <p>Use the form on the left to add your first past workshop and photo gallery.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Workshop</th>
                    <th>Date &amp; Location</th>
                    <th>Category</th>
                    <th>Photos</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workshops.map(w => {
                    const firstImg = w.images && w.images.length > 0 ? w.images[0].url : null;
                    const eventDate = new Date(w.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <tr key={w._id}>
                        <td>
                          <div className={styles.itemPreview}>
                            {firstImg ? (
                              <img src={getImageUrl(firstImg)} alt={w.title} className={styles.itemThumb} />
                            ) : (
                              <div className={styles.noThumb}>🎓</div>
                            )}
                            <div className={styles.itemInfo}>
                              <h4>
                                {w.title}
                                {w.featured && (
                                  <span style={{ marginLeft: '0.4rem', color: '#D97706', fontSize: '0.8rem' }} title="Featured">★</span>
                                )}
                              </h4>
                              <p>{w.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{eventDate}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{w.location}</div>
                        </td>
                        <td>
                          <span className={styles.categoryTag}>{w.category || 'Workshop'}</span>
                          {w.attendeesCount && (
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                              {w.attendeesCount}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={styles.photoCount}>
                            📷 {w.images ? w.images.length : 0}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              onClick={() => handleEditClick(w)}
                              className={styles.editBtn}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(w._id, w.title)}
                              className={styles.deleteBtn}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
