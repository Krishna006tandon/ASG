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
        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card">
            <h3>Educational Background</h3>
            <p className={styles.date}>2010 - 2014</p>
            <p>Graduated with top honors in Business Administration, laying the foundation for a career in scaling startups and optimizing financial structures.</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card">
            <h3>Professional Experience - Perpetual Solutions</h3>
            <p className={styles.date}>2015 - 2019</p>
            <p>Led growth initiatives and managed cross-functional teams to deliver enterprise e-commerce solutions.</p>
            <a href="https://perpetualsolutions.example.com" target="_blank" rel="noopener noreferrer" className={styles.outboundLink}>Visit Perpetual Solutions &rarr;</a>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.dot}></div>
          <div className="glass-card">
            <h3>Career Milestones - The Skill Center</h3>
            <p className={styles.date}>2020 - Present</p>
            <p>Founded educational hubs to empower young professionals with financial literacy and startup planning methodologies.</p>
            <a href="https://skillcenter.example.com" target="_blank" rel="noopener noreferrer" className={styles.outboundLink}>Visit Skill Center &rarr;</a>
          </div>
        </div>
      </section>
    </main>
  );
}
