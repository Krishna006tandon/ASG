import styles from './about.module.css';
import Link from 'next/link';

export const metadata = {
  title: "About Avinash Gore | 25+ Years Global Engineering, Author & Mentor",
  description:
    "Learn about Avinash Gore: B.Tech Chemical Engineer from L.I.T., Dual MBA, Certified Functional Safety Engineer (TÜV SÜD), Managing Director at Perpetual Solutions, and author of 'Come on... You can do it!'.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Avinash Gore | Professional Profile & Biography",
    description:
      "Global engineering leadership, transformational youth mentorship, and author of 'Come on... You can do it!'. Discover Avinash Gore's journey and achievements.",
    url: "/about",
    images: [{ url: "/images/image5.jpg", width: 800, height: 800, alt: "Avinash Gore" }],
  },
};

export default function About() {
  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Professional Profile</h1>
        <p>A journey through education, experience, and milestones.</p>
      </header>

      <section className={styles.timeline}>
        {/* Academic Milestones */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', width: '100%' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '0.5rem', fontWeight: '900' }}>Academic Excellence</h2>
          <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', margin: '0 auto', borderRadius: '2px' }}></div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #10B981' }}>
            <h3>Dual MBA: Entrepreneurship & Environmental Management</h3>
            <p className={styles.date}>June 2018</p>
            <p>A unique dual-specialization focusing on sustainable business practices and innovative venture creation.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
            <h3>MBA in Entrepreneurship</h3>
            <p className={styles.date}>December 2015</p>
            <p><strong style={{color: 'var(--primary-dark)'}}>National Institute of Business Management (NIBM)</strong><br/>Graduated with First-Class Honors, demonstrating a strong foundation in business strategy and leadership.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #EC4899' }}>
            <h3>B.Tech in Chemical Engineering</h3>
            <p className={styles.date}>June 2001</p>
            <p><strong style={{color: '#BE185D'}}>Laxminarayan Institute of Technology (L.I.T.)</strong><br/>Graduated with Distinction, building a robust technical foundation that fueled a 25+ year global engineering career.</p>
          </div>
        </div>

        {/* Professional Milestones */}
        <div style={{ textAlign: 'center', margin: '4rem 0 3rem', width: '100%' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '0.5rem', fontWeight: '900' }}>Professional Journey</h2>
          <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', margin: '0 auto', borderRadius: '2px' }}></div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #0EA5E9' }}>
            <h3>Managing Director – Perpetual Solutions</h3>
            <p className={styles.date}>Sept&apos;21 – Till Date</p>
            <p><strong style={{ color: '#0284C7' }}>Perpetual Solutions</strong> &bull; Nagpur, Maharashtra, India<br/>Currently working as Managing Director, driving business expansion and team development. Providing premier consulting in process safety, energy efficiency, and operational excellence for leading industrial organizations.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #2563EB' }}>
            <h3>Project Engineer / Technology Specialist</h3>
            <p className={styles.date}>Sept&apos;13 – Sept&apos;21</p>
            <p><strong style={{ color: '#1D4ED8' }}>Sadara Chemical Company (Dow Chemicals &amp; Saudi Aramco JV)</strong> &bull; Jubail, Saudi Arabia<br/>Specialized in Environmental Operations across the Utility &amp; Multi Feed Cracker Unit. Led environmental technology, process safety management, and operational excellence in one of the world&apos;s largest integrated chemical complexes.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #F59E0B' }}>
            <h3>Manager – Process / Operations</h3>
            <p className={styles.date}>Feb&apos;07 – Sept&apos;13</p>
            <p><strong style={{ color: '#D97706' }}>Reliance Industries Limited (Formerly IPCL)</strong> &bull; Dahej, Gujarat<br/>Managed operations and process engineering across EDC, VCM, and Incinerator plants. Spearheaded operational efficiency, plant turnaround activities, and stringent process safety protocols.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #10B981' }}>
            <h3>Sr. Engineer (Fine Chemical-I)</h3>
            <p className={styles.date}>Dec&apos;04 – Feb&apos;07</p>
            <p><strong style={{ color: '#059669' }}>Jubilant Life Science (VAM Organics Limited)</strong> &bull; Gajraula, U.P.<br/>Supervised chemical processing and production operations within the Fine Chemical-I division, ensuring optimum process control, high-yield output, and safety adherence.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #EC4899' }}>
            <h3>Engineer (Production - PS)</h3>
            <p className={styles.date}>Aug&apos;01 – Dec&apos;04</p>
            <p><strong style={{ color: '#BE185D' }}>Supreme Petrochem Ltd.</strong> &bull; Raigad, Maharashtra<br/>Handled polystyrene production operations, process monitoring, and quality control, initiating a 25+ year global engineering career immediately following graduation with distinction from L.I.T.</p>
          </div>
        </div>

        {/* Certifications Milestones */}
        <div style={{ textAlign: 'center', margin: '4rem 0 3rem', width: '100%' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '0.5rem', fontWeight: '900' }}>Certifications & Training</h2>
          <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', margin: '0 auto', borderRadius: '2px' }}></div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card" style={{ borderTop: '4px solid #F59E0B' }}>
            <h3>Key Industry Certifications</h3>
            <ul style={{ color: '#4B5563', lineHeight: '1.8', marginTop: '1rem', paddingLeft: '1.2rem', fontSize: '1rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>CFSE-Certified Functional Safety Engineer</strong> (TÜV SÜD) - Distinction</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Certified on HAZOP</strong> (Pragna Consultants)</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Dow/Dupont Certified PSM / LOPA Professional</strong></li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Certified Lean Practitioner</strong> (LEORON Institute, Dubai)</li>
              <li><strong>BEE Certified Energy Auditor</strong></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
