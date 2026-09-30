"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import TicketPDF from '@/components/TicketPDF';
import InvoicePDF from '@/components/InvoicePDF';
import ReviewModal from '@/components/ReviewModal';
import StarRating from '@/components/StarRating';
import { useRef } from 'react';
import styles from './dashboard.module.css';

export default function ClientDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [verifiedItems, setVerifiedItems] = useState({ books: [], webinars: [], seminars: [], canReviewPlatform: false });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalItem, setReviewModalItem] = useState({});
  const [reviewModalInitial, setReviewModalInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null);
  const [activeTab, setActiveTab] = useState('consultations'); // 'consultations', 'orders', 'webinars', 'seminars', 'reviews'
  const [generatingPdfFor, setGeneratingPdfFor] = useState(null);
  const [sharingFor, setSharingFor] = useState(null);
  
  // Invoice state
  const [generatingInvoiceFor, setGeneratingInvoiceFor] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);
  
  const [pdfTicketData, setPdfTicketData] = useState(null);
  const ticketRef = useRef(null);

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
      
      // Data contains { consultations, orders, webinars, seminarRegistrations }
      setConsultations(data.consultations || []);
      setOrders(data.orders || []);
      setWebinars(data.webinars || []);
      setSeminars(data.seminarRegistrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem('asg_token');
      if (!token) return;
      const res = await fetch('/api/user/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyReviews(data.reviews || []);
        if (data.verifiedItems) {
          setVerifiedItems(data.verifiedItems);
        }
      }
    } catch (err) {
      console.error('Failed to load user reviews:', err);
    }
  };

  useEffect(() => {
    fetchMyConsultations();
    fetchMyReviews();
  }, []);

  const getExistingReview = (itemType, itemId) => {
    if (itemType === 'platform') {
      return myReviews.find(r => r.itemType === 'platform');
    }
    const targetId = itemId ? itemId.toString() : '';
    return myReviews.find(r => r.itemType === itemType && r.itemId?.toString() === targetId);
  };

  const handleOpenReviewModal = (itemType, itemId, itemTitle) => {
    const existing = getExistingReview(itemType, itemId);
    setReviewModalItem({ itemType, itemId, itemTitle });
    setReviewModalInitial(existing ? { rating: existing.rating, comment: existing.comment } : null);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = (savedReview) => {
    fetchMyReviews();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/user/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete review');
      setMyReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadPDF = async (ticket) => {
    setGeneratingPdfFor(ticket._id);
    setPdfTicketData(ticket);
    
    // Give React a moment to render the hidden component with the new data
    setTimeout(async () => {
      try {
        if (!ticketRef.current) return;
        
        const canvas = await html2canvas(ticketRef.current, {
          scale: 3, // High resolution
          useCORS: true,
          backgroundColor: null,
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions (Landscape A4 roughly or custom size)
        // A4 size: 297mm x 210mm
        // Let's use custom size based on aspect ratio
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`VIP_Ticket_${ticket.ticketNumber}.pdf`);
        
      } catch (err) {
        console.error("PDF Generation failed", err);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setGeneratingPdfFor(null);
      }
    }, 500);
  };

  const handleShareWhatsApp = async (ticket) => {
    setSharingFor(ticket._id);
    setPdfTicketData(ticket);
    
    // Give React a moment to render the hidden component
    setTimeout(async () => {
      try {
        if (!ticketRef.current) return;
        
        const canvas = await html2canvas(ticketRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
        });
        
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `VIP_Ticket_${ticket.ticketNumber}.png`, { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: 'Webinar VIP Ticket',
                text: 'Here is your VIP Ticket for the Webinar!',
                files: [file]
              });
            } catch (shareError) {
              console.error("User cancelled or error sharing:", shareError);
            }
          } else {
            alert("Direct file sharing is not supported on this browser (usually requires Safari iOS or Chrome Android). Please download the PDF instead.");
          }
          setSharingFor(null);
        }, 'image/png');
        
      } catch (err) {
        console.error("Image Generation failed", err);
        alert("Failed to generate ticket image. Please try again.");
        setSharingFor(null);
      }
    }, 500);
  };

  const handleDownloadInvoice = async (item, type) => {
    try {
      setGeneratingInvoiceFor(item._id);

      // Map item to unified invoiceData format based on type
      let mappedData = {
        id: item._id,
        date: item.createdAt || item.date || new Date().toISOString(),
        type: type,
        customer: item.customerDetails || item.registrationData || { name: 'Valued Customer', email: 'Customer' }, 
        items: [],
        totalAmount: 0
      };

      if (type === 'Consultation') {
        mappedData.items = [{ title: `Consultation (${item.time})`, quantity: 1, price: item.charges }];
        mappedData.totalAmount = item.charges;
      } else if (type === 'Webinar Registration') {
        mappedData.items = [{ title: item.webinarId?.title || 'Webinar', quantity: 1, price: item.amountPaid }];
        mappedData.totalAmount = item.amountPaid;
      } else if (type === 'Seminar Ticket') {
        mappedData.items = [{ title: item.seminarId?.title || 'Seminar', quantity: 1, price: item.amountPaid }];
        mappedData.totalAmount = item.amountPaid;
      } else if (type === 'Store Order') {
        mappedData.items = item.items.map(i => ({
          title: i.title + (i.isPhysicalRequested ? ' (Physical)' : ' (E-Book)'),
          quantity: i.quantity,
          price: i.price + (i.isPhysicalRequested ? ((i.bookId?.physicalPrice || 0) + (i.bookId?.shippingCost || 0)) : 0)
        }));
        mappedData.totalAmount = item.totalAmount;
      }

      setInvoiceData(mappedData);

      // Wait for state to update and React to render the hidden component
      await new Promise(resolve => setTimeout(resolve, 300)); 

      if (!invoiceRef.current) throw new Error("Invoice component not found");

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${mappedData.id.substring(0, 8).toUpperCase()}.pdf`);

    } catch (err) {
      console.error(err);
      alert("Failed to generate invoice.");
    } finally {
      setGeneratingInvoiceFor(null);
      setInvoiceData(null);
    }
  };

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
          <button 
            className={`${styles.tabBtn} ${activeTab === 'seminars' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('seminars')}
          >
            My Seminars
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ My Reviews ({myReviews.length})
          </button>
        </div>

        {/* Platform Experience / Review Prompt Banner */}
        {verifiedItems.canReviewPlatform && (
          <div style={{
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            border: '1px solid #E9D5FF',
            borderRadius: '14px',
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 15px rgba(121, 66, 181, 0.06)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#6B21A8', fontSize: '1.05rem' }}>
                <span>🌟</span> Share Your Mentorship & Platform Experience
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#4B5563' }}>
                Your verified testimonial helps inspire fellow students, startup founders, and book readers.
              </p>
            </div>
            <button
              onClick={() => handleOpenReviewModal('platform', null, 'Avinash Gore Platform & Mentorship')}
              className="btn-accent"
              style={{
                padding: '0.55rem 1.4rem',
                fontSize: '0.85rem',
                background: '#7942B5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(121, 66, 181, 0.25)'
              }}
            >
              <span>⭐</span> {getExistingReview('platform', null) ? 'Edit Platform Review' : 'Write Platform Review'}
            </button>
          </div>
        )}

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
                          disabled={isProcessing === appt._id}
                        >
                          {isProcessing === appt._id ? 'Processing...' : `Pay ₹${appt.charges} with Razorpay`}
                        </button>
                      )}
                      {appt.paymentStatus === 'Paid' && (
                        <div className={styles.paidContainer}>
                          <div className={styles.paidBadge}>✓ Payment Complete</div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {appt.meetingLink ? (
                              <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className={`btn-primary ${styles.zoomBtn}`}>
                                📹 Join Zoom Meeting
                              </a>
                            ) : (
                              <div className={styles.pendingLink}>Meeting link pending...</div>
                            )}
                            <button 
                              className="btn-accent" 
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              onClick={() => handleDownloadInvoice(appt, 'Consultation')}
                              disabled={generatingInvoiceFor === appt._id}
                            >
                              {generatingInvoiceFor === appt._id ? '⏳ Generating...' : '⬇ Download Invoice'}
                            </button>
                            <button
                              onClick={() => handleOpenReviewModal('platform', null, 'Strategy Consultation & Mentorship')}
                              className="btn-accent"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                            >
                              <span>⭐</span> {getExistingReview('platform', null) ? 'Edit Review' : 'Review Mentorship'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                    <div className={styles.cardHeader} style={{borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
                      <div>
                        <h3 style={{fontSize: '1.1rem', margin: '0'}}>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                        <div style={{fontSize: '0.85rem', color: '#6B7280', marginTop: '0.2rem'}}>
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()] || styles.pending}`}>
                          {order.status}
                        </span>
                        {order.status !== 'Pending' && (
                          <button 
                            className="btn-accent" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => handleDownloadInvoice(order, 'Store Order')}
                            disabled={generatingInvoiceFor === order._id}
                          >
                            {generatingInvoiceFor === order._id ? '⏳...' : '⬇ Invoice'}
                          </button>
                        )}
                      </div>
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

                              {order.status !== 'Pending' && order.status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleOpenReviewModal('book', item.bookId?._id || item.bookId, item.title)}
                                  className="btn-accent"
                                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                                >
                                  <span>⭐</span> {getExistingReview('book', item.bookId?._id || item.bookId) ? 'Edit Review' : 'Add Review'}
                                </button>
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
              <h2>My Registered Webinars</h2>
              <Link href="/webinars" className="btn-primary">Browse Webinars</Link>
            </div>

            {webinars.length === 0 ? (
              <div className={styles.emptyState}>
                <p>You haven't registered for any webinars yet.</p>
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
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {reg.webinarId?.meetingLink ? (
                            <a href={reg.webinarId.meetingLink} target="_blank" rel="noopener noreferrer" className={`btn-primary ${styles.zoomBtn}`}>
                              📹 Join Meeting
                            </a>
                          ) : (
                            <div className={styles.pendingLink}>Meeting link will be updated soon.</div>
                          )}
                          <button 
                            className="btn-accent" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => handleDownloadInvoice(reg, 'Webinar Registration')}
                            disabled={generatingInvoiceFor === reg._id}
                          >
                            {generatingInvoiceFor === reg._id ? '⏳...' : '⬇ Invoice'}
                          </button>
                          {reg.paymentStatus === 'Paid' && (
                            <button
                              onClick={() => handleOpenReviewModal('webinar', reg.webinarId?._id, reg.webinarId?.title)}
                              className="btn-accent"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', cursor: 'pointer' }}
                            >
                              <span>⭐</span> {getExistingReview('webinar', reg.webinarId?._id) ? 'Edit Review' : 'Add Review'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seminars Tab */}
        {activeTab === 'seminars' && (
          <div className={styles.section}>
            <div className={styles.headerRow}>
              <h2>My In-Person Seminars</h2>
              <Link href="/seminars" className="btn-primary">Browse Seminars</Link>
            </div>

            {seminars.length === 0 ? (
              <div className={styles.emptyState}>
                <p>You haven't booked any seminar tickets yet.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {seminars.map(reg => (
                  <div key={reg._id} className={styles.card} style={{ borderLeft: '4px solid #059669', overflow: 'hidden' }}>
                    <div style={{ background: '#059669', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>ASG VIP TICKET</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '2px' }}>{reg.ticketNumber}</span>
                    </div>
                    <div className={styles.cardHeader} style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className={styles.dateBadge} style={{ background: '#ECFDF5', color: '#059669' }}>
                          <span className={styles.month}>{new Date(reg.seminarId?.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className={styles.day}>{new Date(reg.seminarId?.date).getDate()}</span>
                        </div>
                        <div className={styles.timeInfo}>
                          <h3>{reg.seminarId?.time}</h3>
                          <span className={`${styles.statusBadge} ${styles.paid}`}>
                            {reg.paymentStatus}
                          </span>
                        </div>
                      </div>
                      
                      {/* QR Code Block */}
                      <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <QRCodeCanvas 
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ticket/${reg.ticketNumber}`} 
                          size={60} 
                          bgColor={"#ffffff"}
                          fgColor={"#000000"}
                          level={"Q"}
                          includeMargin={false}
                        />
                        <span style={{ fontSize: '0.6rem', color: '#6B7280', marginTop: '0.25rem' }}>Scan at Entry</span>
                      </div>
                    </div>
                    
                    <div className={styles.cardBody}>
                      <h4 style={{margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.2rem'}}>{reg.seminarId?.title}</h4>
                      
                      <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px', marginBottom: '1rem', border: '1px dashed #D1D5DB' }}>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>VENUE LOCATION</div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>📍 {reg.seminarId?.locationAddress}</div>
                      </div>

                      <div className={styles.paidContainer} style={{ background: '#ECFDF5', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className={styles.paidBadge} style={{ color: '#059669' }}>✓ Ticket Confirmed for {reg.registrationData?.name}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button 
                            className="btn-accent" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white' }}
                            onClick={() => handleShareWhatsApp(reg)}
                            disabled={sharingFor === reg._id}
                          >
                            {sharingFor === reg._id ? '⏳...' : '💬 WhatsApp'}
                          </button>
                          <button 
                            className="btn-accent" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => handleDownloadPDF(reg)}
                            disabled={generatingPdfFor === reg._id}
                          >
                            {generatingPdfFor === reg._id ? '⏳ Generating...' : '⬇ Download PDF'}
                          </button>
                          {reg.paymentStatus === 'Paid' && (
                            <button
                              onClick={() => handleOpenReviewModal('seminar', reg.seminarId?._id, reg.seminarId?.title)}
                              className="btn-accent"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', cursor: 'pointer' }}
                            >
                              <span>⭐</span> {getExistingReview('seminar', reg.seminarId?._id) ? 'Edit Review' : 'Add Review'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className={styles.section}>
            <div className={styles.headerRow}>
              <div>
                <h2>My Reviews & Testimonials</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
                  Manage and edit all the ratings and feedback you have submitted across books, workshops, seminars, and mentorship.
                </p>
              </div>
              {verifiedItems.canReviewPlatform && (
                <button
                  onClick={() => handleOpenReviewModal('platform', null, 'Avinash Gore Platform & Mentorship')}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                >
                  <span>★</span> {getExistingReview('platform', null) ? 'Edit Platform Review' : 'Write Platform Review'}
                </button>
              )}
            </div>

            {myReviews.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✍️</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>No reviews submitted yet</h3>
                <p style={{ maxWidth: '500px', margin: '0 auto', color: '#6B7280' }}>
                  Once you purchase a book, register for a workshop, attend a seminar, or complete a consultation, you can share your verified review here!
                </p>
              </div>
            ) : (
              <div className={styles.grid}>
                {myReviews.map(rev => (
                  <div key={rev._id} className={styles.card} style={{ borderLeft: '4px solid #7942B5' }}>
                    <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
                      <div>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          background: rev.itemType === 'book' ? '#EEF2FF' : rev.itemType === 'webinar' ? '#ECFDF5' : rev.itemType === 'seminar' ? '#FEF3C7' : '#F3E8FF',
                          color: rev.itemType === 'book' ? '#4F46E5' : rev.itemType === 'webinar' ? '#059669' : rev.itemType === 'seminar' ? '#D97706' : '#7942B5',
                          display: 'inline-block',
                          marginBottom: '0.35rem'
                        }}>
                          {rev.itemType === 'book' ? 'Book Review' : rev.itemType === 'webinar' ? 'Workshop Review' : rev.itemType === 'seminar' ? 'Seminar Review' : 'Mentorship Review'}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{rev.itemTitle}</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StarRating rating={rev.rating} readOnly={true} size={16} />
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                          {new Date(rev.updatedAt || rev.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <p style={{ margin: '0 0 1.25rem 0', color: '#374151', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {rev.comment}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                          ✓ Published & Verified
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenReviewModal(rev.itemType, rev.itemId, rev.itemTitle)}
                            className="btn-accent"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            style={{
                              padding: '0.35rem 0.85rem',
                              fontSize: '0.8rem',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FCA5A5',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Modal Dialog */}
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          item={reviewModalItem}
          initialReview={reviewModalInitial}
          onSuccess={handleReviewSuccess}
        />

        {/* Hidden Components for PDF Rendering */}
        <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: -100 }}>
          <TicketPDF ticket={pdfTicketData} ticketRef={ticketRef} />
          <InvoicePDF invoiceData={invoiceData} invoiceRef={invoiceRef} />
        </div>
      </div>
    </main>
  );
}
