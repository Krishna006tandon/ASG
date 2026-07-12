"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { cart } = useCart();

  useEffect(() => {
    // Check if token exists in local storage
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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
              <Link href="/ecommerce" className={styles.cartIcon}>
                🛒 <span className={styles.badge}>{cartCount}</span>
              </Link>
              <div className={styles.profileMenu}>
                <span className={styles.avatar}>👤</span>
                <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Client Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
