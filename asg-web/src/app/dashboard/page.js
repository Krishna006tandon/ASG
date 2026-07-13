"use client";

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

export default function ClientDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchMyConsultations = async () => {
    try {
      const token = localStorage.getItem('asg_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/user/consultations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch your data');
      const data = await res.json();
      setConsultations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyConsultations();
  }, []);

  const handlePayment = async (appt) => {
    setIsProcessing(appt._id);

    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(null);
        return;
      }

      // 2. Create Order on Backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appt._id })
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) throw new Error(orderData.error);

      // 3. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ASG Consulting",
        description: "Strategy Consultation",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 4. Verify Payment on Backend
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId: appt._id
              })
            });

            if (!verifyRes.ok) throw new Error("Verification failed");
            
            alert("Payment Successful!");
            fetchMyConsultations(); // Refresh Dashboard
          } catch (err) {
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: appt.customerDetails.name,
          email: appt.customerDetails.email,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      alert("Error initiating payment: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  if (loading) return <div className={styles.main}><div className={styles.loader}>Loading your dashboard...</div></div>;
  if (error) return <div className={styles.main}><div className={styles.error}>Error: {error}</div></div>;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>My Consultations</h1>
          <p>View your past strategy sessions and pending appointments.</p>
        </header>

        <section className={styles.grid}>
          {consultations.length === 0 ? (
            <div className={`glass-card ${styles.emptyCard}`}>
              You haven't booked any consultations yet.
            </div>
          ) : (
            consultations.map(appt => (
              <div key={appt._id} className={`glass-card ${styles.card}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.dateBlock}>
                    <span className={styles.date}>{new Date(appt.date).toLocaleDateString()}</span>
                    <span className={styles.time}>{appt.time}</span>
                  </div>
                  <div className={`${styles.badge} ${styles[appt.status.toLowerCase()] || styles.pending}`}>
                    {appt.status}
                  </div>
                </div>

                <div className={styles.details}>
                  <p className={styles.message}><strong>Subject:</strong> {appt.message || 'No description provided'}</p>
                </div>

                <div className={styles.paymentSection}>
                  <div className={styles.chargeRow}>
                    <span>Confirmed Charges:</span>
                    <span className={styles.price}>
                      {appt.charges ? `₹${appt.charges}` : 'Pending Admin Review'}
                    </span>
                  </div>

                  {appt.charges && appt.paymentStatus === 'Unpaid' && (
                    <button 
                      className={`btn-primary ${styles.payBtn}`}
                      onClick={() => handlePayment(appt)}
                      disabled={isProcessing === appt._id}
                    >
                      {isProcessing === appt._id ? 'Processing...' : 'Pay with Razorpay'}
                    </button>
                  )}
                  {appt.paymentStatus === 'Paid' && (
                    <div className={styles.paidContainer}>
                      <div className={styles.paidBadge}>✓ Payment Complete</div>
                      {appt.meetingLink ? (
                        <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className={`btn-primary ${styles.zoomBtn}`} style={{ background: '#2D8CFF', marginTop: '1rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                          📹 Join Zoom Meeting
                        </a>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.5rem', textAlign: 'center' }}>Meeting link pending...</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
