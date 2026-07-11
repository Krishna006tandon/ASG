import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <header className={`${styles.hero} animate-fade-in`}>
        <div className={styles.heroBadge}>Avinash Professional</div>
        <h1>Elevate Your <span>Business & Finances</span></h1>
        <p>Expert Guidance in Startups, E-Commerce, and Financial Literacy tailored for the modern professional.</p>
        
        <div className={styles.ctaGroup}>
          <button className="btn-accent">Explore Consulting</button>
          <button className="btn-primary">View Masterclasses</button>
        </div>
      </header>

      {/* Featured Modules Grid */}
      <section className={styles.grid}>
        <div className="glass-card">
          <h3>E-Commerce Book Store</h3>
          <p>Discover carefully curated literature on business scaling, financial intelligence, and productivity frameworks.</p>
        </div>
        <div className="glass-card">
          <h3>Startup Support</h3>
          <p>Targeted articles, business registration guidance, and fundamental marketing rules for your next venture.</p>
        </div>
        <div className="glass-card">
          <h3>Webinars & Masterclasses</h3>
          <p>Join live sessions focused on advanced strategy, financial models, and operational growth.</p>
        </div>
        <div className="glass-card">
          <h3>Financial Literacy</h3>
          <p>High-value insights into budgeting, long-term saving, insurance awareness, and stock market basics.</p>
        </div>
      </section>
    </main>
  );
}
