import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h2>Avinash<span>.</span></h2>
          <p>Expert Guidance in Startups, E-Commerce, and Financial Literacy.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.column}>
            <h4>Platform</h4>
            <Link href="/about">About</Link>
            <Link href="/recommends">Recommendations</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className={styles.column}>
            <h4>Resources</h4>
            <Link href="/blog">Blog</Link>
            <Link href="/startup-support">Startup Support</Link>
            <Link href="/financial-literacy">Financial Literacy</Link>
          </div>
          <div className={styles.column}>
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Avinash Professional Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
