import styles from './privacy.module.css';

export const metadata = {
  title: "Privacy Policy | Avinash Gore Platform",
  description: "Privacy Policy and data protection terms for Avinash Gore's knowledge and personal brand platform.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicy() {
  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Privacy Policy</h1>
        <p>Your privacy and data protection are important to us.</p>
      </header>

      <div className={`glass-card ${styles.contentCard} animate-fade-in`}>
        <div className={styles.lastUpdated}>Last Updated: September 2026</div>

        <h2>1. Introduction</h2>
        <p>
          Welcome to the official platform of <strong>Avinash Gore</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy governs our data collection, processing, and usage practices when you visit our website, purchase authored books, enroll in workshops/courses, register for webinars, or book 1-on-1 consultations.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We collect information that you voluntarily provide to us when registering, placing an order, or interacting with our services:</p>
        <ul>
          <li><strong>Personal Identification Information:</strong> Full name, email address, phone number, and profession/role.</li>
          <li><strong>Shipping Information:</strong> Physical delivery address and contact number for physical book orders and upgrades.</li>
          <li><strong>Booking &amp; Registration Details:</strong> Workshop/webinar selections, consultation scheduling notes, and ticket numbers.</li>
          <li><strong>Payment Information:</strong> Transactions are securely processed through authorized third-party gateways (e.g., Razorpay). We do not store sensitive credit/debit card numbers or UPI PINs on our servers.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>The information we collect is used strictly for legitimate business and educational purposes, including:</p>
        <ul>
          <li>Processing book orders and coordinating physical doorstep delivery.</li>
          <li>Generating verifiable QR tickets for in-person workshops, courses, and seminars.</li>
          <li>Sending automated email confirmations, invoices, and Zoom/meeting access links for online sessions.</li>
          <li>Administering consultation schedules and sharing tailored advisory materials.</li>
          <li>Improving platform performance, security, and user experience.</li>
        </ul>

        <h2>4. Data Sharing &amp; Third Parties</h2>
        <p>
          We do not sell, rent, or trade your personal information to third parties. We may share necessary details with trusted service providers strictly to perform platform operations:
        </p>
        <ul>
          <li><strong>Payment Processors:</strong> Razorpay for secure checkout and payment settlement.</li>
          <li><strong>Cloud &amp; Hosting Services:</strong> Vercel for website hosting and secure asset storage (Vercel Blob).</li>
          <li><strong>Database Providers:</strong> MongoDB Atlas for encrypted data storage.</li>
          <li><strong>Communication Services:</strong> SMTP mail servers for order and ticket delivery emails.</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement industry-standard administrative, technical, and physical security measures (including TLS/SSL encryption and JWT authentication) to safeguard your personal data.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You have the right to request access to your personal data, request corrections, or request deletion of your account information by contacting our administrative team.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions or concerns regarding this Privacy Policy, please reach out to us via our <a href="/contact" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Contact Page</a> or email us at our designated support address.
        </p>
      </div>
    </main>
  );
}
