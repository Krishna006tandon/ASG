import React from 'react';
import { CAREER_CATEGORIES, getScoreInterpretation } from '@/lib/careerData';

export default function CareerReportPDF({ assessment, results, reportRef }) {
  if (!assessment || !results) return null;

  const candidate = assessment.candidate || assessment.candidateDetails || {};
  const rawTop3 = (results.top3 && results.top3.length > 0) ? results.top3 : (assessment.topCategories || []);
  const rawRanked = (results.rankedCategories && results.rankedCategories.length > 0) ? results.rankedCategories : rawTop3;

  const top3 = rawTop3.map((cat, idx) => {
    const baseCat = CAREER_CATEGORIES.find(c => c.code === cat.code) || {};
    const score = typeof cat.score === 'number' ? cat.score : 0;
    return {
      ...baseCat,
      ...cat,
      score,
      name: cat.name || baseCat.name || `Domain ${idx + 1}`,
      tagline: cat.tagline || baseCat.tagline || 'Specialized Work Style',
      roles: cat.roles || baseCat.roles || 'Industry Specializations'
    };
  });

  const ranked = rawRanked.map((c, i) => {
    const baseCat = CAREER_CATEGORIES.find(cat => cat.code === c.code) || {};
    const score = typeof c.score === 'number' ? c.score : 0;
    const interp = c.interpretation || getScoreInterpretation(score);
    return {
      ...baseCat,
      ...c,
      score,
      name: c.name || baseCat.name || `Category ${c.code || i + 1}`,
      roles: c.roles || baseCat.roles || 'Specialized Industry Roles',
      interpretation: interp
    };
  });

  const dateFormatted = assessment.completedAt 
    ? new Date(assessment.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      ref={reportRef}
      style={{
        position: 'absolute',
        top: '-15000px',
        left: '-15000px',
        width: '850px',
        background: '#ffffff',
        color: '#111827',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '40px 45px',
        boxSizing: 'border-box',
        borderRadius: '8px'
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #7942b5', paddingBottom: '20px', marginBottom: '25px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#7942b5', letterSpacing: '-0.5px' }}>
              Avinash Gore
            </span>
            <span style={{ background: '#F1EAFF', color: '#7942b5', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', textTransform: 'lowercase' }}>
              avinashsgore.com
            </span>
          </div>
          <h1 style={{ margin: '0', fontSize: '22px', fontWeight: '800', color: '#1F2937' }}>
            Official Career Nature &amp; Swadharma Report
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
            Based on the 30-Dimension Work Preference Matrix &middot; Author of <em>Come On... You Can Do It!</em>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Report ID</div>
          <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: '#1F2937' }}>
            {String(assessment.assessmentId || assessment._id || 'ASG-CAREER').slice(-10).toUpperCase()}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Date: {dateFormatted}</div>
        </div>
      </div>

      {/* Candidate Details Strip */}
      <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Candidate Name</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{candidate.name || 'Candidate'}</span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Email</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{candidate.email || 'N/A'}</span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Phone / WhatsApp</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{candidate.phone || 'N/A'}</span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Status</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>Verified Paid &amp; Completed</span>
        </div>
      </div>

      {/* Swadharma Philosophical Anchor */}
      <div style={{ background: '#FEF3C7', borderLeft: '4px solid #F59E0B', borderRadius: '6px', padding: '10px 14px', marginBottom: '22px' }}>
        <p style={{ margin: '0', fontSize: '12px', color: '#92400E', lineHeight: '1.45' }}>
          <strong>श्रीमद्भगवद्गीता 3.35:</strong> <em>श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।</em> &mdash; Performing work suited to one&apos;s own natural temperament (Swadharma), even if imperfectly, brings lasting fulfillment over blindly following another person&apos;s path.
        </p>
      </div>

      {/* Top 3 Primary Career Domains */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Your Top 3 Natural Career Domains
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {top3.map((cat, idx) => (
            <div
              key={cat.code || idx}
              style={{
                border: idx === 0 ? '2px solid #7942b5' : '1px solid #E5E7EB',
                background: idx === 0 ? '#FAF5FF' : '#FFFFFF',
                borderRadius: '10px',
                padding: '14px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: idx === 0 ? '#7942b5' : '#E5E7EB', color: idx === 0 ? '#FFFFFF' : '#374151', textTransform: 'uppercase' }}>
                  {idx === 0 ? 'Primary #1' : idx === 1 ? 'Secondary #2' : 'Tertiary #3'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#7942b5' }}>
                  {cat.score} / 15
                </span>
              </div>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                {cat.name}
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '10.5px', color: '#6B7280', lineHeight: '1.3' }}>
                {cat.tagline}
              </p>
              <div style={{ fontSize: '10.5px', color: '#374151', background: '#FFFFFF', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                <strong>Key Roles:</strong> {cat.roles}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synergy Insight Box */}
      {results.synergyInsight && (
        <div style={{ background: '#F1EAFF', border: '1px solid #DCBFFF', borderRadius: '8px', padding: '12px 16px', marginBottom: '22px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7942b5', fontWeight: '800', textTransform: 'uppercase' }}>
            Hybrid Career Synergy Insight
          </h4>
          <p style={{ margin: '0', fontSize: '12px', color: '#4B5563', lineHeight: '1.4' }}>
            {results.synergyInsight}
          </p>
        </div>
      )}

      {/* Complete 10 Category Breakdown Table */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1F2937', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Complete 10-Dimension Work Preference Matrix
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ padding: '8px 10px', color: '#4B5563', fontWeight: '700' }}>Rank</th>
              <th style={{ padding: '8px 10px', color: '#4B5563', fontWeight: '700' }}>Work Area</th>
              <th style={{ padding: '8px 10px', color: '#4B5563', fontWeight: '700' }}>Score (Max 15)</th>
              <th style={{ padding: '8px 10px', color: '#4B5563', fontWeight: '700' }}>Level</th>
              <th style={{ padding: '8px 10px', color: '#4B5563', fontWeight: '700' }}>Target Job Specializations</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((c, i) => (
              <tr key={c.code || i} style={{ borderBottom: '1px solid #F3F4F6', background: i < 3 ? '#FCF9FF' : 'transparent' }}>
                <td style={{ padding: '6px 10px', fontWeight: '700', color: i < 3 ? '#7942b5' : '#6B7280' }}>#{i + 1}</td>
                <td style={{ padding: '6px 10px', fontWeight: '600', color: '#1F2937' }}>{c.name}</td>
                <td style={{ padding: '6px 10px', fontWeight: '700', color: '#111827' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{c.score}/15</span>
                    <div style={{ width: '60px', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(c.score / 15) * 100}%`, height: '100%', background: c.score >= 13 ? '#10B981' : c.score >= 10 ? '#3B82F6' : '#9CA3AF' }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '6px 10px', color: c.interpretation?.color || '#10B981', fontWeight: '700' }}>
                  {c.interpretation?.level || 'Evaluated'}
                </td>
                <td style={{ padding: '6px 10px', color: '#4B5563', maxWidth: '260px' }}>
                  {c.roles}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suggested Next Steps from Avinash Gore */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#0F172A', fontWeight: '800' }}>
          Personal Message &amp; Next Steps &mdash; Avinash Gore
        </h4>
        <p style={{ margin: '0 0 8px 0', fontSize: '11.5px', color: '#475569', lineHeight: '1.45' }}>
          &ldquo;These results are not a lifelong verdict; they are a flashlight showing where your current natural energy and cognitive strengths lie. Combine these insights with your educational qualifications, develop high-leverage skills in your top areas, and build real-world projects. <strong>Come On... You Can Do It!</strong>&rdquo;
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
          <span>To book 1-on-1 strategic career mentorship: <strong>avinashsgore.com/consulting</strong></span>
          <span style={{ fontWeight: '700', color: '#7942b5' }}>avinashsgore.com &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
