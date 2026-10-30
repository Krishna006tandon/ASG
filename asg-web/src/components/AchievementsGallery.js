'use client';
import React from 'react';
import styles from './AchievementsGallery.module.css';

export default function AchievementsGallery() {
  return (
    <section className={styles.gallerySection}>
      <div className={styles.galleryHeader}>
        <h2 className={styles.galleryTitle}>Awards & Recognition</h2>
        <div className={styles.galleryDivider}></div>
        <p className={styles.gallerySubtitle}>
          A snapshot of professional milestones, leadership, and industry excellence.
        </p>
      </div>

      <div className={styles.cardsGrid}>
        
        {/* Card 1: Jubail Award Close up */}
        <div className={`glass-card ${styles.awardCard}`}>
          <div className={styles.imageContainer}>
            <img 
              src="/images/image3.jpg" 
              alt="Avinash Gore receiving award at Jubail Energy Management Conference" 
              className={styles.awardImage}
            />
          </div>
          <div className={styles.cardBody}>
            <h3>Jubail Energy Management Conference</h3>
            <p>Honored with a prestigious award at the Jubail 2nd Energy Management Conference in 2019.</p>
          </div>
        </div>

        {/* Card 2: Jubail Wide Shot */}
        <div className={`glass-card ${styles.awardCard}`}>
          <div className={styles.imageContainer}>
            <img 
              src="/images/image 2.jpg" 
              alt="Avinash Gore delivering keynote address on sustainability at Jubail Energy Summit" 
              className={styles.awardImageContain}
            />
          </div>
          <div className={styles.cardBody}>
            <h3>Excellence in Energy</h3>
            <p>Recognized on stage by industry leaders for driving sustainability and operational efficiency.</p>
          </div>
        </div>

        {/* Card 3: Sadara Recognition */}
        <div className={`glass-card ${styles.awardCard}`}>
          <div className={styles.imageContainer} style={{ backgroundColor: '#f0f0f0' }}>
            <img 
              src="/images/image4.png" 
              alt="Sadara Chemical Company recognition award for Avinash Gore" 
              className={styles.awardImageContain}
            />
          </div>
          <div className={styles.cardBody}>
            <h3>Recognition at Sadara</h3>
            <p>Acknowledged for dedicated service, leadership, and driving process safety in Sadara Chemical Company (JV of Saudi Aramco & Dow Chemical).</p>
          </div>
        </div>

      </div>

      {/* Feature section for HAZOP */}
      <div className={`glass-card ${styles.hazopCard}`}>
        <div className={styles.hazopImageWrapper}>
          <img 
            src="/images/image1.png" 
            alt="Avinash Gore conducting HAZOP safety leadership and P&ID review workshop" 
            className={styles.hazopImage}
          />
        </div>
        <div className={styles.hazopContent}>
          <span className={styles.badge}>Knowledge Sharing</span>
          <h3 className={styles.hazopTitle}>HAZOP Methodologies & Safety Leadership</h3>
          <p className={styles.hazopText}>
            Leading comprehensive Hazard and Operability (HAZOP) study sessions. Demonstrating a strong commitment to process safety management by training teams on critical safety documents, P&IDs, and risk assessment procedures.
          </p>
        </div>
      </div>
    </section>
  );
}
