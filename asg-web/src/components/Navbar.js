"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('asg_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('asg_token');
    setIsLoggedIn(false);
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

      // Create Order on Backend
      const orderRes = await fetch('/api/razorpay/create-store-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

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
                cart: cart,
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
        <Link href="/" className={styles.logo}>
          Avinash<span>.</span>
        </Link>
        <div className={styles.links}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/ecommerce">Store</Link>
          <Link href="/recommends">Recommends</Link>
          <Link href="/contact">Contact</Link>
        </div>
        
        <div className={styles.actions}>
          {isLoggedIn ? (
            <div className={styles.userActions}>
              <div className={styles.cartContainer}>
                <button 
                  className={styles.cartIcon} 
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative'}}
                >
                  🛒 <span className={styles.badge}>{cartCount}</span>
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
                          onClick={handleStoreCheckout} 
                          className="btn-primary" 
                          style={{width: '100%', marginTop: '1rem'}}
                          disabled={isCheckingOut}
                        >
                          {isCheckingOut ? 'Processing...' : 'Checkout Now'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.profileMenuContainer}>
                <Link href="/dashboard" className={styles.avatarBtn} title="My Dashboard">
                  <span className={styles.avatar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '18px', height: '18px'}}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                </Link>
                <Link href="/dashboard" className={styles.navTextLink}>Dashboard</Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
              </div>
            </div>
          ) : (
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <div className={styles.cartContainer}>
                <button 
                  className={styles.cartIcon} 
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative'}}
                >
                  🛒 <span className={styles.badge}>{cartCount}</span>
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
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Client Login</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
