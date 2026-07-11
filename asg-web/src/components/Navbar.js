import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Avinash<span>.</span>
        </Link>
        <div className={styles.links}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/recommends">Recommends</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className={styles.actions}>
          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Client Login</button>
        </div>
      </div>
    </nav>
  );
}
