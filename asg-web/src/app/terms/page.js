import styles from './terms.module.css';

export const metadata = {
  title: "Terms of Service | Avinash Gore Platform",
  description: "Terms of Service, refund guidelines, and platform rules for Avinash Gore's website and store.",
};

export default function TermsOfService() {
  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Terms of Service</h1>
        <p>Please read these terms and conditions carefully before using our platform.</p>
      </header>

      <div className={`glass-card ${styles.contentCard} animate-fade-in`}>
        <div className={styles.lastUpdated}>Last Updated: September 2026</div>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this website, purchasing books, registering for workshops, courses, webinars, or booking consultations, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue platform use.
        </p>

        <h2>2. Intellectual Property Rights</h2>
        <p>
          All authored literature (including the book <em>&quot;Come on... You can do it!&quot;</em>), course materials, presentation slides, articles, logos, graphics, and video content are the exclusive intellectual property of <strong>Avinash Gore</strong> and are protected by applicable copyright and intellectual property laws. Unauthorized reproduction, distribution, or re-selling is strictly prohibited.
        </p>

        <h2>3. E-Commerce &amp; Book Orders</h2>
        <ul>
          <li><strong>Digital E-Books:</strong> E-Books are delivered digitally. Authorized purchasers receive access to read and preview purchased materials.</li>
          <li><strong>Physical Copies &amp; Shipping:</strong> When ordering a physical copy or upgrading, you must provide accurate address and contact details. Shipping timelines depend on courier partners and logistics.</li>
          <li><strong>Pricing &amp; Availability:</strong> All prices are displayed in Indian Rupees (INR) and are subject to change without prior notice. We reserve the right to limit quantities or cancel orders in case of stock discrepancies.</li>
        </ul>

        <h2>4. Workshops, Seminars &amp; Course Admissions</h2>
        <ul>
          <li><strong>Entry &amp; Tickets:</strong> Access to physical workshops/seminars requires a valid, scanned QR ticket issued via the platform.</li>
          <li><strong>Non-Transferable:</strong> Tickets and registration passes are issued to named attendees and are non-transferable.</li>
          <li><strong>Conduct &amp; Recording:</strong> Unauthorized audio or video recording during training workshops, educational courses, or closed sessions is strictly prohibited.</li>
        </ul>

        <h2>5. Cancellations &amp; Refund Policy</h2>
        <ul>
          <li><strong>Digital Goods:</strong> Digital E-Books and downloadable resources are non-refundable once access or download links have been generated.</li>
          <li><strong>Workshop &amp; Course Registrations:</strong> Workshop seats and seminar passes are generally non-refundable due to limited venue capacities. In case an organizer cancels or reschedules an educational session, registered participants will be offered a full refund or an alternative date.</li>
          <li><strong>Consultations:</strong> Sessions can be rescheduled with at least 24 hours prior notice.</li>
        </ul>

        <h2>6. Limitation of Liability</h2>
        <p>
          All advice, strategies, mentorship, and materials provided on this platform are for educational and inspirational purposes. While based on extensive industrial engineering and executive experience, individual results may vary. We are not liable for any direct or indirect business or financial outcomes.
        </p>

        <h2>7. Governing Law</h2>
        <p>
          These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
        </p>

        <h2>8. Contact Information</h2>
        <p>
          For any legal or service inquiries, please get in touch through our <a href="/contact" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Contact Form</a>.
        </p>
      </div>
    </main>
  );
}
