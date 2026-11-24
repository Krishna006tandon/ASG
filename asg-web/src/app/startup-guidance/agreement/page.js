"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './agreement.module.css';

function AgreementContent() {
  const searchParams = useSearchParams();

  const [menteeName, setMenteeName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');

  useEffect(() => {
    const qName = searchParams.get('name') || '';
    const qVenture = searchParams.get('venture') || '';
    const qDate = searchParams.get('date') || '';

    if (qName) setMenteeName(qName);
    if (qVenture) setBusinessName(qVenture);
    if (qDate) {
      setRegistrationDate(qDate);
    } else {
      const today = new Date();
      const formatted = today.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setRegistrationDate(formatted);
    }
  }, [searchParams]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Top Action Bar - Hidden in Print */}
      <aside className={styles.actionBar} aria-label="Agreement Actions">
        <div className={styles.actionBarContainer}>
          <Link href="/startup-guidance" className={styles.backLink}>
            &larr; Back to Start-up Guidance
          </Link>
          <div className={styles.actionButtons}>
            <button onClick={handlePrint} className={styles.printBtn}>
              <span className={styles.printIcon}>🖨️</span> Print Agreement / Save PDF
            </button>
          </div>
        </div>
      </aside>

      {/* Main Printable Agreement Document */}
      <main className={styles.documentContainer}>
        <article className={styles.agreementSheet}>
          {/* Header */}
          <header className={styles.sheetHeader}>
            <div className={styles.headerBadge}>OFFICIAL FRAMEWORK &amp; CODE OF PRACTICE</div>
            <h1 className={styles.docTitle}>ENTREPRENEURSHIP MENTORSHIP AGREEMENT</h1>
            <div className={styles.mentorInfo}>
              <div className={styles.mentorName}>Mentor: Mr. Avinash S. Gore</div>
              <div className={styles.mentorSite}>
                Website: <a href="https://avinashsgore.com" target="_blank" rel="noopener noreferrer">https://avinashsgore.com</a>
              </div>
            </div>
            <div className={styles.headerDivider}></div>
          </header>

          {/* Preamble / Parties */}
          <section className={styles.partiesBlock}>
            <p className={styles.introPara}>This agreement is entered into between:</p>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Mentor:</span>
              <span className={styles.fieldValueStatic}>Mr. Avinash S. Gore</span>
            </div>

            <div className={styles.fieldRow}>
              <label htmlFor="mentee-input" className={styles.fieldLabel}>Mentee / Participant:</label>
              <input
                id="mentee-input"
                type="text"
                value={menteeName}
                onChange={(e) => setMenteeName(e.target.value)}
                placeholder="Enter full name of mentee"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.fieldRow}>
              <label htmlFor="venture-input" className={styles.fieldLabel}>Business / Proposed Venture:</label>
              <input
                id="venture-input"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business or proposed venture name"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.fieldRow}>
              <label htmlFor="date-input" className={styles.fieldLabel}>Date of Registration:</label>
              <input
                id="date-input"
                type="text"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                placeholder="DD Month YYYY"
                className={styles.fieldInput}
              />
            </div>
          </section>

          {/* Clauses */}
          <div className={styles.clausesList}>
            {/* Clause 1 */}
            <section className={styles.clauseItem}>
              <h2 className={styles.clauseTitle}>1. Purpose of Mentorship</h2>
              <p className={styles.clauseText}>
                The purpose of this mentorship is to guide the Mentee in developing an entrepreneurial mindset, evaluating business opportunities, establishing a new business and progressing towards sustainable growth.
              </p>
              <p className={styles.clauseText} style={{ marginTop: '0.6rem' }}>
                The mentorship will follow the following ten stages of entrepreneurship:
              </p>
              
              <ol className={styles.stagesOrderedList}>
                <li><strong>Self-Discovery &amp; Entrepreneurial Mindset</strong></li>
                <li><strong>Idea Generation &amp; Opportunity Identification</strong></li>
                <li><strong>Market Research &amp; Idea Validation</strong></li>
                <li><strong>Business Model Development</strong></li>
                <li><strong>Business Planning &amp; Financial Preparation</strong></li>
                <li><strong>Business Setup &amp; Legal Formalities</strong></li>
                <li><strong>Product Development &amp; Launch</strong></li>
                <li><strong>Customer Acquisition &amp; Survival</strong></li>
                <li><strong>Growth, Team Building &amp; Systemisation</strong></li>
                <li><strong>Scaling, Sustainability &amp; Legacy</strong></li>
              </ol>

              <p className={styles.clauseNote}>
                Detailed descriptions, learning resources and guidance relating to these stages are available on{' '}
                <a href="https://avinashsgore.com" target="_blank" rel="noopener noreferrer">https://avinashsgore.com</a>.
              </p>
            </section>

            {/* Clause 2 */}
            <section className={styles.clauseItem}>
              <h2 className={styles.clauseTitle}>2. Role of the Mentor</h2>
              <p className={styles.clauseText}>
                The Mentor shall provide guidance, share experience, facilitate learning, offer suggestions and assist the Mentee in evaluating business-related opportunities and challenges.
              </p>
            </section>

            {/* Clause 3 */}
            <section className={styles.clauseItem}>
              <h2 className={styles.clauseTitle}>3. Commitment of the Mentee</h2>
              <p className={styles.clauseText}>The Mentee agrees to:</p>
              <ul className={styles.clauseBulletList}>
                <li>Actively participate in mentoring sessions.</li>
                <li>Share relevant and accurate information.</li>
                <li>Complete agreed assignments and action points.</li>
                <li>Take ownership of business decisions and implementation.</li>
                <li>Maintain professional conduct and respect the Mentor&apos;s time.</li>
              </ul>
            </section>

            {/* Clause 4 */}
            <section className={styles.clauseItem}>
              <h2 className={styles.clauseTitle}>4. Nature and Limitations of Mentorship</h2>
              <p className={styles.clauseText}>
                The Mentee understands that mentorship is a guidance and knowledge-sharing arrangement. It does not constitute a guarantee of business success, profitability, funding, customers or any specific financial outcome.
              </p>
              <p className={styles.clauseText} style={{ marginTop: '0.45rem' }}>
                All business, financial, legal and operational decisions shall remain the responsibility of the Mentee.
              </p>
            </section>

            {/* Clause 5 */}
            <section className={styles.clauseItem}>
              <h2 className={styles.clauseTitle}>5. Confidentiality</h2>
              <p className={styles.clauseText}>
                Both parties agree to maintain confidentiality regarding sensitive business information, personal information, strategies and discussions shared during the mentorship, except where disclosure is legally required or mutually authorised.
              </p>
            </section>

            {/* Clause 6 */}
            <section className={styles.clauseItem}>
              <h2 className={styles.clauseTitle}>6. Duration and Engagement</h2>
              <p className={styles.clauseText}>
                The duration, frequency of meetings, mode of interaction and applicable mentoring fees shall be as mutually agreed and communicated separately.
              </p>
              <p className={styles.clauseText} style={{ marginTop: '0.45rem' }}>
                Either party may discontinue the mentorship by providing reasonable notice.
              </p>
            </section>

            {/* Clause 7 */}
            <section className={styles.clauseItem}>
              <h2 className={styles.clauseTitle}>7. Acceptance and Declaration</h2>
              <p className={styles.clauseText}>
                I confirm that I have understood the purpose, scope and limitations of the Entrepreneurship Mentorship Programme.
              </p>
              <p className={styles.clauseText} style={{ marginTop: '0.45rem' }}>
                I voluntarily register for this mentorship and acknowledge that my entrepreneurial journey will depend primarily on my commitment, learning, decisions, execution and perseverance.
              </p>
              <p className={styles.clauseText} style={{ marginTop: '0.45rem' }}>
                I understand that the Mentor is a guide and facilitator, while I remain responsible for building my business.
              </p>
            </section>
          </div>

          {/* Signatures */}
          <section className={styles.signatureGrid}>
            {/* Mentee Sign Box */}
            <div className={styles.signatureBox}>
              <div className={styles.signLabel}>MENTEE / PARTICIPANT</div>
              <div className={styles.signLineContainer}>
                <div className={styles.signField}>
                  <span className={styles.subLabel}>Mentee&apos;s Name:</span>
                  <span className={styles.subValue}>{menteeName || '___________________________'}</span>
                </div>
                <div className={styles.signField} style={{ marginTop: '1.25rem' }}>
                  <span className={styles.subLabel}>Signature:</span>
                  <span className={styles.subLine}></span>
                </div>
                <div className={styles.signField} style={{ marginTop: '1.25rem' }}>
                  <span className={styles.subLabel}>Date:</span>
                  <span className={styles.subValue}>{registrationDate || '___________________________'}</span>
                </div>
              </div>
            </div>

            {/* Mentor Sign Box */}
            <div className={styles.signatureBox}>
              <div className={styles.signLabel}>MENTOR</div>
              <div className={styles.signLineContainer}>
                <div className={styles.signField}>
                  <span className={styles.subLabel}>Mentor&apos;s Name:</span>
                  <span className={styles.subValue}>Mr. Avinash S. Gore</span>
                </div>
                <div className={styles.signField} style={{ marginTop: '1.25rem' }}>
                  <span className={styles.subLabel}>Signature:</span>
                  <span className={styles.mentorSignText}>Avinash S. Gore</span>
                </div>
                <div className={styles.signField} style={{ marginTop: '1.25rem' }}>
                  <span className={styles.subLabel}>Date:</span>
                  <span className={styles.subValue}>{registrationDate || '___________________________'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Core Philosophy Footer */}
          <footer className={styles.sheetFooter}>
            <div className={styles.footerQuote}>
              &ldquo;More than starting a business, the objective is to develop an entrepreneur capable of building a responsible, sustainable and meaningful enterprise.&rdquo;
            </div>
            <div className={styles.footerAuthor}>&mdash; Avinash S. Gore &middot; avinashsgore.com</div>
          </footer>
        </article>
      </main>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Loading Mentorship Agreement...</div>}>
      <AgreementContent />
    </Suspense>
  );
}
