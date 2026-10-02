import styles from './startup.module.css';
import Link from 'next/link';

export const metadata = {
  title: "Startup Support Repository | MVP Frameworks & Business Strategy",
  description:
    "Expert frameworks for aspiring founders: 90-day MVP execution blueprint, business registration processes, pitching, and government startup initiatives.",
  alternates: {
    canonical: "/startup-support",
  },
  openGraph: {
    title: "Startup Support Repository | Avinash Gore",
    description:
      "A centralized resource node providing strategic guidance and execution blueprints for early-stage entrepreneurs.",
    url: "/startup-support",
  },
};

export default function StartupSupport() {
  const topics = [
    { title: "Business Registration Guidance", icon: "🏛️" },
    { title: "Fundamental Marketing Rules", icon: "📈" },
    { title: "Strategy Frameworks", icon: "🧠" },
    { title: "Government Startup Schemes", icon: "🇮🇳" },
    { title: "Pitch Deck Construction", icon: "📊" },
  ];

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', borderRadius: '50px', background: 'rgba(236,72,153,0.12)', color: '#BE185D', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem', border: '1px solid rgba(236,72,153,0.25)' }}>
          🚀 Coming Soon
        </div>
        <h1>Startup Support Repository</h1>
        <p>A centralized expert guide node providing targeted resources for your next venture — In Active Development!</p>
      </header>

      <section className={styles.hub}>
        <div className={styles.sidebar}>
          <h3>Core Topics</h3>
          <ul className={styles.topicList}>
            {topics.map((t, i) => (
              <li key={i}>
                <span className={styles.icon}>{t.icon}</span>
                {t.title}
              </li>
            ))}
          </ul>
          <button className="btn-accent" style={{ marginTop: '2rem', width: '100%' }}>Book Consultation</button>
        </div>
        
        <div className={styles.content}>
          <div className="glass-card">
            <h2>Welcome to the Startup Hub</h2>
            <p style={{ marginBottom: '1.5rem' }}>Select a topic from the left to dive into expert articles and planning matrices.</p>
            <div className={styles.featuredGuide}>
              <span className={styles.badge}>Featured Guide</span>
              <h3>The 90-Day MVP Blueprint</h3>
              <p>Learn how to ideate, validate, and build a Minimum Viable Product in under 90 days with zero engineering background.</p>
              <Link href="#" className={styles.readMore}>Start Reading &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
