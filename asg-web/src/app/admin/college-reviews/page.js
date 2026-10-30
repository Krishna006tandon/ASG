"use client";

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import * as XLSX from 'xlsx';
import styles from './collegeReviews.module.css';

export default function AdminCollegeReviewsPage() {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'excel' | 'reviews'
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalCount: 0,
    liveCount: 0,
    excelCount: 0,
    avgRating: 5.0
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    collegeName: '',
    workshopTitle: '',
    customSlug: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [activeQrModal, setActiveQrModal] = useState(null); // Campaign for QR view

  // Excel Import State
  const [parsedRows, setParsedRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Reviews List State
  const [reviews, setReviews] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  async function loadData() {
    setLoading(true);
    try {
      const [campRes, revRes] = await Promise.all([
        fetch('/api/admin/college-reviews/campaigns'),
        fetch(`/api/admin/college-reviews?search=${encodeURIComponent(searchQuery)}&college=${selectedCollege}&source=${selectedSource}`)
      ]);

      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }

      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
        setCollegesList(revData.collegesList || []);
        setStats(revData.stats || { totalCount: 0, liveCount: 0, excelCount: 0, avgRating: 5.0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedCollege, selectedSource]);

  // Create Campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaign.collegeName || !newCampaign.workshopTitle) {
      alert("College Name and Workshop Title are required.");
      return;
    }

    setIsCreatingCampaign(true);
    try {
      const res = await fetch('/api/admin/college-reviews/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create campaign');
      }

      alert("Workshop Review Link & QR created successfully!");
      setNewCampaign({
        collegeName: '',
        workshopTitle: '',
        customSlug: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workshop link?")) return;
    try {
      const res = await fetch(`/api/admin/college-reviews/campaigns/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete campaign');
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Delete Review
  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/college-reviews?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Excel File Parser
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) {
          alert("The uploaded Excel sheet contains no rows.");
          return;
        }

        setParsedRows(json);
        setImportStatus({ type: 'info', message: `Found ${json.length} rows ready for import.` });
      } catch (err) {
        alert("Failed to parse Excel file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Sample Excel Template
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        "Student Name": "Rohan Deshmukh",
        "College Name": "COEP Technological University, Pune",
        "Workshop Title": "Youth Empowerment & Exam Phobia Techniques",
        "Rating": 5,
        "Review": "Avinash sir's insights completely changed how I manage pre-exam stress. Truly inspiring session!",
        "Department": "Mechanical Engineering",
        "Year": "3rd Year",
        "Key Takeaway": "Exam phobia management techniques and self-belief"
      },
      {
        "Student Name": "Sneha Patil",
        "College Name": "VJTI Mumbai",
        "Workshop Title": "Student Induction Program (Diksharambha)",
        "Rating": 5,
        "Review": "Learned the true meaning of Swadharma and how to align technical skills with natural passion.",
        "Department": "Computer Science",
        "Year": "1st Year",
        "Key Takeaway": "Swadharma concept and focusing on own journey"
      },
      {
        "Student Name": "Aniket Shinde",
        "College Name": "MIT World Peace University",
        "Workshop Title": "Process Safety & Industrial Readiness",
        "Rating": 4,
        "Review": "Clear real-world examples from chemical industry. Very helpful for campus placements.",
        "Department": "Chemical Engineering",
        "Year": "Final Year",
        "Key Takeaway": "HAZOP safety mindset and practical plant scenarios"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Past Reviews");
    XLSX.writeFile(workbook, "Sample_College_Workshop_Reviews.xlsx");
  };

  // Submit Parsed Excel Rows to Backend
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const res = await fetch('/api/admin/college-reviews/import-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: parsedRows })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      alert(data.message || `Imported ${data.importedCount} reviews!`);
      setParsedRows([]);
      setImportStatus({ type: 'success', message: data.message });
      loadData();
      setActiveTab('reviews');
    } catch (err) {
      alert("Error importing reviews: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Download QR Code Image
  const handleDownloadQrImage = (campaign) => {
    const canvas = document.getElementById(`qr-canvas-${campaign._id}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${campaign.slug}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const getFullPublicFeedbackUrl = (slug) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://avinashsgore.com';
    return `${origin}/workshop-feedback/${slug}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>College Workshop Reviews Hub</h1>
          <p className={styles.subtitle}>
            Collect live student reviews via dedicated QR links, or import past workshop reviews from Excel sheets.
          </p>
        </div>
      </div>

      {/* STATS METRIC ROW */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total College Reviews</div>
          <div className={styles.statValue} style={{ color: '#7942b5' }}>
            {stats.totalCount}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>Live QR Submissions</div>
          <div className={styles.statValue} style={{ color: '#059669' }}>
            {stats.liveCount}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>Excel Imported Reviews</div>
          <div className={styles.statValue} style={{ color: '#2563EB' }}>
            {stats.excelCount}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>Average Rating</div>
          <div className={styles.statValue} style={{ color: '#F59E0B' }}>
            ★ {stats.avgRating}
          </div>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'campaigns' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          📱 Live Workshop QR &amp; Links ({campaigns.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'excel' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('excel')}
        >
          📊 Excel Bulk Importer
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          💬 All College Reviews ({reviews.length})
        </button>
      </div>

      {/* =========================================================
          TAB 1: LIVE WORKSHOP QR LINKS (CAMPAIGNS)
          ========================================================= */}
      {activeTab === 'campaigns' && (
        <>
          {/* Create New Link Form */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>
              <span>✨</span> Create New Workshop Review Link &amp; QR
            </h2>
            <form onSubmit={handleCreateCampaign}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>College / Institute Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. COEP Technological University, Pune"
                    className={styles.inputField}
                    value={newCampaign.collegeName}
                    onChange={e => setNewCampaign({ ...newCampaign, collegeName: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Workshop / Seminar Topic *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Youth Empowerment & Exam Phobia"
                    className={styles.inputField}
                    value={newCampaign.workshopTitle}
                    onChange={e => setNewCampaign({ ...newCampaign, workshopTitle: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Session Date</label>
                  <input
                    type="date"
                    className={styles.inputField}
                    value={newCampaign.date}
                    onChange={e => setNewCampaign({ ...newCampaign, date: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Custom Link Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. coep-2026 (leave blank for auto)"
                    className={styles.inputField}
                    value={newCampaign.customSlug}
                    onChange={e => setNewCampaign({ ...newCampaign, customSlug: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingCampaign}
                className={styles.primaryBtn}
              >
                {isCreatingCampaign ? "Generating Link & QR..." : "Generate Workshop Link & QR Code 🚀"}
              </button>
            </form>
          </div>

          {/* List of Active Campaigns */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>
                Active College Workshop Links ({campaigns.length})
              </h3>
            </div>

            {campaigns.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                No workshop links created yet. Use the form above to generate your first link!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>College Name</th>
                      <th>Workshop Topic</th>
                      <th>Reviews</th>
                      <th>Avg Rating</th>
                      <th>Shareable Link</th>
                      <th>QR Code &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(camp => (
                      <tr key={camp._id}>
                        <td style={{ color: '#6B7280' }}>
                          {new Date(camp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ fontWeight: 700, color: '#111827' }}>
                          {camp.collegeName}
                        </td>
                        <td style={{ color: '#4B5563' }}>
                          {camp.workshopTitle}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#7942b5' }}>
                            {camp.totalReviews} submitted
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                            ★ {camp.averageRating || '5.0'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.actionIconBtn}
                            onClick={() => {
                              const url = getFullPublicFeedbackUrl(camp.slug);
                              navigator.clipboard.writeText(url);
                              alert(`Link copied to clipboard!\n\n${url}`);
                            }}
                          >
                            📋 Copy Link
                          </button>
                          <a
                            href={`/workshop-feedback/${camp.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionIconBtn}
                          >
                            🔗 Open
                          </a>
                        </td>
                        <td>
                          <button
                            className={styles.actionIconBtn}
                            style={{ background: '#FAF5FF', borderColor: '#7942b5', color: '#7942b5' }}
                            onClick={() => setActiveQrModal(camp)}
                          >
                            📷 View &amp; Print QR
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteCampaign(camp._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================
          TAB 2: EXCEL BULK IMPORTER
          ========================================================= */}
      {activeTab === 'excel' && (
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className={styles.cardHeading} style={{ margin: 0 }}>
                <span>📊</span> Bulk Import Past College Workshop Reviews
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                Upload an Excel file (.xlsx, .xls) or CSV with student feedback from your previous sessions.
              </p>
            </div>

            <button
              onClick={handleDownloadSampleExcel}
              className={styles.secondaryBtn}
            >
              📥 Download Sample Excel Template
            </button>
          </div>

          {/* Upload Dropzone */}
          <label className={styles.dropzone}>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div className={styles.dropzoneIcon}>📁</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.35rem' }}>
              Click to browse or drop your Excel / CSV file here
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>
              Supports .xlsx, .xls, and .csv with columns: <strong>Student Name, College Name, Rating, Review/Comment</strong>
            </p>
          </label>

          {/* Preview of Parsed Rows */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <span style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>
                  ✓ Previewing {parsedRows.length} reviews from file
                </span>
                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className={styles.primaryBtn}
                  style={{ background: '#059669' }}
                >
                  {isImporting ? "Importing into Database..." : `Confirm & Import ${parsedRows.length} Reviews 🚀`}
                </button>
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>College</th>
                      <th>Rating</th>
                      <th>Review Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 50).map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>
                          {row['Student Name'] || row['Name'] || 'Student'}
                        </td>
                        <td>
                          {row['College Name'] || row['College'] || 'College Workshop'}
                        </td>
                        <td style={{ color: '#F59E0B', fontWeight: 700 }}>
                          ★ {row['Rating'] || 5}
                        </td>
                        <td style={{ maxWidth: '350px', fontSize: '0.85rem' }}>
                          {row['Review'] || row['Comment'] || row['Feedback'] || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.5rem' }}>
                  Showing first 50 rows of {parsedRows.length} total rows.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: ALL COLLEGE REVIEWS DATABASE
          ========================================================= */}
      {activeTab === 'reviews' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by student, college, or words..."
                className={styles.inputField}
                style={{ width: '280px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadData()}
              />

              <select
                className={styles.inputField}
                value={selectedCollege}
                onChange={e => setSelectedCollege(e.target.value)}
              >
                <option value="all">All Colleges ({collegesList.length})</option>
                {collegesList.map((col, idx) => (
                  <option key={idx} value={col}>{col}</option>
                ))}
              </select>

              <select
                className={styles.inputField}
                value={selectedSource}
                onChange={e => setSelectedSource(e.target.value)}
              >
                <option value="all">All Sources</option>
                <option value="live_link">Live QR Submissions</option>
                <option value="excel_import">Excel Imported</option>
              </select>

              <button onClick={loadData} className={styles.secondaryBtn}>
                Filter
              </button>
            </div>

            <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600 }}>
              Showing {reviews.length} reviews
            </span>
          </div>

          {reviews.length === 0 ? (
            <p style={{ padding: '2.5rem', textAlign: 'center', color: '#6B7280' }}>
              No reviews found matching the filters.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>College Name</th>
                    <th>Department &amp; Year</th>
                    <th>Rating</th>
                    <th>Student Feedback</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(rev => (
                    <tr key={rev._id}>
                      <td style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {new Date(rev.workshopDate || rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 700, color: '#111827' }}>
                        {rev.studentName}
                      </td>
                      <td style={{ color: '#4B5563', fontWeight: 600 }}>
                        {rev.collegeName}
                      </td>
                      <td style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                        {rev.department ? `${rev.department}` : ''}
                        {rev.year ? ` (${rev.year})` : ''}
                      </td>
                      <td>
                        <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                          ★ {rev.rating}
                        </span>
                      </td>
                      <td style={{ maxWidth: '320px', fontSize: '0.88rem', color: '#374151', lineHeight: '1.4' }}>
                        <div>{rev.comment}</div>
                        {rev.keyTakeaway && (
                          <div style={{ fontSize: '0.78rem', color: '#7942b5', marginTop: '0.25rem' }}>
                            💡 <em>{rev.keyTakeaway}</em>
                          </div>
                        )}
                      </td>
                      <td>
                        {rev.source === 'live_link' ? (
                          <span className={styles.badgeLive}>Live QR</span>
                        ) : (
                          <span className={styles.badgeExcel}>Excel</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteReview(rev._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          QR CODE MODAL (FOR AUDITORIUM SCREEN OR PRINTING)
          ========================================================= */}
      {activeQrModal && (
        <div className={styles.modalBackdrop} onClick={() => setActiveQrModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setActiveQrModal(null)}>&times;</button>

            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7942b5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Avinash Gore &middot; Workshop Feedback
            </span>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0.4rem 0 0.2rem 0' }}>
              {activeQrModal.collegeName}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {activeQrModal.workshopTitle}
            </p>

            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
              <QRCodeCanvas
                id={`qr-canvas-${activeQrModal._id}`}
                value={getFullPublicFeedbackUrl(activeQrModal.slug)}
                size={240}
                bgColor="#ffffff"
                fgColor="#000000"
                level="Q"
                includeMargin={true}
              />
            </div>

            <p style={{ fontSize: '0.85rem', color: '#374151', margin: '0 0 1.25rem 0' }}>
              Scan with phone camera to open review form:
              <br />
              <strong style={{ color: '#7942b5' }}>{getFullPublicFeedbackUrl(activeQrModal.slug)}</strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className={styles.primaryBtn}
                onClick={() => handleDownloadQrImage(activeQrModal)}
              >
                📥 Download High-Res QR
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  navigator.clipboard.writeText(getFullPublicFeedbackUrl(activeQrModal.slug));
                  alert("Link copied to clipboard!");
                }}
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
