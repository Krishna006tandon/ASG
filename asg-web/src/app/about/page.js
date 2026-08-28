import styles from './about.module.css';
import Link from 'next/link';

export const metadata = {
  title: "About Avinash | Professional Profile",
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
          <div className="glass-card">
            <h3>Professional Experience - Perpetual Solutions</h3>
            <p className={styles.date}>2015 - 2019</p>
            <p>Led growth initiatives and managed cross-functional teams to deliver enterprise e-commerce solutions.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card">
            <h3>Career Milestones - The Skill Center</h3>
            <p className={styles.date}>2020 - Present</p>
            <p>Founded educational hubs to empower young professionals with financial literacy and startup planning methodologies.</p>
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
