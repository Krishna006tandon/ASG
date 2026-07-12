import styles from './financial.module.css';
import Link from 'next/link';

export const metadata = {
  title: "Financial Literacy | Avinash Professional",
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
        <h1>Financial Literacy Portal</h1>
        <p>High-value insights to take control of your financial future.</p>
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
