"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function ClientDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null);
  const [activeTab, setActiveTab] = useState('consultations'); // 'consultations', 'orders', 'webinars'

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
      
      // Data contains { consultations, orders, webinars }
      setConsultations(data.consultations || []);
      setOrders(data.orders || []);
      setWebinars(data.webinars || []);
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

  const handlePhysicalUpgrade = async (orderId, bookId) => {
    const address = window.prompt("Please enter your complete shipping address for physical delivery:");
    if (!address) return;

    setIsProcessing(orderId + bookId);

    try {
      const token = localStorage.getItem('asg_token');
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load.");
        return;
      }

      // 1. Create Upgrade Order on Backend
      const orderRes = await fetch('/api/razorpay/create-physical-upgrade', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, bookId })
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) throw new Error(orderData.error);

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Avinash Book Store",
        description: "Physical Book Upgrade",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch('/api/razorpay/verify-physical-upgrade', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
                bookId,
                shippingAddress: address
              })
            });

            if (!verifyRes.ok) throw new Error("Verification failed");
            
            alert("Physical copy requested successfully! We will dispatch it soon.");
            fetchMyConsultations(); // Refresh Dashboard
          } catch (err) {
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: orderData.customerDetails.name,
          email: orderData.customerDetails.email,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      alert("Error initiating upgrade: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  if (loading) return <div className={styles.main}><div className={styles.loader}>Loading your dashboard...</div></div>;
  if (error) return <div className={styles.main}><div className={styles.error}>Error: {error}</div></div>;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Tabs Navigation */}
        <div className={styles.tabsNav}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'consultations' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('consultations')}
          >
            My Consultations
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'webinars' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('webinars')}
          >
            My Webinars
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Store Orders
          </button>
        </div>

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
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
        )}

        {/* Store Orders Tab */}
        {activeTab === 'orders' && (
          <div className={styles.section}>
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
                      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{padding: '1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '500'}}>
                              <span>{item.quantity}x {item.title}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                            
                            <div style={{display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap'}}>
                              {/* Read E-Book Button */}
                              {item.bookId?.ebookUrl ? (
                                <a href={item.bookId.ebookUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem', textDecoration: 'none'}}>
                                  📖 Read E-Book
                                </a>
                              ) : (
                                <span style={{fontSize: '0.8rem', color: '#6B7280', padding: '0.4rem 0'}}>E-Book processing...</span>
                              )}

                              {/* Request Physical Copy Button */}
                              {!item.isPhysicalRequested ? (
                                item.bookId?.physicalPrice > 0 ? (
                                  <button 
                                    onClick={() => handlePhysicalUpgrade(order._id, item.bookId._id)}
                                    className="btn-accent" 
                                    style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}
                                    disabled={isProcessing === order._id + item.bookId._id}
                                  >
                                    {isProcessing === order._id + item.bookId._id ? 'Processing...' : `📦 Request Physical Copy (+₹${(item.bookId.physicalPrice || 0) + (item.bookId.shippingCost || 0)})`}
                                  </button>
                                ) : (
                                  <span style={{fontSize: '0.8rem', color: '#6B7280', padding: '0.4rem 0'}}>Physical copy unavailable</span>
                                )
                              ) : (
                                <span style={{fontSize: '0.85rem', color: '#059669', background: '#D1FAE5', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: '500'}}>
                                  ✓ Physical Copy Requested ({item.physicalStatus})
                                </span>
                              )}
                            </div>
                            
                            {item.isPhysicalRequested && item.shippingAddress && (
                              <div style={{marginTop: '0.75rem', fontSize: '0.8rem', color: '#4B5563', padding: '0.5rem', background: '#F3F4F6', borderRadius: '4px'}}>
                                <strong>Shipping to:</strong> {item.shippingAddress}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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
        )}

        {/* Webinars Tab */}
        {activeTab === 'webinars' && (
          <div className={styles.section}>
            <div className={styles.headerRow}>
              <h2>My Registered Masterclasses</h2>
              <Link href="/webinars" className="btn-primary">Browse Masterclasses</Link>
            </div>

            {webinars.length === 0 ? (
              <div className={styles.emptyState}>
                <p>You haven't registered for any masterclasses yet.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {webinars.map(reg => (
                  <div key={reg._id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.dateBadge}>
                        <span className={styles.month}>{new Date(reg.webinarId?.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className={styles.day}>{new Date(reg.webinarId?.date).getDate()}</span>
                      </div>
                      <div className={styles.timeInfo}>
                        <h3>{reg.webinarId?.time}</h3>
                        <span className={`${styles.statusBadge} ${styles.paid}`}>
                          {reg.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.cardBody}>
                      <h4 style={{margin: '0 0 1rem 0', color: '#111827'}}>{reg.webinarId?.title}</h4>
                      
                      <div className={styles.paidContainer}>
                        <div className={styles.paidBadge}>✓ Registration Confirmed</div>
                        {reg.webinarId?.meetingLink ? (
                          <a href={reg.webinarId.meetingLink} target="_blank" rel="noopener noreferrer" className={`btn-primary ${styles.zoomBtn}`}>
                            📹 Join Meeting
                          </a>
                        ) : (
                          <div className={styles.pendingLink}>Meeting link will be updated soon.</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
