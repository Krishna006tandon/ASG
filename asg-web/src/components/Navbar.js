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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: '', email: '', phone: '', address: ''
  });
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();
  // We use local state in Navbar to track physical requested toggles
  const [physicalSelections, setPhysicalSelections] = useState({});

  const updateCartItemPhysical = (id, checked) => {
    setPhysicalSelections(prev => ({ ...prev, [id]: checked }));
  };

  const calculateFinalTotal = () => {
    return cart.reduce((sum, item) => {
      let itemTotal = item.price * item.quantity;
      if (physicalSelections[item._id]) {
        itemTotal += ((item.physicalPrice || 0) + (item.shippingCost || 0)) * item.quantity;
      }
      return sum + itemTotal;
    }, 0);
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

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsCheckingOut(false);
        return;
      }

      const cartWithSelections = cart.map(item => ({
        ...item,
        isPhysicalRequested: physicalSelections[item._id] || false
      }));

      // Create Order on Backend
      const orderRes = await fetch('/api/razorpay/create-store-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart: cartWithSelections, customerDetails: checkoutDetails })
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
                customerDetails: orderData.customerDetails
              })
            });

            if (!verifyRes.ok) throw new Error("Verification failed");
            
            alert("Payment Successful! Your books are on the way.");
            clearCart();
            setIsCartOpen(false);
            window.location.href = '/dashboard';
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
        <Link href="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
          <img src="/images/image5.jpg" alt="Avinash Gore" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }} />
          <span style={{ fontSize: '1.6rem', fontWeight: '800' }}>Avinash Gore</span>
        </Link>
        <div className={styles.links}>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>Home</Link>
          <Link href="/about" className={pathname === '/about' ? styles.active : ''}>About</Link>
          <Link href="/ecommerce" className={pathname === '/ecommerce' ? styles.active : ''}>Store</Link>
          <Link href="/recommends" className={pathname === '/recommends' ? styles.active : ''}>Blog</Link>
          <Link href="/webinars" className={pathname === '/webinars' ? styles.active : ''}>Webinars</Link>
          <Link href="/seminars" className={pathname === '/seminars' ? styles.active : ''}>Seminars</Link>
          <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>Contact</Link>
        </div>
        
        <div className={styles.actions}>
          {isLoggedIn ? (
            <div className={styles.userActions}>
              <div className={styles.cartContainer}>
                <button 
                  className={styles.cartIcon} 
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', padding: 0}}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    style={{ width: '22px', height: '22px', color: '#374151' }}
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span className={styles.badge}>{cartCount}</span>
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
                            <h4 style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>Select Format</h4>
                            {cart.map(item => (
                              <div key={item._id} style={{marginBottom: '0.5rem', fontSize: '0.85rem'}}>
                                <div style={{fontWeight: '500'}}>{item.title}</div>
                                <label style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem'}}>
                                  <input 
                                    type="checkbox" 
                                    checked={physicalSelections[item._id] || false}
                                    onChange={(e) => updateCartItemPhysical(item._id, e.target.checked)}
                                  />
                                  <span>Add Physical Copy (+₹{(item.physicalPrice || 0) + (item.shippingCost || 0)})</span>
                                </label>
                              </div>
                            ))}
                          </div>

                          {cart.some(item => physicalSelections[item._id]) && (
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
                          
                          <div className={styles.cartTotal} style={{marginTop: '0.5rem', borderTop: '1px solid #E5E7EB', paddingTop: '0.5rem'}}>
                            <span>Final Total:</span>
                            <span>₹{calculateFinalTotal()}</span>
                          </div>
                          
                          <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                            <button type="button" onClick={() => setShowCheckoutForm(false)} className="btn-secondary" style={{flex: 1, padding: '0.5rem', background: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Back</button>
                            <button type="submit" className="btn-primary" style={{flex: 2, padding: '0.5rem'}} disabled={isCheckingOut}>
                              {isCheckingOut ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className={styles.cartBody}>
                        {cart.map(item => (
                          <div key={item._id} className={styles.cartItem}>
                            <div className={styles.cartItemInfo}>
                              <span className={styles.cartItemTitle}>{item.title}</span>
                              <div className={styles.cartItemControls}>
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className={styles.qtyBtn}>-</button>
                                <span className={styles.qtySpan}>{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)} 
                                  className={styles.qtyBtn}
                                  disabled={item.quantity >= item.stock}
                                  style={{ opacity: item.quantity >= item.stock ? 0.5 : 1, cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer' }}
                                >+</button>
                                <span className={styles.itemPrice}>x ₹{item.price}</span>
                              </div>
                            </div>
                            <button onClick={() => removeFromCart(item._id)} className={styles.removeBtn}>&times;</button>
                          </div>
                        ))}
                        <div className={styles.cartTotal}>
                          <span>Total:</span>
                          <span>₹{cartTotal}</span>
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
            </div>
          ) : (
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <div className={styles.cartContainer}>
                <button 
                  className={styles.cartIcon} 
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', padding: 0}}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    style={{ width: '22px', height: '22px', color: '#374151' }}
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span className={styles.badge}>{cartCount}</span>
                </button>
                {isCartOpen && (
                  <div className={styles.cartDropdown}>
                    <div className={styles.cartHeader}>
                      <h3>Your Cart</h3>
                      <button onClick={() => setIsCartOpen(false)} className={styles.closeBtn}>&times;</button>
                    </div>
                    {cart.length === 0 ? (
                      <p className={styles.emptyCart}>Your cart is empty.</p>
                    ) : (
                      <div className={styles.cartBody}>
                        {cart.map(item => (
                          <div key={item._id} className={styles.cartItem}>
                            <div className={styles.cartItemInfo}>
                              <span className={styles.cartItemTitle}>{item.title}</span>
                              <div className={styles.cartItemControls}>
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className={styles.qtyBtn}>-</button>
                                <span className={styles.qtySpan}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className={styles.qtyBtn}>+</button>
                                <span className={styles.itemPrice}>x ₹{item.price}</span>
                              </div>
                            </div>
                            <button onClick={() => removeFromCart(item._id)} className={styles.removeBtn}>&times;</button>
                          </div>
                        ))}
                        <div className={styles.cartTotal}>
                          <span>Total:</span>
                          <span>₹{cartTotal}</span>
                        </div>
                        <Link href="/login" className="btn-primary" style={{display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none'}}>
                          Login to Checkout
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link href="/login">
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Login</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
