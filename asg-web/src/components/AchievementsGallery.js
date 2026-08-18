'use client';
import React from 'react';

export default function AchievementsGallery() {
  return (
    <section style={{ position: 'relative', padding: '6rem 2rem', margin: '4rem 0', borderRadius: '30px', background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '3rem', color: '#111827', marginBottom: '1rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Awards & Recognition</h2>
        <div style={{ width: '80px', height: '6px', background: 'linear-gradient(90deg, var(--primary-color), var(--primary-dark))', margin: '0 auto', borderRadius: '3px' }}></div>
        <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', color: '#6B7280', maxWidth: '600px', margin: '1.5rem auto 0' }}>A snapshot of professional milestones, leadership, and industry excellence.</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Card 1: Jubail Award Close up */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'rgba(255,255,255,0.8)' }}>
          <div style={{ height: '280px', width: '100%', overflow: 'hidden' }}>
            <img src="/images/image3.jpg" alt="Jubail Award" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
          </div>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111827', fontWeight: '800' }}>Jubail Energy Management Conference</h3>
            <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>Honored with a prestigious award at the Jubail 2nd Energy Management Conference in 2019.</p>
          </div>
        </div>

        {/* Card 2: Jubail Wide Shot */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'rgba(255,255,255,0.8)' }}>
          <div style={{ height: '280px', width: '100%', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/images/image 2.jpg" alt="Jubail Stage" style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
          </div>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111827', fontWeight: '800' }}>Excellence in Energy</h3>
            <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>Recognized on stage by industry leaders for driving sustainability and operational efficiency.</p>
          </div>
        </div>

        {/* Card 3: Sadara Recognition */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'rgba(255,255,255,0.8)' }}>
          <div style={{ height: '280px', width: '100%', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
            <img src="/images/image4.png" alt="Sadara Recognition" style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
          </div>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111827', fontWeight: '800' }}>Sadara Recognition</h3>
            <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>Acknowledged for dedicated service, leadership, and driving process safety in partnership with Sadara.</p>
          </div>
        </div>

      </div>

      {/* Feature section for HAZOP */}
      <div className="glass-card" style={{ maxWidth: '1000px', margin: '4rem auto 0', display: 'flex', gap: '3rem', alignItems: 'center', padding: '2rem', flexWrap: 'wrap', border: 'none', background: 'rgba(255,255,255,0.8)' }}>
        <div style={{ flex: '1 1 400px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <img src="/images/image1.jpg" alt="HAZOP Training" style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}/>
        </div>
        <div style={{ flex: '1 1 300px' }}>
          <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(121, 66, 181, 0.1)', color: 'var(--primary-color)', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>Knowledge Sharing</span>
          <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111827', fontWeight: '800' }}>HAZOP Methodologies & Safety Leadership</h3>
          <p style={{ color: '#4B5563', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1.1rem' }}>Leading comprehensive Hazard and Operability (HAZOP) study sessions. Demonstrating a strong commitment to process safety management by training teams on critical safety documents, P&IDs, and risk assessment procedures.</p>
        </div>
      </div>
    </section>
  );
}
