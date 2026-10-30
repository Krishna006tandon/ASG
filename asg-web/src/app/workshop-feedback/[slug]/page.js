"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import styles from './workshopFeedback.module.css';

export default function WorkshopFeedbackPage({ params }) {
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/workshop-feedback/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Workshop link invalid or expired.');
        return res.json();
      })
      .then(data => {
        if (data.campaign) {
          setCampaign(data.campaign);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !comment.trim()) {
      alert("Please provide your name and your feedback message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/workshop-feedback/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentEmail,
          department,
          year,
          rating,
          comment,
          keyTakeaway
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit review');
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good & Informative',
    4: 'Very Inspiring & Practical',
    5: 'Exceptional & Life-Changing! 🌟'
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#7942b5', fontWeight: '700' }}>Loading Workshop Feedback Form...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
            Workshop Link Not Available
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            {error || "This feedback link may have expired or is incorrect."}
          </p>
          <Link href="/" className={styles.actionBtn}>
            Go to Avinash Gore Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        {!isSubmitted ? (
          <>
            <div className={styles.header}>
              <div className={styles.topBadge}>
                🎓 College Workshop Feedback
              </div>

              <div className={styles.speakerRow}>
                <img src="/images/image5.jpg" alt="Avinash Gore" className={styles.avatar} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem' }}>Avinash Gore</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Author &middot; Keynote Speaker &middot; Mentor</div>
                </div>
              </div>

              <h1 className={styles.collegeName}>{campaign.collegeName}</h1>
              <div className={styles.workshopTitle}>{campaign.workshopTitle}</div>
              <div className={styles.dateSpeaker}>
                Session Conducted on {new Date(campaign.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Star Rating Box */}
              <div className={styles.ratingContainer}>
                <span className={styles.ratingLabel}>Rate Your Experience with Avinash Sir</span>
                <div className={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.starBtn} ${(hoverRating || rating) >= star ? styles.starActive : styles.starInactive}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className={styles.ratingHint}>
                  {ratingDescriptions[hoverRating || rating]}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Your Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Aditi Kulkarni"
                  className={styles.input}
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Department / Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. Mechanical / CSE / MBA"
                    className={styles.input}
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Year of Study</label>
                  <select
                    className={styles.select}
                    value={year}
                    onChange={e => setYear(e.target.value)}
                  >
                    <option value="">Select Year...</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Postgraduate / MBA">Postgraduate / MBA</option>
                    <option value="Faculty / Alumni">Faculty / Alumni</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. aditi@gmail.com"
                  className={styles.input}
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>What did you like most / Your key takeaway?</label>
                <input
                  type="text"
                  placeholder="e.g. Practical exam techniques, Swadharma clarity, energy..."
                  className={styles.input}
                  value={keyTakeaway}
                  onChange={e => setKeyTakeaway(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Your Review &amp; Words for Avinash Sir *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Share how this session impacted you, your mindset, or your future goals..."
                  className={styles.textarea}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? "Submitting Review..." : "Submit My Review 🚀"}
              </button>
            </form>
          </>
        ) : (
          /* THANK YOU VIEW */
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Thank You, {studentName}!</h2>
            <p className={styles.successSubtitle}>
              Your feedback for <strong>{campaign.collegeName}</strong> has been received and verified.
              Avinash Gore sir and the Perpetual Solutions team genuinely appreciate your valuable words.
            </p>

            <div className={styles.quoteBox}>
              <div className={styles.quoteText}>&ldquo;Come On… You Can Do It!&rdquo;</div>
              <div className={styles.quoteAuthor}>&mdash; Avinash Gore (B.Tech Chemical, Author &amp; Mentor)</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/" className={styles.actionBtn}>
                Visit Official Platform
              </Link>
              <Link
                href="/career-guidance"
                className={styles.actionBtn}
                style={{ background: '#F59E0B', color: '#111827' }}
              >
                Explore Career Guidance Test
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
