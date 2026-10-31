"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import styles from './career.module.css';
import CareerDemoVideo from '@/components/CareerDemoVideo';
import CareerReportPDF from '@/components/CareerReportPDF';
import {
  CAREER_CATEGORIES,
  CAREER_QUESTIONS,
  LIKERT_SCALE
} from '@/lib/careerData';

export default function CareerGuidancePage() {
  // Navigation / View steps: 'landing' | 'test' | 'results'
  const [currentStep, setCurrentStep] = useState('landing');
  
  // Settings & Pricing
  const [setting, setSetting] = useState({
    price: 299,
    originalPrice: 999,
    isEnabled: true,
    videoUrl: '',
    headline: 'Discover Your True Nature & Swadharma',
    subheadline: 'Find the work you were naturally designed to do with our 30-Question Career Nature Assessment.'
  });

  // Candidate Registration form
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    currentStatus: 'College Student'
  });

  // Payment & Assessment state
  const [assessmentId, setAssessmentId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [answers, setAnswers] = useState({});
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [results, setResults] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Discrete Coupon state (Hidden by default)
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Active filter for 10 archetypes explorer
  const [activeArchetypeTab, setActiveArchetypeTab] = useState(null);

  // References
  const pricingSectionRef = useRef(null);
  const reportRef = useRef(null);

  // Load Settings and check for existing active session on mount
  useEffect(() => {
    // 1. Fetch live pricing and admin settings
    fetch('/api/career/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.price) {
          setSetting(data);
        }
      })
      .catch(err => console.error('Failed to load settings:', err));

    // 2. Production session restoration or direct result view via ?id=
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('id') || urlParams.get('resultId');
      const savedAssessmentId = queryId || sessionStorage.getItem('asg_career_assessment_id');
      const savedCandidate = sessionStorage.getItem('asg_career_candidate');
      const savedAnswers = sessionStorage.getItem('asg_career_answers');

      // Auto-populate candidate details from logged-in user if available
      const storedUser = localStorage.getItem('asg_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setCandidate(prev => ({
            ...prev,
            name: prev.name || parsed.name || '',
            email: prev.email || parsed.email || '',
            phone: prev.phone || parsed.phone || ''
          }));
        } catch (e) {}
      }

      if (savedCandidate) {
        setCandidate(JSON.parse(savedCandidate));
      }
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }

      if (savedAssessmentId) {
        setAssessmentId(savedAssessmentId);
        fetch(`/api/career/result/${savedAssessmentId}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.paymentStatus === 'Paid') {
              if (data.candidate) {
                setCandidate(data.candidate);
              }
              if (data.testStatus === 'Completed' && data.results) {
                setResults(data.results);
                setCurrentStep('results');
              } else {
                setCurrentStep('test');
              }
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      // Graceful fallback if storage disabled
    }
  }, []);

  // Sync answers to sessionStorage so user never loses answers on accidental refresh
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        sessionStorage.setItem('asg_career_answers', JSON.stringify(answers));
      } catch (e) {}
    }
  }, [answers]);

  // Razorpay SDK helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Scroll to registration/pricing
  const scrollToPricing = () => {
    if (pricingSectionRef.current) {
      pricingSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Coupon Validation Handler
  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          itemType: 'career',
          itemId: 'career_assessment',
          currentAmount: setting.price
        })
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid or expired coupon code.');
      }

      setAppliedCoupon(data.coupon);
      setCouponError('');
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  // Handle Pay and Unlock Test (Option A)
  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!candidate.name || !candidate.email || !candidate.phone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Step 1: Create Order on Backend (with coupon if applied)
      const token = localStorage.getItem('asg_token');
      const orderHeaders = { 'Content-Type': 'application/json' };
      if (token) orderHeaders['Authorization'] = `Bearer ${token}`;

      const orderRes = await fetch('/api/razorpay/create-career-order', {
        method: 'POST',
        headers: orderHeaders,
        body: JSON.stringify({
          candidateDetails: candidate,
          couponCode: appliedCoupon?.code || null
        })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to initiate order.');
      }

      const orderData = await orderRes.json();
      setAssessmentId(orderData.assessmentId);

      // Save candidate to session
      try {
        sessionStorage.setItem('asg_career_candidate', JSON.stringify(candidate));
        sessionStorage.setItem('asg_career_assessment_id', orderData.assessmentId);
      } catch (e) {}

      // SPECIAL CASE: 100% Free Coupon Applied! Skip Razorpay entirely!
      if (orderData.isFree) {
        setCurrentStep('test');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsProcessingPayment(false);
        return;
      }

      // Step 2: Open Razorpay Gateway Modal for paid order
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert("Payment gateway failed to load. Please check your internet connection.");
        setIsProcessingPayment(false);
        return;
      }
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Avinash Gore",
        description: "Career Nature & Swadharma Assessment",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify Payment Signature
            const verifyRes = await fetch('/api/razorpay/verify-career-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                assessmentId: orderData.assessmentId
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }

            // Payment successful! Unlock 30-Question Assessment
            setCurrentStep('test');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert("Verification Error: " + verifyErr.message);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: candidate.name,
          email: candidate.email,
          contact: candidate.phone,
        },
        theme: {
          color: "#7942b5",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (resp) {
        console.error("Razorpay Payment Failed:", resp.error);
        const reason = resp.error?.description || resp.error?.reason || 'Payment could not be processed.';
        alert(`Payment Failed: ${reason}`);
        setIsProcessingPayment(false);
      });

      razorpayInstance.open();

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Answer Selection
  const handleSelectAnswer = (questionNum, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionNum]: value
    }));
  };

  // Submit Completed Assessment
  const handleSubmitAssessment = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < 30) {
      alert(`You have answered ${answeredCount} of 30 questions. Please complete all questions to get an accurate profile.`);
      return;
    }

    setIsSubmittingTest(true);

    try {
      const token = localStorage.getItem('asg_token');
      const submitHeaders = { 'Content-Type': 'application/json' };
      if (token) submitHeaders['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/career/submit', {
        method: 'POST',
        headers: submitHeaders,
        body: JSON.stringify({
          assessmentId,
          answers
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit assessment.');
      }

      const data = await res.json();
      setResults(data.results);
      setCurrentStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      alert("Submission Error: " + err.message);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  // Generate & Download PDF Report
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsDownloadingPdf(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = (candidate.name || 'Candidate').replace(/\s+/g, '_');
      pdf.save(`Career_Report_${safeName}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF: " + err.message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / 30) * 100);

  return (
    <div className={styles.pageWrapper}>
      {/* Off-screen PDF Template Component */}
      <CareerReportPDF
        assessment={{ candidate, assessmentId, completedAt: new Date() }}
        results={results}
        reportRef={reportRef}
      />

      <div className={styles.container}>
        {/* ========================================================
            VIEW 1: LANDING PAGE (Pitch, Video if set, Gita, Archetypes, Pricing)
            ======================================================== */}
        {currentStep === 'landing' && (
          <>
            {/* HERO SECTION */}
            <section className={styles.heroSection}>
              <div className={styles.badge}>
                <span>✨</span> New Assessment Program &middot; Avinash Gore
              </div>
              <h1 className={styles.heroTitle}>
                Don&apos;t Just Pick a Degree. Discover Your{' '}
                <span className={styles.heroTitleGradient}>Swadharma</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Stop following the crowd blindly. Uncover the exact kind of professional work
                you are naturally suited to do, enjoy, and master with our 30-Dimension Career Nature Assessment.
              </p>

              {/* VIDEO SECTION - Only displayed if admin sets a real video URL */}
              {setting.videoUrl && setting.videoUrl.trim() && (
                <div className={styles.videoSection}>
                  <CareerDemoVideo
                    videoUrl={setting.videoUrl}
                    onCtaClick={scrollToPricing}
                  />
                </div>
              )}

              {/* HERO CTA BUTTONS */}
              <div className={styles.heroCtaRow}>
                <button onClick={scrollToPricing} className={styles.primaryCta}>
                  <span>Take Career Assessment (₹{setting.price})</span>
                  <span>&rarr;</span>
                </button>
                <Link href="#archetypes" className={styles.secondaryCta}>
                  <span>Explore 10 Work Areas</span>
                  <span>&darr;</span>
                </Link>
              </div>

              {/* TRUST BADGES */}
              <div className={styles.trustBadges}>
                <div className={styles.trustItem}>
                  <span>🛡️</span> 100% Confidential
                </div>
                <div className={styles.trustItem}>
                  <span>⚡</span> 30 Questions (~7 Mins)
                </div>
                <div className={styles.trustItem}>
                  <span>📄</span> Instant Downloadable PDF Report
                </div>
                <div className={styles.trustItem}>
                  <span>🎯</span> Grounded in Gita &amp; Work Psychology
                </div>
              </div>
            </section>

            {/* THE CORE DILEMMA SECTION */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>The Real Question</span>
                <h2 className={styles.sectionTitle}>
                  Choosing a Career Is More Than Choosing a Stream
                </h2>
                <p className={styles.sectionDesc}>
                  Your degree tells the world what you studied. Your <strong>Swadharma</strong> tells
                  you what kind of work will energize you and bring deep fulfillment.
                </p>
              </div>

              <div className={styles.comparisonGrid}>
                {/* Trap Card */}
                <div className={styles.trapCard}>
                  <div className={styles.cardHeaderTitle} style={{ color: '#DC2626' }}>
                    <span>❌</span> The Conventional Degree Trap
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
                    What most students do, often leading to career burnout:
                  </p>
                  <ul className={styles.pointList}>
                    <li className={styles.pointItem}>
                      <span>🔴</span>
                      <span>Selecting Science, Commerce, or Arts based on parental pressure or peer trends.</span>
                    </li>
                    <li className={styles.pointItem}>
                      <span>🔴</span>
                      <span>Chasing the highest initial campus salary package without knowing the daily job nature.</span>
                    </li>
                    <li className={styles.pointItem}>
                      <span>🔴</span>
                      <span>Working for years in isolated roles when you thrive with people (or vice versa).</span>
                    </li>
                    <li className={styles.pointItem}>
                      <span>🔴</span>
                      <span>Wondering years later: <em>&ldquo;I studied hard, got a good job, then why am I exhausted?&rdquo;</em></span>
                    </li>
                  </ul>
                </div>

                {/* Truth Card */}
                <div className={styles.truthCard}>
                  <div className={styles.cardHeaderTitle} style={{ color: '#7942b5' }}>
                    <span>✨</span> The Swadharma Alignment
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
                    Discovering work tailored to your natural inclinations:
                  </p>
                  <ul className={styles.pointList}>
                    <li className={styles.pointItem}>
                      <span>✅</span>
                      <span>Identifying whether you are wired for Sales, R&amp;D, Operations, Tech, or Creative fields.</span>
                    </li>
                    <li className={styles.pointItem}>
                      <span>✅</span>
                      <span>Building qualifications around your natural strengths, making learning effortless.</span>
                    </li>
                    <li className={styles.pointItem}>
                      <span>✅</span>
                      <span>Thriving in high-impact hybrid roles (e.g. Tech + Sales = Solution Consulting).</span>
                    </li>
                    <li className={styles.pointItem}>
                      <span>✅</span>
                      <span>Achieving sustained high performance, confidence, and genuine career clarity.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* BHAGAVAD GITA PHILOSOPHICAL CARD */}
            <section className={styles.gitaCard}>
              <span className={styles.sectionTag} style={{ color: '#B45309' }}>Ancient Wisdom &middot; Modern Career</span>
              
              <h2 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', color: '#78350F', fontWeight: '800', margin: '0.75rem 0 0.5rem 0' }}>
                The Timeless Principle of Swadharma &amp; Svabhava
              </h2>
              <p style={{ color: '#92400E', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
                The Shrimad Bhagavad Gita emphasizes in two pivotal chapters that enduring career success comes from aligning your work with your natural inner wiring rather than imitating others.
              </p>

              {/* Verses Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', margin: '1.5rem 0', textAlign: 'center' }}>
                
                {/* Verse 3.35 */}
                <div style={{ background: 'rgba(255, 255, 255, 0.85)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.06)' }}>
                  <div>
                    <span style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: '800', background: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.75rem', borderRadius: '6px', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Bhagavad Gita &middot; Chapter 3, Verse 35
                    </span>
                    <div className={styles.sanskritQuote} style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                      श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।
                      <br />
                      स्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥
                    </div>
                    <p style={{ color: '#78350F', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1.25rem 0' }}>
                      &ldquo;It is far better to follow one&apos;s own natural path (Swadharma), even if done imperfectly, than to expertly imitate another&apos;s path. Following another&apos;s path is fraught with fear &amp; danger.&rdquo;
                    </p>
                  </div>
                  <a
                    href="https://www.holy-bhagavad-gita.org/chapter/3/verse/35/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '8px',
                      background: '#F59E0B',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    <span>Read BG 3.35 Detailed Commentary</span>
                    <span>&rarr;</span>
                  </a>
                </div>

                {/* Verse 18.47 */}
                <div style={{ background: 'rgba(255, 255, 255, 0.85)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.06)' }}>
                  <div>
                    <span style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: '800', background: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.75rem', borderRadius: '6px', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Bhagavad Gita &middot; Chapter 18, Verse 47
                    </span>
                    <div className={styles.sanskritQuote} style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                      श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।
                      <br />
                      स्वभावनियतं कर्म कुर्वन्नाप्नोति किल्बिषम्॥
                    </div>
                    <p style={{ color: '#78350F', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1.25rem 0' }}>
                      &ldquo;Better is one&apos;s own natural duty, though tinged with faults, than another&apos;s duty well performed. One who performs action born of their own inborn nature (Svabhava) incurs no inner conflict or grief.&rdquo;
                    </p>
                  </div>
                  <a
                    href="https://www.holy-bhagavad-gita.org/chapter/18/verse/47/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '8px',
                      background: '#F59E0B',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    <span>Read BG 18.47 Detailed Commentary</span>
                    <span>&rarr;</span>
                  </a>
                </div>

              </div>

              <div className={styles.gitaLessonsGrid}>
                <div className={styles.gitaLessonBox}>
                  <div className={styles.lessonTitle}>Lesson 1: Don&apos;t Blindly Copy Friends (3.35)</div>
                  <div className={styles.lessonText}>
                    Your closest friend may thrive in computer coding or corporate banking. That does not make it the right environment for your unique mental wiring.
                  </div>
                </div>
                <div className={styles.gitaLessonBox}>
                  <div className={styles.lessonTitle}>Lesson 2: Work According to Svabhava (18.47)</div>
                  <div className={styles.lessonText}>
                    Success is not just competing with others in a crowded race; it is mastering the art of applying your own natural temperament to create immense value.
                  </div>
                </div>
                <div className={styles.gitaLessonBox}>
                  <div className={styles.lessonTitle}>Lesson 3: Sustainable Excellence</div>
                  <div className={styles.lessonText}>
                    When you perform work aligned with your inner nature, work doesn&apos;t feel like a heavy burden. You develop resilience and deep mastery naturally.
                  </div>
                </div>
              </div>
            </section>

            {/* 10 CAREER ARCHETYPES SECTION */}
            <section id="archetypes" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>The 10 Dimensions</span>
                <h2 className={styles.sectionTitle}>Which Professional Are You?</h2>
                <p className={styles.sectionDesc}>
                  Our assessment evaluates your instinctive preferences across 10 vital work styles:
                </p>
              </div>

              <div className={styles.archetypesGrid}>
                {CAREER_CATEGORIES.map((cat) => (
                  <div
                    key={cat.code}
                    className={styles.archetypeCard}
                    onClick={() => setActiveArchetypeTab(activeArchetypeTab === cat.code ? null : cat.code)}
                  >
                    <div className={styles.archetypeTop}>
                      <div className={styles.archetypeIcon} style={{ background: `${cat.color}15` }}>
                        {cat.icon}
                      </div>
                      <div>
                        <div className={styles.archetypeName}>{cat.name}</div>
                        <span style={{ fontSize: '0.75rem', color: cat.color, fontWeight: '700' }}>
                          {cat.tagline}
                        </span>
                      </div>
                    </div>
                    <p className={styles.archetypeDesc}>
                      {cat.description}
                    </p>
                    <div className={styles.archetypeRolesTag}>
                      <strong>Top Roles:</strong> {cat.roles}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRICING & REGISTRATION CARD (Option A Paywall) */}
            <section ref={pricingSectionRef} className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Start Your Assessment</span>
                <h2 className={styles.sectionTitle}>Unlock Your Career Swadharma Today</h2>
                <p className={styles.sectionDesc}>
                  Invest in clarity before you invest lakhs in degrees or years in the wrong job.
                </p>
              </div>

              <div className={styles.pricingCard}>
                <div className={styles.pricingRibbon}>Limited Offer</div>

                <div className={styles.pricingHeader}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827' }}>
                    Career Nature Diagnostic Assessment
                  </h3>
                  <div className={styles.priceWrapper}>
                    {appliedCoupon ? (
                      <>
                        <span className={styles.currentPrice} style={appliedCoupon.isFree ? { color: '#059669' } : {}}>
                          {appliedCoupon.isFree ? 'FREE (₹0)' : `₹${appliedCoupon.finalAmount}`}
                        </span>
                        <span className={styles.originalPrice}>₹{setting.price}</span>
                        <span className={styles.discountBadge} style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                          {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={styles.currentPrice}>₹{setting.price}</span>
                        <span className={styles.originalPrice}>₹{setting.originalPrice}</span>
                        <span className={styles.discountBadge}>
                          {Math.round(((setting.originalPrice - setting.price) / setting.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: 0 }}>
                    One-time fee &middot; Instant access &middot; Downloadable Lifetime PDF Report
                  </p>
                </div>

                <div className={styles.featuresList}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureCheck}>✓</div>
                    <span><strong>30-Question Work Preference Questionnaire</strong> (~7 minutes)</span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureCheck}>✓</div>
                    <span><strong>Ranked Top 3 Career Domains</strong> (Primary Swadharma &amp; Complements)</span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureCheck}>✓</div>
                    <span><strong>Hybrid Synergy Analysis</strong> (e.g. Sales + Technical specializations)</span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureCheck}>✓</div>
                    <span><strong>Custom Job Role &amp; Skill Development Roadmap</strong></span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureCheck}>✓</div>
                    <span><strong>Executive PDF Report</strong> with Avinash Gore&apos;s guidance</span>
                  </div>
                </div>

                {/* Candidate Registration Form */}
                <form onSubmit={handleInitiatePayment} className={styles.registrationForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name *</label>
                    <input
                      required
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Rahul Sharma"
                      value={candidate.name}
                      onChange={e => setCandidate({ ...candidate, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address *</label>
                    <input
                      required
                      type="email"
                      className={styles.formInput}
                      placeholder="rahul@example.com"
                      value={candidate.email}
                      onChange={e => setCandidate({ ...candidate, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>WhatsApp / Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      className={styles.formInput}
                      placeholder="9876543210"
                      value={candidate.phone}
                      onChange={e => setCandidate({ ...candidate, phone: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Current Stage</label>
                    <select
                      className={styles.formInput}
                      value={candidate.currentStatus}
                      onChange={e => setCandidate({ ...candidate, currentStatus: e.target.value })}
                    >
                      <option value="College Student">College Student (Undergrad / Postgrad)</option>
                      <option value="Recent Graduate">Recent Graduate</option>
                      <option value="Working Professional">Working Professional (Early / Mid Career)</option>
                      <option value="School Student">High School / 11th - 12th</option>
                    </select>
                  </div>

                  {/* Discreet / Hidden Coupon Section */}
                  <div style={{ margin: '0.5rem 0 1rem 0' }}>
                    {!appliedCoupon ? (
                      <div>
                        {!showCouponInput ? (
                          <button
                            type="button"
                            onClick={() => setShowCouponInput(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#7942b5',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              padding: '0.2rem 0',
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <span>🏷️</span> Have a coupon or workshop access code?
                          </button>
                        ) : (
                          <div style={{
                            background: '#FAF5FF',
                            border: '1px dashed #C084FC',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem'
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder="ENTER COUPON CODE"
                                value={couponInput}
                                onChange={e => {
                                  setCouponInput(e.target.value.toUpperCase());
                                  setCouponError('');
                                }}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid #D1D5DB',
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  letterSpacing: '0.5px',
                                  textTransform: 'uppercase'
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponInput.trim()}
                                style={{
                                  padding: '0.5rem 1.1rem',
                                  fontSize: '0.85rem',
                                  background: '#7942b5',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: '700'
                                }}
                              >
                                {couponLoading ? 'Verifying...' : 'Apply'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowCouponInput(false); setCouponError(''); }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#6B7280',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  padding: '0 0.25rem'
                                }}
                                title="Close"
                              >
                                ✕
                              </button>
                            </div>
                            {couponError && (
                              <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: '500' }}>
                                ⚠️ {couponError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        background: '#ECFDF5',
                        border: '1px solid #6EE7B7',
                        borderRadius: '8px',
                        padding: '0.65rem 0.9rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#065F46', fontWeight: '600' }}>
                          <span>🎉</span>
                          <span>
                            Code <strong>{appliedCoupon.code}</strong> applied &middot; Saved ₹{appliedCoupon.discountAmount}!
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className={styles.submitBtn}
                    style={appliedCoupon?.isFree ? { background: '#059669', borderColor: '#047857' } : {}}
                  >
                    {isProcessingPayment
                      ? 'Connecting to Gateway...'
                      : appliedCoupon?.isFree
                        ? '🎉 Unlock Free Assessment (100% OFF) →'
                        : appliedCoupon
                          ? `Pay ₹${appliedCoupon.finalAmount} & Unlock Test`
                          : `Pay ₹${setting.price} & Unlock Test`}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9CA3AF', margin: '0.5rem 0 0 0' }}>
                    🔒 Secured by Razorpay &middot; 256-bit Bank Grade SSL Encryption
                  </p>
                </form>
              </div>
            </section>

            {/* AUTHOR INSPIRATION MESSAGE */}
            <section className={styles.section} style={{ paddingTop: '1rem' }}>
              <div className={styles.authorCard}>
                <img
                  src="/images/image5.jpg"
                  alt="Avinash Gore"
                  className={styles.authorAvatar}
                />
                <div className={styles.authorContent}>
                  <div style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: '800', background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.2rem 0.65rem', borderRadius: '6px', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    A Message to Every Student &middot; Avinash Gore
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.55rem)', fontWeight: '900', color: '#111827', marginBottom: '0.85rem', letterSpacing: '-0.02em' }}>
                    Come On&hellip; You Can Do It!
                  </h3>
                  <div style={{ fontSize: '0.96rem', color: '#4B5563', lineHeight: '1.75' }}>
                    <p style={{ marginBottom: '0.85rem' }}>
                      Through decades of industry experience, leadership, and mentoring GETs and interns across industries, my association with Diksharambha Student Induction Programs at leading engineering colleges, and even my four years of conducting tuition classes during engineering to support my own education, I have realised one important thing:
                    </p>
                    <p style={{ marginBottom: '0.85rem', fontStyle: 'italic', color: '#1F2937', fontWeight: '600', background: 'rgba(121, 66, 181, 0.05)', padding: '0.85rem 1.15rem', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
                      The most valuable career question is not simply, <em>&ldquo;Which job pays the most?&rdquo;</em> It is <em>&ldquo;What kind of work allows me to use my natural temperament, grow consistently, and find genuine meaning in what I do?&rdquo;</em>
                    </p>
                    <p style={{ fontWeight: '700', color: '#111827', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                      Know yourself. Develop courage. Build your own path.
                    </p>
                    <p style={{ fontSize: '1.05rem', fontWeight: '800', color: '#7942b5', margin: 0 }}>
                      Come On&hellip; You Can Do It!
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ========================================================
            VIEW 2: THE 30-QUESTION ASSESSMENT SCREEN
            ======================================================== */}
        {currentStep === 'test' && (
          <div className={styles.assessmentCard}>
            {/* Sticky Progress Bar Header */}
            <div className={styles.progressBarContainer}>
              <div className={styles.progressStatsRow}>
                <span style={{ color: '#7942b5' }}>
                  Candidate: <strong>{candidate.name}</strong>
                </span>
                <span style={{ color: '#111827' }}>
                  {answeredCount} of 30 Answered ({progressPercent}%)
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className={styles.badge}>Part 2 &middot; Self-Reflection</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0.5rem 0' }}>
                Career Nature Questionnaire
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
                Answer honestly based on what you <strong>naturally enjoy doing</strong>&mdash;not what you think impresses others or what pays the highest salary.
              </p>
            </div>

            {/* Questions List */}
            <div className={styles.questionList}>
              {CAREER_QUESTIONS.map((question) => {
                const isSelected = answers[question.q] !== undefined;

                return (
                  <div
                    key={question.q}
                    className={`${styles.questionItem} ${isSelected ? styles.answered : ''}`}
                  >
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNumBadge}>#{question.q}</span>
                      <div className={styles.questionText}>{question.t}</div>
                    </div>

                    <div className={styles.likertRow}>
                      {LIKERT_SCALE.map((scale) => {
                        const active = answers[question.q] === scale.value;

                        return (
                          <button
                            key={scale.value}
                            type="button"
                            onClick={() => handleSelectAnswer(question.q, scale.value)}
                            className={`${styles.likertBtn} ${active ? styles.selected : ''}`}
                          >
                            <span className={styles.likertNum}>{scale.value}</span>
                            <span className={styles.likertLabel}>{scale.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Action Area */}
            <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <button
                onClick={handleSubmitAssessment}
                disabled={answeredCount < 30 || isSubmittingTest}
                className={styles.primaryCta}
                style={{ padding: '1.1rem 3rem', fontSize: '1.1rem' }}
              >
                {isSubmittingTest
                  ? "Computing Your Swadharma Profile..."
                  : answeredCount === 30
                  ? "Generate My Career Report 🚀"
                  : `Answer All Questions (${answeredCount}/30)`}
              </button>

              {answeredCount < 30 && (
                <p style={{ fontSize: '0.85rem', color: '#EF4444', marginTop: '0.75rem' }}>
                  Please answer remaining {30 - answeredCount} questions before submitting.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: RESULTS & DOWNLOAD REPORT SCREEN
            ======================================================== */}
        {currentStep === 'results' && results && (
          <div className={styles.resultsWrapper}>
            <div className={styles.resultsHeader}>
              <div className={styles.badge}>
                <span>🎯</span> Assessment Complete
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', margin: '0.5rem 0' }}>
                Your Career Swadharma Profile
              </h1>
              <p style={{ color: '#4B5563', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 1.5rem auto' }}>
                Congratulations, <strong>{candidate.name}</strong>! Based on your 30 responses, here is where your natural energy, cognitive strengths, and professional instincts lie.
              </p>

              {/* PDF DOWNLOAD BUTTON */}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className={styles.downloadPdfBtn}
              >
                <span>📥</span>
                <span>{isDownloadingPdf ? "Creating Your PDF..." : "Download Official Career Report (PDF)"}</span>
              </button>
            </div>

            {/* TOP 3 CARDS ROW */}
            <div className={styles.top3CardsRow}>
              {results.top3.map((cat, idx) => (
                <div
                  key={cat.code}
                  className={`${styles.topCard} ${idx === 0 ? styles.rank1 : idx === 1 ? styles.rank2 : styles.rank3}`}
                >
                  <span
                    className={styles.rankBadge}
                    style={{
                      background: idx === 0 ? '#7942b5' : idx === 1 ? '#3B82F6' : '#10B981',
                      color: '#FFFFFF'
                    }}
                  >
                    {cat.badge}
                  </span>

                  <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', marginBottom: '0.2rem' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
                    {cat.tagline}
                  </p>

                  <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                      <span>Alignment Score</span>
                      <span style={{ color: '#7942b5' }}>{cat.score} / 15</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(cat.score / 15) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #7942b5, #F59E0B)'
                        }}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5', flex: 1, marginBottom: '1rem' }}>
                    {cat.description}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: '#1F2937', background: '#F3F4F6', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                    <strong>Target Roles:</strong> {cat.roles}
                  </div>
                </div>
              ))}
            </div>

            {/* SYNERGY BOX */}
            {results.synergyInsight && (
              <div style={{ background: '#FAF5FF', border: '1px solid #E5D4FF', borderRadius: '18px', padding: '1.75rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>⚡</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#7942b5', margin: 0 }}>
                    Your Hybrid Career Synergy
                  </h3>
                </div>
                <p style={{ fontSize: '0.98rem', color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
                  {results.synergyInsight}
                </p>
              </div>
            )}

            {/* COMPLETE 10 DIMENSIONS TABLE */}
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', marginBottom: '1rem' }}>
              Full 10-Dimension Preference Breakdown
            </h3>
            <table className={styles.allCategoriesTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Dimension</th>
                  <th>Score (Max 15)</th>
                  <th>Preference Level</th>
                  <th>Applicable Careers</th>
                </tr>
              </thead>
              <tbody>
                {results.rankedCategories.map((c, i) => (
                  <tr key={c.code} style={{ background: i < 3 ? '#FCF9FF' : 'transparent' }}>
                    <td style={{ fontWeight: '800', color: i < 3 ? '#7942b5' : '#6B7280' }}>
                      #{i + 1}
                    </td>
                    <td style={{ fontWeight: '700', color: '#111827' }}>
                      <span style={{ marginRight: '6px' }}>{c.icon}</span> {c.name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700' }}>{c.score}/15</span>
                        <div style={{ width: '60px', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${(c.score / 15) * 100}%`,
                              height: '100%',
                              background: c.score >= 13 ? '#10B981' : c.score >= 10 ? '#3B82F6' : '#9CA3AF'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: c.interpretation?.color || '#10B981', fontWeight: '700' }}>
                      {c.interpretation?.level || 'Evaluated'}
                    </td>
                    <td style={{ color: '#4B5563', fontSize: '0.85rem' }}>
                      {c.roles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 1-on-1 MENTORSHIP CTA */}
            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', borderRadius: '24px', padding: '3rem 1.5rem', color: '#FFFFFF', textAlign: 'center', boxShadow: '0 20px 50px rgba(49, 46, 129, 0.25)' }}>
              <span style={{ color: '#FCD34D', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Next Step Towards Your Career Goal
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', margin: '0.75rem 0', color: '#FFFFFF' }}>
                Want Personal Guidance from An Expert?
              </h2>
              <p style={{ color: '#C7D2FE', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
                Book a 1-on-1 strategic mentorship session to analyze your test results, resume, and educational choices directly with the author of <em>Come On… You Can Do It!</em>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  href="/consulting"
                  style={{
                    background: '#F59E0B',
                    color: '#000000',
                    fontWeight: '800',
                    padding: '0.9rem 2.2rem',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>Book Mentorship Session</span>
                  <span>&rarr;</span>
                </Link>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    padding: '0.9rem 2rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  {isDownloadingPdf ? "Generating..." : "Download Career Report (PDF)"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
