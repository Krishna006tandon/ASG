"use client";

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

export default function ClientDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [orders, setOrders] = useState([]);
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
      
      // Data contains both { consultations, orders }
      setConsultations(data.consultations || []);
      setOrders(data.orders || []);
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
        <div className={styles.section}>
          <div className={styles.headerRow}>
            <h2>My Consultations</h2>
            <Link href="/consulting" className="btn-primary">Book New Session</Link>
          </div>

          {consultations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't booked any consultations yet.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {consultations.map(appt => (
                <div key={appt._id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.dateBadge}>
                      <span className={styles.month}>{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className={styles.day}>{new Date(appt.date).getDate()}</span>
                    </div>
                    <div className={styles.timeInfo}>
                      <h3>{appt.time}</h3>
                      <span className={`${styles.statusBadge} ${styles[appt.status.toLowerCase()] || styles.pending}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    {appt.message && (
                      <p className={styles.message}>"{appt.message}"</p>
                    )}
                    {appt.charges && appt.paymentStatus === 'Pending' && (
                      <div className={styles.chargesAlert}>
                        Admin has set the charges for this session at <strong>₹{appt.charges}</strong>
                      </div>
                    )}
                    
                    {appt.status === 'Confirmed' && appt.paymentStatus === 'Pending' && appt.charges && (
                      <button 
                        onClick={() => handlePayment(appt._id, appt.charges)} 
                        className={`btn-accent ${styles.payBtn}`}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : `Pay ₹${appt.charges} with Razorpay`}
                      </button>
                    )}
                    {appt.paymentStatus === 'Paid' && (
                      <div className={styles.paidContainer}>
                        <div className={styles.paidBadge}>✓ Payment Complete</div>
                        {appt.meetingLink ? (
                          <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className={`btn-primary ${styles.zoomBtn}`}>
                            📹 Join Zoom Meeting
                          </a>
                        ) : (
                          <div className={styles.pendingLink}>Meeting link pending...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section} style={{marginTop: '3rem'}}>
          <div className={styles.headerRow}>
            <h2>My Store Orders</h2>
            <Link href="/ecommerce" className="btn-primary">Visit Store</Link>
          </div>

          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't purchased any items yet.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {orders.map(order => (
                <div key={order._id} className={styles.card}>
                  <div className={styles.cardHeader} style={{borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem', marginBottom: '1rem'}}>
                    <div>
                      <h3 style={{fontSize: '1.1rem', margin: '0'}}>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                      <div style={{fontSize: '0.85rem', color: '#6B7280', marginTop: '0.2rem'}}>
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()] || styles.pending}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <ul style={{listStyle: 'none', padding: 0, margin: '0 0 1rem 0'}}>
                      {order.items.map((item, i) => (
                        <li key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem'}}>
                          <span>{item.quantity}x {item.title}</span>
                          <span style={{fontWeight: 'bold'}}>₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '1rem', fontWeight: 'bold'}}>
                      <span>Total Amount</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
