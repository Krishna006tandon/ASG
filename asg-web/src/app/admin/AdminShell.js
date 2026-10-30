"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './adminLayout.module.css';

export default function AdminShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('asg_token');
    localStorage.removeItem('asg_role');
    window.location.href = '/login';
  };

  return (
    <div className={styles.adminWrapper}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            Avinash<span>Admin</span>
          </div>
          <button 
            className={styles.sidebarCloseBtn}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin">Dashboard Overview</Link>
          <Link href="/admin/orders">Order Management</Link>
          <Link href="/admin/ecommerce">E-Commerce Settings</Link>
          <Link href="/admin/career-guidance">Career Guidance</Link>
          <Link href="/admin/coupons">Coupons &amp; Discounts</Link>
          <Link href="/admin/webinars">Webinars</Link>
          <Link href="/admin/webinar-registrations">Webinar Attendees</Link>
          <Link href="/admin/seminars">Seminars</Link>
          <Link href="/admin/seminar-registrations">Seminar Attendees</Link>
          <Link href="/admin/past-workshops">Past Workshops &amp; Gallery</Link>
          <Link href="/admin/scanner">QR Check-In Scanner</Link>
          <Link href="/admin/appointments">Consulting Queue</Link>
          <Link href="/admin/content">Content & Blogs</Link>
          <Link href="/admin/reviews">Reviews & Feedback</Link>
          <Link href="/admin/college-reviews">College Reviews &amp; QR</Link>
        </nav>

        <div className={styles.bottomNav}>
          <Link href="/" className={styles.backLink}>&larr; Back to Public Site</Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className={styles.menuToggleBtn}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle admin sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className={styles.search}>
              <input type="text" placeholder="Search orders, clients, or content..." />
            </div>
          </div>

          <div className={styles.profile}>
            <span>Admin User</span>
            <div className={styles.avatar}>A</div>
          </div>
        </header>

        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
