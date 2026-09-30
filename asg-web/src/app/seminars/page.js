"use client";

import { useState, useEffect } from 'react';
import styles from './seminar.module.css';
import StarRating from '@/components/StarRating';
import ReviewModal from '@/components/ReviewModal';
import ReviewsListModal from '@/components/ReviewsListModal';

export default function Seminars() {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Modal State
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [attendees, setAttendees] = useState([
    { name: '', email: '', whatsapp: '', profession: '' }
  ]);

  // Reviews State
  const [reviewsData, setReviewsData] = useState({});
  const [selectedSeminarForReviews, setSelectedSeminarForReviews] = useState(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [verifiedSeminarIds, setVerifiedSeminarIds] = useState([]);

  const fetchSeminars = async () => {
    try {
      const res = await fetch('/api/admin/seminars');
      if (res.ok) {
        const data = await res.json();
        setSeminars(data);
      }
    } catch (error) {
      console.error("Failed to load seminars", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?itemType=seminar');
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (data.reviews || []).forEach(r => {
          const sId = r.itemId?.toString();
          if (!sId) return;
          if (!map[sId]) map[sId] = { total: 0, sum: 0 };
          map[sId].total += 1;
          map[sId].sum += r.rating;
        });
        setReviewsData(map);
      }
    } catch (e) {
      console.error("Failed to load seminar reviews summary", e);
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
        setVerifiedSeminarIds(data.verifiedItems?.seminars || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSeminars();
    fetchReviews();
    checkUserVerification();
  }, []);

  const handleQuantityChange = (qty) => {
    const newQty = parseInt(qty);
    setTicketQuantity(newQty);
    
    setAttendees(prev => {
      const newAttendees = [...prev];
      if (newQty > prev.length) {
        // Add new empty attendee forms
        for (let i = prev.length; i < newQty; i++) {
          newAttendees.push({ name: '', email: '', whatsapp: '', profession: '' });
        }
      } else if (newQty < prev.length) {
        // Remove excess forms
        newAttendees.splice(newQty);
      }
      return newAttendees;
    });
  };

  const updateAttendee = (index, field, value) => {
    setAttendees(prev => {
      const newAttendees = [...prev];
      newAttendees[index] = { ...newAttendees[index], [field]: value };
      return newAttendees;
    });
  };

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
        alert("Please login to register for a seminar.");
        window.location.href = '/login';
        return;
      }

      if (selectedSeminar.price === 0) {
        alert("Free registration coming soon! (Integration pending)");
        setIsProcessing(false);
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // 1. Create Order on Backend
      const orderRes = await fetch('/api/razorpay/create-seminar-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          seminarId: selectedSeminar._id,
          quantity: ticketQuantity,
          attendees: attendees
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // Extract userId from token payload
      const payload = JSON.parse(atob(token.split('.')[1]));

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ASG Seminars",
        description: `Registration for ${selectedSeminar.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch('/api/razorpay/verify-seminar-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                seminarId: selectedSeminar._id,
                userId: payload.userId,
                quantity: ticketQuantity,
                attendees: attendees,
                amount: orderData.amount
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error("Verification failed: " + verifyData.error);
            }
            
            alert("Registration Successful! Your VIP Tickets have been generated.");
            setSelectedSeminar(null);
            setConsentAccepted(false);
            setTicketQuantity(1);
            setAttendees([{ name: '', email: '', whatsapp: '', profession: '' }]);
            window.location.href = '/dashboard';
          } catch (err) {
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: attendees[0].name,
          email: attendees[0].email,
          contact: attendees[0].whatsapp
        },
        theme: {
          color: "#059669", // Use a different theme color for seminars (greenish)
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
        <h1>In-Person Seminars &amp; Workshops</h1>
        <p>Book your seat for upcoming educational training workshops &amp; courses and network with industry experts.</p>
      </header>

      {loading ? (
        <div className={styles.loader}>Loading scheduled seminars...</div>
      ) : (
        <section className={styles.list}>
          {seminars.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No physical seminars are currently scheduled. Check back soon!</p>
          ) : (
            seminars.map((seminar) => {
              const remaining = seminar.seatsTotal - seminar.seatsBooked;
              const hasDiscount = seminar.originalPrice > seminar.price;
              
              return (
                <div key={seminar._id} className={`glass-card ${styles.seminarCard}`}>
                  <div className={styles.dateBlock}>
                    <span className={styles.month}>
                      {new Date(seminar.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className={styles.day}>
                      {new Date(seminar.date).getDate()}
                    </span>
                  </div>
                  
                  <div className={styles.content}>
                    <h2>{seminar.title}</h2>

                    {/* Ratings & Reviews */}
                    {(() => {
                      const stats = reviewsData[seminar._id] || { total: 0, sum: 0 };
                      const avgRating = stats.total > 0 ? (stats.sum / stats.total).toFixed(1) : '5.0';
                      const totalCount = stats.total;
                      const isVerified = verifiedSeminarIds.includes(seminar._id.toString());

                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.35rem 0', flexWrap: 'wrap' }}>
                          <div 
                            onClick={() => {
                              setSelectedSeminarForReviews(seminar);
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
                                alert("Only verified attendees who registered for this seminar can submit a review.");
                                return;
                              }
                              setSelectedSeminarForReviews(seminar);
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
                      <span className={styles.time}>🕒 {seminar.time}</span>
                      <span className={styles.seats}>🪑 {remaining} seats left</span>
                    </div>
                    <div className={styles.locationInfo}>
                      📍 {seminar.locationAddress}
                    </div>
                    <p className={styles.desc}>{seminar.description}</p>
                  </div>
                  
                  <div className={styles.actionBlock}>
                    <div className={styles.priceContainer}>
                      {hasDiscount && (
                        <span className={styles.originalPrice}>₹{seminar.originalPrice}</span>
                      )}
                      <div className={styles.price}>₹{seminar.price}</div>
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
                        setSelectedSeminar(seminar);
                        setTicketQuantity(1);
                        setAttendees([{ name: '', email: '', whatsapp: '', profession: '' }]);
                        setConsentAccepted(false);
                      }}
                    >
                      {remaining > 0 ? 'Book Ticket' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}

      {/* Registration Modal */}
      {selectedSeminar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Register for Seminar</h3>
              <button onClick={() => setSelectedSeminar(null)} className={styles.closeBtn}>&times;</button>
            </div>
            
            <div className={styles.seminarSummary}>
              <strong>{selectedSeminar.title}</strong>
              <div style={{fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem'}}>
                {new Date(selectedSeminar.date).toLocaleDateString()} at {selectedSeminar.time}
              </div>
              <div style={{fontSize: '0.85rem', color: '#059669', marginTop: '0.25rem', fontWeight: 600}}>
                📍 {selectedSeminar.locationAddress}
              </div>
            </div>

            <form onSubmit={handleRegister} className={styles.registrationForm}>
              <div className={styles.formGroup} style={{ marginBottom: '1.5rem', background: '#F3F4F6', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>Number of Tickets</label>
                <select 
                  value={ticketQuantity} 
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                >
                  {[...Array(Math.min(10, selectedSeminar.seatsTotal - selectedSeminar.seatsBooked))].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Ticket' : 'Tickets'}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.5rem' }}>
                  You are booking {ticketQuantity} {ticketQuantity === 1 ? 'ticket' : 'tickets'} at ₹{selectedSeminar.price} each. Total: ₹{selectedSeminar.price * ticketQuantity}
                </p>
              </div>

              <div className={styles.attendeeList}>
                {attendees.map((attendee, index) => (
                  <div key={index} className={styles.attendeeBlock}>
                    <div className={styles.attendeeHeader}>
                      👤 Attendee {index + 1}
                    </div>
                    
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={attendee.name}
                          onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={attendee.email}
                          onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>WhatsApp Number</label>
                        <input 
                          type="tel" 
                          required 
                          value={attendee.whatsapp}
                          onChange={(e) => updateAttendee(index, 'whatsapp', e.target.value)}
                          placeholder="+91 9876543210"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Profession / Role</label>
                        <input 
                          type="text" 
                          required 
                          value={attendee.profession}
                          onChange={(e) => updateAttendee(index, 'profession', e.target.value)}
                          placeholder="e.g. Founder, Marketing Manager, Student"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consent Form Block */}
              <div className={styles.consentBlock}>
                <label>Workshop Rules & Consent</label>
                <div className={styles.consentScroll}>
                  <p>1. Tickets are non-refundable and non-transferable.</p>
                  <p>2. Please arrive at the venue 30 minutes before the workshop begins.</p>
                  <p>3. The organizers reserve the right to admission.</p>
                  <p>4. Recording of the workshop is strictly prohibited.</p>
                  <p>5. By attending, you consent to being photographed and recorded for promotional purposes.</p>
                </div>
                <div className={styles.checkboxWrapper}>
                  <input 
                    type="checkbox" 
                    id="consentCheck" 
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    required
                  />
                  <label htmlFor="consentCheck">I have read and agree to the workshop rules & consent.</label>
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`btn-primary ${styles.submitBtn}`}
                disabled={isProcessing || !consentAccepted}
                style={{width: '100%', marginTop: '1rem', padding: '0.75rem', background: (isProcessing || !consentAccepted) ? '#9CA3AF' : '#059669'}}
              >
                {isProcessing ? 'Processing...' : `Proceed to Pay ₹${selectedSeminar.price * ticketQuantity}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List Modal */}
      {selectedSeminarForReviews && (
        <ReviewsListModal
          isOpen={reviewsModalOpen}
          onClose={() => setReviewsModalOpen(false)}
          item={{
            itemType: 'seminar',
            itemId: selectedSeminarForReviews._id,
            itemTitle: selectedSeminarForReviews.title
          }}
          onOpenWriteReview={() => {
            const token = localStorage.getItem('asg_token');
            if (!token) {
              alert("Please login first to write a review.");
              window.location.href = '/login';
              return;
            }
            if (!verifiedSeminarIds.includes(selectedSeminarForReviews._id.toString())) {
              alert("Only verified attendees who registered for this seminar can submit a review.");
              return;
            }
            setReviewsModalOpen(false);
            setReviewModalOpen(true);
          }}
          isVerifiedUser={verifiedSeminarIds.includes(selectedSeminarForReviews._id.toString())}
        />
      )}

      {/* Write Review Modal */}
      {selectedSeminarForReviews && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          item={{
            itemType: 'seminar',
            itemId: selectedSeminarForReviews._id,
            itemTitle: selectedSeminarForReviews.title
          }}
          onSuccess={() => {
            fetchReviews();
          }}
        />
      )}
    </main>
  );
}
