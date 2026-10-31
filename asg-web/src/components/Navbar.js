"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: '', email: '', phone: '', address: ''
  });
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();
  // We use local state in Navbar to track physical requested toggles
  const [physicalSelections, setPhysicalSelections] = useState({});

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const updateCartItemPhysical = (id, checked) => {
    setPhysicalSelections(prev => ({ ...prev, [id]: checked }));
  };

  const calculateBaseTotal = () => {
    return cart.reduce((sum, item) => {
      let itemPrice = item.price;
      const key = item.cartItemId || item._id;
      const isPhysical = item.isPhysicalRequested || physicalSelections[key] || physicalSelections[item._id];
      if (isPhysical) {
        itemPrice += (item.physicalPrice || 0) + (item.shippingCost || 0);
      }
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  const calculateDiscountAmount = () => {
    const baseTotal = calculateBaseTotal();
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      let discount = Math.round((baseTotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
        discount = appliedCoupon.maxDiscountAmount;
      }
      return discount;
    } else {
      return Math.min(baseTotal, appliedCoupon.discountValue);
    }
  };

  const calculateFinalTotal = () => {
    const baseTotal = calculateBaseTotal();
    const discount = calculateDiscountAmount();
    return Math.max(0, baseTotal - discount);
  };

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const baseTotal = calculateBaseTotal();
      const allItemIds = cart.map(item => item._id || item.bookId).filter(Boolean);
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim().toUpperCase(),
          itemType: 'store',
          itemIds: allItemIds,
          currentAmount: baseTotal
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

  useEffect(() => {
    const token = localStorage.getItem('asg_token');
    
    if (token) {
      setIsLoggedIn(true);
      
      // Attempt to decode the JWT payload to get the role reliably
      try {
        const payloadStr = atob(token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        if (payload.role === 'admin') {
          setIsAdmin(true);
          return;
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
      
      // Fallback
      const role = localStorage.getItem('asg_role');
      if (role === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('asg_token');
    localStorage.removeItem('asg_role');
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = '/';
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

  const handleStoreCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const token = localStorage.getItem('asg_token');
      if (!token) {
        alert("Please login to checkout.");
        window.location.href = '/login';
        return;
      }

      const cartWithSelections = cart.map(item => {
        const key = item.cartItemId || item._id;
        return {
          ...item,
          isPhysicalRequested: Boolean(item.isPhysicalRequested || physicalSelections[key] || physicalSelections[item._id])
        };
      });

      // Create Order on Backend (pass couponCode if applied)
      const orderRes = await fetch('/api/razorpay/create-store-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          cart: cartWithSelections, 
          customerDetails: checkoutDetails,
          couponCode: appliedCoupon?.code || null
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          localStorage.removeItem('asg_token');
          alert("Session expired. Please login again to checkout.");
          window.location.href = '/login';
          return;
        }
        throw new Error(orderData.error);
      }

      // If 100% discount / free coupon applied, order is already created & paid on backend
      if (orderData.isFree) {
        alert("🎉 " + (orderData.message || "Order placed successfully for FREE using your coupon!"));
        clearCart();
        setAppliedCoupon(null);
        setShowCheckoutForm(false);
        setIsCartOpen(false);
        window.location.href = '/dashboard?tab=orders';
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsCheckingOut(false);
        return;
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Avinash Book Store",
        description: "Store Purchase",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-store-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                cart: cartWithSelections,
                totalAmount: orderData.totalAmount,
                couponApplied: orderData.couponApplied,
                discountAmount: orderData.discountAmount,
                customerDetails: orderData.customerDetails
              })
            });

            if (!verifyRes.ok) throw new Error("Verification failed");
            
            alert("Payment Successful! Your books are on the way.");
            clearCart();
            setAppliedCoupon(null);
            setShowCheckoutForm(false);
            setIsCartOpen(false);
            window.location.href = '/dashboard?tab=orders';
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
      alert("Error initiating checkout: " + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/images/image5.jpg" alt="Avinash Gore" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }} />
          <span style={{ fontSize: '1.35rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Avinash Gore</span>
        </Link>
        <div className={styles.links}>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>Home</Link>
          <Link href="/about" className={pathname === '/about' ? styles.active : ''}>About</Link>
          <Link href="/exam-guidance" className={pathname === '/exam-guidance' ? styles.active : ''}>Exam Guidance</Link>
          <Link href="/career-guidance" className={pathname.startsWith('/career-guidance') ? styles.active : ''}>Career Guidance</Link>
          <Link href="/startup-guidance" className={pathname === '/startup-guidance' || pathname === '/startup-support' ? styles.active : ''}>Start-up Guidance</Link>
          <Link href="/ecommerce" className={pathname === '/ecommerce' ? styles.active : ''}>Store</Link>
          <Link href="/recommends" className={pathname === '/recommends' ? styles.active : ''}>Blog</Link>
          <Link href="/webinars" className={pathname === '/webinars' ? styles.active : ''}>Workshops</Link>
          <Link href="/seminars" className={pathname === '/seminars' ? styles.active : ''}>Seminars</Link>
          <Link href="/gallery" className={pathname === '/gallery' ? styles.active : ''}>Gallery</Link>
          <Link href="/reviews" className={pathname === '/reviews' ? styles.active : ''}>Reviews</Link>
          <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>Contact</Link>
        </div>
        
        <div className={styles.actions}>
          {/* Universal Shopping Cart Icon (Always Visible) */}
          <div className={styles.cartContainer}>
            <button 
              type="button"
              className={styles.cartIcon} 
              onClick={() => setIsCartOpen(!isCartOpen)}
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ width: '20px', height: '20px' }}
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {mounted && cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </button>
                
                {isCartOpen && (
                  <div className={styles.cartDropdown}>
                    <div className={styles.cartHeader}>
                      <h3>{showCheckoutForm ? 'Checkout Details' : 'Your Cart'}</h3>
                      <button onClick={() => { setIsCartOpen(false); setShowCheckoutForm(false); }} className={styles.closeBtn}>&times;</button>
                    </div>
                    
                    {cart.length === 0 ? (
                      <p className={styles.emptyCart}>Your cart is empty.</p>
                    ) : showCheckoutForm ? (
                      <div className={styles.cartBody}>
                        <form onSubmit={(e) => { e.preventDefault(); handleStoreCheckout(); }} style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                          <div>
                            <label style={{fontSize: '0.85rem', fontWeight: '500'}}>Full Name *</label>
                            <input required type="text" value={checkoutDetails.name} onChange={e => setCheckoutDetails({...checkoutDetails, name: e.target.value})} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #D1D5DB'}} />
                          </div>
                          <div>
                            <label style={{fontSize: '0.85rem', fontWeight: '500'}}>Email *</label>
                            <input required type="email" value={checkoutDetails.email} onChange={e => setCheckoutDetails({...checkoutDetails, email: e.target.value})} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #D1D5DB'}} />
                          </div>
                          
                          <div style={{marginTop: '0.5rem', padding: '0.75rem', background: '#F3F4F6', borderRadius: '8px'}}>
                            <h4 style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>Selected Formats</h4>
                            {cart.map(item => {
                              const itemKey = item.cartItemId || item._id;
                              const isPhysical = Boolean(item.isPhysicalRequested || physicalSelections[itemKey] || physicalSelections[item._id]);
                              return (
                                <div key={itemKey} style={{marginBottom: '0.5rem', fontSize: '0.85rem'}}>
                                  <div style={{fontWeight: '500'}}>{item.title}</div>
                                  <label style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', cursor: item.isPhysicalRequested ? 'default' : 'pointer'}}>
                                    <input 
                                      type="checkbox" 
                                      checked={isPhysical}
                                      disabled={item.isPhysicalRequested}
                                      onChange={(e) => updateCartItemPhysical(itemKey, e.target.checked)}
                                    />
                                    <span>
                                      {item.isPhysicalRequested 
                                        ? `📦 Physical Copy included (+₹${(item.physicalPrice || 0) + (item.shippingCost || 0)})`
                                        : `Add Physical Copy (+₹${(item.physicalPrice || 0) + (item.shippingCost || 0)})`
                                      }
                                    </span>
                                  </label>
                                </div>
                              );
                            })}
                          </div>

                          {cart.some(item => item.isPhysicalRequested || physicalSelections[item.cartItemId || item._id] || physicalSelections[item._id]) && (
                            <>
                              <div>
                                <label style={{fontSize: '0.85rem', fontWeight: '500'}}>Phone Number *</label>
                                <input required type="tel" value={checkoutDetails.phone} onChange={e => setCheckoutDetails({...checkoutDetails, phone: e.target.value})} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #D1D5DB'}} placeholder="For delivery updates" />
                              </div>
                              <div>
                                <label style={{fontSize: '0.85rem', fontWeight: '500'}}>Shipping Address *</label>
                                <textarea required value={checkoutDetails.address} onChange={e => setCheckoutDetails({...checkoutDetails, address: e.target.value})} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #D1D5DB', minHeight: '60px'}} placeholder="Full Street Address, City, State, Pincode" />
                              </div>
                            </>
                          )}
                          
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
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      padding: '0.2rem 0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.35rem'
                                    }}
                                  >
                                    <span>🏷️</span> Have a coupon code?
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
                                          padding: '0.4rem 0.6rem',
                                          borderRadius: '6px',
                                          border: '1px solid #D1D5DB',
                                          fontSize: '0.8rem',
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
                                          padding: '0.4rem 0.8rem',
                                          borderRadius: '6px',
                                          background: '#4F46E5',
                                          color: '#fff',
                                          border: 'none',
                                          fontSize: '0.8rem',
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
                                padding: '0.4rem 0.6rem',
                                fontSize: '0.8rem'
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
                          {appliedCoupon && calculateDiscountAmount() > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '0.35rem' }}>
                              <span>Original Total:</span>
                              <span style={{ textDecoration: 'line-through' }}>₹{calculateBaseTotal()}</span>
                            </div>
                          )}
                          {appliedCoupon && calculateDiscountAmount() > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>
                              <span>Coupon Discount:</span>
                              <span>-₹{calculateDiscountAmount()}</span>
                            </div>
                          )}
                          
                          <div className={styles.cartTotal} style={{marginTop: '0.5rem', borderTop: '1px solid #E5E7EB', paddingTop: '0.5rem'}}>
                            <span>Final Total:</span>
                            <span style={{ color: calculateFinalTotal() === 0 ? '#059669' : 'inherit', fontWeight: 'bold' }}>
                              {calculateFinalTotal() === 0 ? 'FREE (₹0)' : `₹${calculateFinalTotal()}`}
                            </span>
                          </div>
                          
                          <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                            <button type="button" onClick={() => setShowCheckoutForm(false)} className="btn-secondary" style={{flex: 1, padding: '0.5rem', background: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Back</button>
                            <button type="submit" className="btn-primary" style={{flex: 2, padding: '0.5rem'}} disabled={isCheckingOut}>
                              {isCheckingOut ? 'Processing...' : (calculateFinalTotal() === 0 ? 'Place Order (Free) 🎉' : 'Proceed to Payment')}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className={styles.cartBody}>
                        {cart.map(item => {
                          const itemKey = item.cartItemId || item._id;
                          const isPhysical = Boolean(item.isPhysicalRequested || physicalSelections[itemKey] || physicalSelections[item._id]);
                          const unitPrice = item.price + (isPhysical ? ((item.physicalPrice || 0) + (item.shippingCost || 0)) : 0);

                          return (
                            <div key={itemKey} className={styles.cartItem}>
                              <div className={styles.cartItemInfo}>
                                <span className={styles.cartItemTitle}>{item.title}</span>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: isPhysical ? '#166534' : '#4F46E5',
                                  background: isPhysical ? '#DCFCE7' : '#EEF2FF',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  width: 'fit-content',
                                  marginTop: '0.2rem'
                                }}>
                                  {isPhysical ? '📦 Physical Copy (+Delivery)' : '📄 Digital E-Book (PDF)'}
                                </span>
                                <div className={styles.cartItemControls}>
                                  <button onClick={() => updateQuantity(itemKey, item.quantity - 1, isPhysical)} className={styles.qtyBtn}>-</button>
                                  <span className={styles.qtySpan}>{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(itemKey, item.quantity + 1, isPhysical)} 
                                    className={styles.qtyBtn}
                                    disabled={item.quantity >= item.stock}
                                    style={{ opacity: item.quantity >= item.stock ? 0.5 : 1, cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer' }}
                                  >+</button>
                                  <span className={styles.itemPrice}>x ₹{unitPrice}</span>
                                </div>
                              </div>
                              <button onClick={() => removeFromCart(itemKey)} className={styles.removeBtn}>&times;</button>
                            </div>
                          );
                        })}
                        <div className={styles.cartTotal}>
                          <span>Total:</span>
                          <span>₹{calculateFinalTotal()}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const token = localStorage.getItem('asg_token');
                            if (!token) {
                              alert("Please login to checkout.");
                              window.location.href = '/login';
                              return;
                            }
                            setShowCheckoutForm(true);
                          }} 
                          className="btn-primary" 
                          style={{width: '100%', marginTop: '1rem'}}
                        >
                          Checkout Now
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Account or Login Button */}
              {isLoggedIn ? (
                <div className={styles.profileMenuContainer}>
                  <Link href={isAdmin ? "/admin" : "/dashboard"} className={styles.avatarBtn} title={isAdmin ? "Admin Dashboard" : "My Dashboard"}>
                    <span className={styles.avatar}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '18px', height: '18px'}}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                  </Link>
                  {isAdmin ? (
                    <Link href="/admin" className={styles.navTextLink} style={{ color: '#0284c7', fontWeight: 'bold' }}>Admin Dashboard</Link>
                  ) : (
                    <Link href="/dashboard" className={styles.navTextLink}>Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
              ) : (
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Login</button>
                </Link>
              )}

          {/* Mobile Hamburger Toggle */}
          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <button 
            type="button"
            className={styles.mobileCartBtn}
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCartOpen(true);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Shopping Cart</span>
            </div>
            <span className={styles.mobileCartCount}>
              {mounted ? cartCount : 0} items
            </span>
          </button>

          <div className={styles.mobileLinks}>
            <Link href="/" className={pathname === '/' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/about" className={pathname === '/about' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            
            <div className={styles.mobileSectionHeader}>Guidance Programs</div>
            <Link href="/exam-guidance" className={pathname === '/exam-guidance' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>🎓 Exam Guidance</Link>
            <Link href="/career-guidance" className={pathname.startsWith('/career-guidance') ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>🧭 Career Guidance</Link>
            <Link href="/startup-guidance" className={pathname === '/startup-guidance' || pathname === '/startup-support' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>🚀 Start-up Guidance</Link>
            
            <div className={styles.mobileSectionHeader}>Explore More</div>
            <Link href="/ecommerce" className={pathname === '/ecommerce' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Store</Link>
            <Link href="/recommends" className={pathname === '/recommends' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
            <Link href="/webinars" className={pathname === '/webinars' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Workshops</Link>
            <Link href="/seminars" className={pathname === '/seminars' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Seminars</Link>
            <Link href="/gallery" className={pathname === '/gallery' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link>
            <Link href="/reviews" className={pathname === '/reviews' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Reviews</Link>
            <Link href="/contact" className={pathname === '/contact' ? styles.mobileActive : styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          </div>

          <div className={styles.mobileDrawerFooter}>
            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                <Link 
                  href={isAdmin ? "/admin" : "/dashboard"} 
                  className="btn-primary" 
                  style={{ textAlign: 'center', width: '100%', textDecoration: 'none' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                </Link>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} 
                  className={styles.logoutBtn}
                  style={{ width: '100%', padding: '0.65rem', display: 'block', textAlign: 'center' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="btn-primary" 
                style={{ textAlign: 'center', width: '100%', textDecoration: 'none', display: 'block' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
