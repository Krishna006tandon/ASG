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

  // Step State: 'register' (Step 1) | 'feedback' (Step 2) | 'completed' (Step 3)
  const [step, setStep] = useState('register');

  // Step 1: Student Registration Data
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    year: '3rd Year'
  });

  // Step 2: Dynamic Question Answers
  const [answers, setAnswers] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/workshop-feedback/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Workshop link invalid or expired.');
        return res.json();
      })
      .then(data => {
        if (data.campaign) {
          setCampaign(data.campaign);

          // Initialize default answers
          const initial = {};
          if (Array.isArray(data.campaign.questions)) {
            data.campaign.questions.forEach(q => {
              if (q.type === 'rating') initial[q.id] = 5;
              if (q.type === 'choice' && q.options?.length > 0) initial[q.id] = q.options[0];
              if (q.type === 'text') initial[q.id] = '';
            });
          }
          setAnswers(initial);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // Proceed from Registration to Feedback
  const handleProceedToFeedback = (e) => {
    e.preventDefault();
    if (!studentDetails.name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!studentDetails.phone.trim()) {
      alert("Please enter your mobile/WhatsApp number.");
      return;
    }
    setStep('feedback');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Feedback Answers
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    // Check required fields
    const questions = campaign?.questions || [];
    for (const q of questions) {
      if (q.required && (!answers[q.id] || String(answers[q.id]).trim() === '')) {
        alert(`Please answer the question: "${q.question}"`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/workshop-feedback/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentDetails.name,
          studentEmail: studentDetails.email,
          phone: studentDetails.phone,
          department: studentDetails.department,
          year: studentDetails.year,
          answers
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit review');
      }

      setStep('completed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = {
    1: 'Needs Improvement (1★)',
    2: 'Fair Experience (2★)',
    3: 'Good & Informative (3★)',
    4: 'Very Inspiring & Practical (4★)',
    5: 'Exceptional & Life-Changing! (5★)'
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#7942b5', fontWeight: '700' }}>Loading Workshop Registration &amp; Feedback Form...</p>
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
        {/* Step 1: Student Attendance Registration */}
        {step === 'register' && (
          <>
            <div className={styles.stepBar}>
              <span className={styles.stepPill}>Step 1: Student Attendance</span>
              <span className={styles.stepTracker}>1 of 2</span>
            </div>

            <div className={styles.header}>
              <div className={styles.speakerRow}>
                <img src="/images/image5.jpg" alt="Avinash Gore" className={styles.avatar} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem' }}>Avinash Gore</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Author &middot; Youth Mentor &middot; Speaker</div>
                </div>
              </div>

              <h1 className={styles.collegeName}>{campaign.collegeName}</h1>
              <div className={styles.workshopTitle}>{campaign.workshopTitle}</div>
              <div className={styles.dateSpeaker}>
                Date: {new Date(campaign.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            <form onSubmit={handleProceedToFeedback} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Your Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rohit Rajkumar Fating"
                  className={styles.input}
                  value={studentDetails.name}
                  onChange={e => setStudentDetails({ ...studentDetails, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>WhatsApp / Mobile Number *</label>
                <input
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className={styles.input}
                  value={studentDetails.phone}
                  onChange={e => setStudentDetails({ ...studentDetails, phone: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Used to verify workshop attendance.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. rohitfating04@gmail.com"
                  className={styles.input}
                  value={studentDetails.email}
                  onChange={e => setStudentDetails({ ...studentDetails, email: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Department / Branch *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Civil / Mechanical / CSE"
                    className={styles.input}
                    value={studentDetails.department}
                    onChange={e => setStudentDetails({ ...studentDetails, department: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Year of Study</label>
                  <select
                    className={styles.select}
                    value={studentDetails.year}
                    onChange={e => setStudentDetails({ ...studentDetails, year: e.target.value })}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Postgraduate / MBA">Postgraduate / MBA</option>
                    <option value="Faculty / Alumni">Faculty / Alumni</option>
                  </select>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Confirm Attendance &amp; Give Feedback &rarr;
              </button>
            </form>
          </>
        )}

        {/* Step 2: Session Feedback Form (Custom Questions Configured by Admin) */}
        {step === 'feedback' && (
          <>
            <div className={styles.stepBar}>
              <span className={styles.stepPill} style={{ background: '#ECFDF5', color: '#059669' }}>
                Step 2: Session Feedback
              </span>
              <button
                onClick={() => setStep('register')}
                style={{ background: 'none', border: 'none', color: '#7942b5', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                &larr; Edit Name/Phone
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Feedback for {studentDetails.name}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                Please take 1 minute to answer honestly. Your responses directly help Avinash sir improve future workshops.
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback} className={styles.form}>
              <div className={styles.questionsList}>
                {(campaign.questions || []).map((q, idx) => {
                  const currentValue = answers[q.id];

                  return (
                    <div key={q.id || idx} className={styles.questionItem}>
                      <label className={styles.questionLabel}>
                        <span>#{idx + 1}. {q.question}</span>
                        {q.required && <span className={styles.requiredStar}>*</span>}
                      </label>

                      {/* Question Type: Rating 1-5 Stars */}
                      {q.type === 'rating' && (
                        <div>
                          <div className={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const activeStar = (hoverRatings[q.id] || currentValue || 5) >= star;

                              return (
                                <button
                                  key={star}
                                  type="button"
                                  className={`${styles.starBtn} ${activeStar ? styles.starActive : styles.starInactive}`}
                                  onClick={() => setAnswers({ ...answers, [q.id]: star })}
                                  onMouseEnter={() => setHoverRatings({ ...hoverRatings, [q.id]: star })}
                                  onMouseLeave={() => setHoverRatings({ ...hoverRatings, [q.id]: 0 })}
                                >
                                  ★
                                </button>
                              );
                            })}
                          </div>
                          <div className={styles.ratingHint}>
                            {ratingDescriptions[hoverRatings[q.id] || currentValue || 5]}
                          </div>
                        </div>
                      )}

                      {/* Question Type: Choice Pills (e.g. Definitely, Yes/No/Maybe) */}
                      {q.type === 'choice' && (
                        <div className={styles.choicesRow}>
                          {(q.options && q.options.length > 0 ? q.options : ['Yes', 'Maybe', 'No']).map((opt, oIdx) => {
                            const isSelected = currentValue === opt;

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                className={`${styles.choiceBtn} ${isSelected ? styles.choiceSelected : ''}`}
                                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Question Type: Text input / Textarea */}
                      {q.type === 'text' && (
                        <textarea
                          rows="3"
                          required={q.required}
                          placeholder="Type your answer here..."
                          className={styles.textarea}
                          value={currentValue || ''}
                          onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? "Submitting Your Feedback..." : "Submit Workshop Feedback 🚀"}
              </button>
            </form>
          </>
        )}

        {/* Step 3: Completion / Thank You */}
        {step === 'completed' && (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Thank You, {studentDetails.name}!</h2>
            <p className={styles.successSubtitle}>
              Your attendance and valuable feedback for <strong>{campaign.collegeName}</strong> have been recorded successfully.
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
                Take Career Swadharma Assessment
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
