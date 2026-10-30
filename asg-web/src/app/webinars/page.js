"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './webinar.module.css';
import StarRating from '@/components/StarRating';
import ReviewModal from '@/components/ReviewModal';
import ReviewsListModal from '@/components/ReviewsListModal';

export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Modal State
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', whatsapp: '', profession: ''
  });

  // Reviews State
  const [reviewsData, setReviewsData] = useState({});
  const [selectedWebinarForReviews, setSelectedWebinarForReviews] = useState(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [verifiedWebinarIds, setVerifiedWebinarIds] = useState([]);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const getDiscountedPrice = () => {
    if (!selectedWebinar) return 0;
    const base = selectedWebinar.price || 0;
    if (!appliedCoupon) return base;
    if (appliedCoupon.discountType === 'percentage') {
      let discount = Math.round((base * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
        discount = appliedCoupon.maxDiscountAmount;
      }
      return Math.max(0, base - discount);
    } else {
      return Math.max(0, base - appliedCoupon.discountValue);
    }
  };

  const getDiscountAmount = () => {
    if (!selectedWebinar || !appliedCoupon) return 0;
    return Math.max(0, (selectedWebinar.price || 0) - getDiscountedPrice());
  };

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim() || !selectedWebinar) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim().toUpperCase(),
          itemType: 'webinar',
          itemId: selectedWebinar._id,
          currentAmount: selectedWebinar.price || 0
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
  };

  const fetchWebinars = async () => {
    try {
      const res = await fetch('/api/webinars');
      if (res.ok) {
        const data = await res.json();
        setWebinars(data);
      }
    } catch (error) {
      console.error("Failed to load webinars", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?itemType=webinar');
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (data.reviews || []).forEach(r => {
          const wId = r.itemId?.toString();
          if (!wId) return;
          if (!map[wId]) map[wId] = { total: 0, sum: 0 };
          map[wId].total += 1;
          map[wId].sum += r.rating;
        });
        setReviewsData(map);
      }
    } catch (e) {
      console.error("Failed to load reviews summary", e);
    }
  };

  const checkUserVerification = async () => {
    const token = localStorage.getItem('asg_token');
    if (!token) return;
    try {
      const res = await fetch('/api/user/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerifiedWebinarIds(data.verifiedItems?.webinars || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWebinars();
    fetchReviews();
    checkUserVerification();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('asg_token');
      if (!token) {
        alert("Please login to register for a webinar.");
        window.location.href = '/login';
        return;
      }

      // 1. Create Order on Backend (pass couponCode if applied)
      const orderRes = await fetch('/api/razorpay/create-webinar-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          webinarId: selectedWebinar._id,
          registrationData: formData,
          couponCode: appliedCoupon?.code || null
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // If 100% Free coupon applied, registration is already confirmed on backend!
      if (orderData.isFree) {
        alert("🎉 " + (orderData.message || "Registration Successful for FREE using your coupon!"));
        setSelectedWebinar(null);
        setAppliedCoupon(null);
        setFormData({ name: '', email: '', whatsapp: '', profession: '' });
        window.location.href = '/dashboard';
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Extract userId from token payload on client (fallback)
      const payload = JSON.parse(atob(token.split('.')[1]));

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ASG Training Workshops",
        description: `Training Workshop Registration for ${selectedWebinar.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch('/api/razorpay/verify-webinar-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                webinarId: selectedWebinar._id,
                userId: payload.userId,
                registrationData: formData,
                amount: orderData.amount,
                couponApplied: orderData.couponApplied,
                discountAmount: orderData.discountAmount
              })
            });

            if (!verifyRes.ok) throw new Error("Verification failed");
            
            alert("Registration Successful! See you in the workshop.");
            setSelectedWebinar(null);
            setAppliedCoupon(null);
            setFormData({ name: '', email: '', whatsapp: '', profession: '' });
            window.location.href = '/dashboard';
          } catch (err) {
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.whatsapp
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      alert("Error initiating checkout: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Training Workshops</h1>
        <p>Book your seat for upcoming interactive training workshops and educational programs to enhance your skills.</p>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/gallery" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(121, 66, 181, 0.08)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.88rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
            📷 Looking for past workshops &amp; event photos? Explore Gallery &rarr;
          </Link>
        </div>
      </header>

      {loading ? (
        <div className={styles.loader}>Loading scheduled training workshops...</div>
      ) : (
        <section className={styles.list}>
          {webinars.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No training workshops are currently scheduled. Check back soon!</p>
          ) : (
            webinars.map((webinar) => {
              const remaining = webinar.seatsTotal - webinar.seatsBooked;
              const hasDiscount = webinar.originalPrice > webinar.price;
              
              return (
                <div key={webinar._id} className={`glass-card ${styles.webinarCard}`}>
                  <div className={styles.dateBlock}>
                    <span className={styles.month}>
                      {new Date(webinar.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className={styles.day}>
                      {new Date(webinar.date).getDate()}
                    </span>
                  </div>
                  
                  <div className={styles.content}>
                    <h2>{webinar.title}</h2>

                    {/* Ratings & Reviews */}
                    {(() => {
                      const stats = reviewsData[webinar._id] || { total: 0, sum: 0 };
                      const avgRating = stats.total > 0 ? (stats.sum / stats.total).toFixed(1) : '5.0';
                      const totalCount = stats.total;
                      const isVerified = verifiedWebinarIds.includes(webinar._id.toString());

                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.35rem 0', flexWrap: 'wrap' }}>
                          <div 
                            onClick={() => {
                              setSelectedWebinarForReviews(webinar);
                              setReviewsModalOpen(true);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                            title="Click to view reviews"
                          >
                            <StarRating rating={Number(avgRating)} readOnly={true} size={15} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827' }}>{avgRating}</span>
                            <span style={{ fontSize: '0.8rem', color: '#6B7280', textDecoration: 'underline' }}>
                              ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              const token = localStorage.getItem('asg_token');
                              if (!token) {
                                alert("Please login first to write a review.");
                                window.location.href = '/login';
                                return;
                              }
                              if (!isVerified) {
                                alert("Only verified attendees who have registered for this workshop can submit a review.");
                                return;
                              }
                              setSelectedWebinarForReviews(webinar);
                              setReviewModalOpen(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isVerified ? '#7942B5' : '#9CA3AF',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              padding: '0.1rem 0.4rem',
                              textDecoration: 'underline'
                            }}
                          >
                            {isVerified ? '✍️ Add Review' : '★ Review'}
                          </button>
                        </div>
                      );
                    })()}

                    <div className={styles.metaRow}>
                      <span className={styles.time}>🕒 {webinar.time}</span>
                      <span className={styles.seats}>🪑 {remaining} seats left</span>
                    </div>
                    <p className={styles.desc}>{webinar.description}</p>
                  </div>
                  
                  <div className={styles.actionBlock}>
                    <div className={styles.priceContainer}>
                      {hasDiscount && (
                        <span className={styles.originalPrice}>₹{webinar.originalPrice}</span>
                      )}
                      <div className={styles.price}>₹{webinar.price}</div>
                    </div>
                    <button 
                      className={`btn-primary ${styles.bookBtn}`}
                      disabled={remaining <= 0}
                      onClick={() => {
                        const token = localStorage.getItem('asg_token');
                        if (!token) {
                          alert("Please login first to book a seat.");
                          window.location.href = '/login';
                          return;
                        }
                        setSelectedWebinar(webinar);
                      }}
                    >
                      {remaining > 0 ? 'Book Seat' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}

      {/* Registration Modal */}
      {selectedWebinar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Register for Training Workshop</h3>
              <button onClick={() => setSelectedWebinar(null)} className={styles.closeBtn}>&times;</button>
            </div>
            
            <div className={styles.webinarSummary}>
              <strong>{selectedWebinar.title}</strong>
              <div style={{fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem'}}>
                {new Date(selectedWebinar.date).toLocaleDateString()} at {selectedWebinar.time}
              </div>
            </div>

            <form onSubmit={handleRegister} className={styles.registrationForm}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>WhatsApp Number</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Profession / Role</label>
                <input 
                  type="text" 
                  required 
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                  placeholder="e.g. Founder, Marketing Manager, Student"
                />
              </div>
              
              {/* Discreet Coupon Section */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px dashed #E5E7EB' }}>
                {!appliedCoupon ? (
                  <div>
                    {!showCouponInput ? (
                      <button
                        type="button"
                        onClick={() => setShowCouponInput(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4F46E5',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: '0.2rem 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>🏷️</span> Have a coupon or workshop access code?
                      </button>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                            style={{
                              flex: 1,
                              padding: '0.45rem 0.6rem',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.85rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: '600'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCodeInput.trim()}
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: '6px',
                              background: '#4F46E5',
                              color: '#fff',
                              border: 'none',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: couponLoading || !couponCodeInput.trim() ? 'not-allowed' : 'pointer',
                              opacity: couponLoading || !couponCodeInput.trim() ? 0.6 : 1
                            }}
                          >
                            {couponLoading ? '...' : 'Apply'}
                          </button>
                        </div>
                        {couponError && (
                          <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                            {couponError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ color: '#065F46', fontWeight: '600' }}>
                      ✓ <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#DC2626',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price summary */}
              {appliedCoupon && getDiscountAmount() > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6B7280', marginTop: '0.35rem' }}>
                  <span>Original Fee:</span>
                  <span style={{ textDecoration: 'line-through' }}>₹{selectedWebinar.price}</span>
                </div>
              )}
              {appliedCoupon && getDiscountAmount() > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>
                  <span>Coupon Discount:</span>
                  <span>-₹{getDiscountAmount()}</span>
                </div>
              )}

              <button 
                type="submit" 
                className={`btn-primary ${styles.submitBtn}`}
                disabled={isProcessing}
                style={{width: '100%', marginTop: '1rem', padding: '0.75rem'}}
              >
                {isProcessing 
                  ? 'Processing...' 
                  : (getDiscountedPrice() === 0 ? 'Register for FREE 🎉' : `Proceed to Pay ₹${getDiscountedPrice()}`)
                }
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List Modal */}
      {selectedWebinarForReviews && (
        <ReviewsListModal
          isOpen={reviewsModalOpen}
          onClose={() => setReviewsModalOpen(false)}
          item={{
            itemType: 'webinar',
            itemId: selectedWebinarForReviews._id,
            itemTitle: selectedWebinarForReviews.title
          }}
          onOpenWriteReview={() => {
            const token = localStorage.getItem('asg_token');
            if (!token) {
              alert("Please login first to write a review.");
              window.location.href = '/login';
              return;
            }
            if (!verifiedWebinarIds.includes(selectedWebinarForReviews._id.toString())) {
              alert("Only verified attendees who registered for this workshop can submit a review.");
              return;
            }
            setReviewsModalOpen(false);
            setReviewModalOpen(true);
          }}
          isVerifiedUser={verifiedWebinarIds.includes(selectedWebinarForReviews._id.toString())}
        />
      )}

      {/* Write Review Modal */}
      {selectedWebinarForReviews && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          item={{
            itemType: 'webinar',
            itemId: selectedWebinarForReviews._id,
            itemTitle: selectedWebinarForReviews.title
          }}
          onSuccess={() => {
            fetchReviews();
          }}
        />
      )}
    </main>
  );
}
