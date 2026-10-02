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
            <Link href="/gallery">Workshops Gallery</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/recommends">Curated Reads</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className={styles.column}>
            <h4>Resources</h4>
            <Link href="/blog">Blog</Link>
            <Link href="/startup-support" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              Startup Support
              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(236,72,153,0.18)', color: '#F472B6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Coming Soon
              </span>
            </Link>
            <Link href="/financial-literacy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              Financial Literacy
              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(236,72,153,0.18)', color: '#F472B6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Coming Soon
              </span>
            </Link>
          </div>
          <div className={styles.column}>
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Avinash Professional Platform. All rights reserved. | Developed by Nexbyte_Core and Krishna Tandon</p>
      </div>
    </footer>
  );
}
