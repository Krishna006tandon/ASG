"use client";

import { useState, useEffect } from 'react';
import styles from './webinar.module.css';

export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Modal State
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', whatsapp: '', profession: ''
  });

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const res = await fetch('/api/admin/webinars');
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
    
    fetchWebinars();
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
        alert("Please login to register for a masterclass.");
        window.location.href = '/login';
        return;
      }

      // If it's a free webinar (price === 0), we would skip razorpay, but assuming paid for now
      if (selectedWebinar.price === 0) {
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
      const orderRes = await fetch('/api/razorpay/create-webinar-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          webinarId: selectedWebinar._id,
          registrationData: formData
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // Extract userId from token payload on client (fallback)
      const payload = JSON.parse(atob(token.split('.')[1]));

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ASG Masterclasses",
        description: `Registration for ${selectedWebinar.title}`,
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
                amount: orderData.amount
              })
            });

            if (!verifyRes.ok) throw new Error("Verification failed");
            
            alert("Registration Successful! See you in the masterclass.");
            setSelectedWebinar(null);
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
        <h1>Live Masterclasses</h1>
        <p>Book your seat for upcoming interactive sessions and transform your strategy.</p>
      </header>

      {loading ? (
        <div className={styles.loader}>Loading scheduled masterclasses...</div>
      ) : (
        <section className={styles.list}>
          {webinars.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No masterclasses are currently scheduled. Check back soon!</p>
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
              <h3>Register for Masterclass</h3>
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
              
              <button 
                type="submit" 
                className={`btn-primary ${styles.submitBtn}`}
                disabled={isProcessing}
                style={{width: '100%', marginTop: '1rem', padding: '0.75rem'}}
              >
                {isProcessing ? 'Processing...' : `Proceed to Pay ₹${selectedWebinar.price}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
