import styles from './adminLayout.module.css';
import Link from 'next/link';

export const metadata = {
  title: "Admin Dashboard | Avinash Platform",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          Avinash<span>Admin</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin">Dashboard Overview</Link>
          <Link href="/admin/orders">Order Management</Link>
          <Link href="/admin/ecommerce">E-Commerce Settings</Link>
          <Link href="/admin/webinars">Webinars</Link>
          <Link href="/admin/webinar-registrations">Webinar Attendees</Link>
          <Link href="/admin/appointments">Consulting Queue</Link>
          <Link href="/admin/content">Content & Blogs</Link>
        </nav>
        <div className={styles.bottomNav}>
          <Link href="/" className={styles.backLink}>&larr; Back to Public Site</Link>
          <button className={styles.logoutBtn}>Logout</button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.search}>
            <input type="text" placeholder="Search orders, clients, or content..." />
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
