import styles from './financial.module.css';
import Link from 'next/link';

export const metadata = {
  title: "Financial Literacy Portal | Budgeting, Mutual Funds & Investing",
  description:
    "Master essential personal finance skills: budgeting techniques, emergency fund planning, insurance principles, mutual funds, and stock market fundamentals.",
  alternates: {
    canonical: "/financial-literacy",
  },
  openGraph: {
    title: "Financial Literacy Portal | Avinash Gore",
    description:
      "Actionable financial education tailored for students, beginners, and young professionals.",
    url: "/financial-literacy",
  },
};

export default function FinancialLiteracy() {
  const categories = [
    { title: "Budgeting Processes", count: "12 Articles" },
    { title: "Saving Models", count: "8 Articles" },
    { title: "Insurance Awareness", count: "5 Articles" },
    { title: "Mutual Funds", count: "14 Articles" },
    { title: "Stock Market Basics", count: "21 Articles" },
  ];

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', borderRadius: '50px', background: 'rgba(236,72,153,0.12)', color: '#BE185D', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem', border: '1px solid rgba(236,72,153,0.25)' }}>
          🚀 Coming Soon
        </div>
        <h1>Financial Literacy Portal</h1>
        <p>High-value insights and learning modules to take control of your financial future — Coming Soon!</p>
      </header>

      <div className={styles.container}>
        <section className={styles.categories}>
          {categories.map((cat, idx) => (
            <div key={idx} className={`glass-card ${styles.catCard}`}>
              <h3>{cat.title}</h3>
              <p>{cat.count}</p>
              <Link href="#" className={styles.exploreLink}>Explore &rarr;</Link>
            </div>
          ))}
        </section>
        
        <aside className={styles.widgets}>
          <div className={`glass-card ${styles.widget}`}>
            <h4>Related Books</h4>
            <div className={styles.bookItem}>
              <div className={styles.bookCover}></div>
              <div>
                <h5>The Intelligent Investor</h5>
                <p>Benjamin Graham</p>
              </div>
            </div>
            <Link href="/ecommerce" className={styles.widgetLink}>Visit Bookstore</Link>
          </div>
          
          <div className={`glass-card ${styles.widget}`}>
            <h4>Upcoming Financial Webinar</h4>
            <p className={styles.webinarDate}>November 12, 2026</p>
            <p>Mastering SIPs and Mutual Funds</p>
            <Link href="/webinars" className={styles.widgetLink}>Register Now</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
