import styles from './page.module.css';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';
import Webinar from '@/models/Webinar';
import Blog from '@/models/Blog';

// Disable caching to always show fresh data
export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectToDatabase();

  // Fetch dynamic data
  const books = await Book.find({}).sort({ createdAt: -1 }).limit(3).lean();
  const webinars = await Webinar.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(2).lean();
  const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(3).lean();

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <header className={`${styles.hero} animate-fade-in`}>
        <div className={styles.heroBadge}>Avinash Professional</div>
        <h1><span className={styles.gradientText}>Elevate Your</span> <span>Business & Finances</span></h1>
        <p>Expert Guidance in Startups, E-Commerce, and Financial Literacy tailored for the modern professional.</p>
        
        <div className={styles.ctaGroup}>
          <Link href="/consulting" className="btn-accent">Explore Consulting</Link>
          <Link href="/webinars" className="btn-primary">View Masterclasses</Link>
        </div>
      </header>

      {/* Dynamic E-Commerce Store Highlights */}
      {books.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Featured Books</h2>
            <Link href="/ecommerce" className={styles.viewAll}>View Store &rarr;</Link>
          </div>
          <div className={styles.dynamicGrid}>
            {books.map(book => (
              <div key={book._id.toString()} className="glass-card">
                <h3>{book.title}</h3>
                <p style={{fontSize: '0.9rem', color: '#6B7280', margin: '0.5rem 0'}}>{book.description}</p>
                <div style={{fontWeight: 'bold', color: 'var(--primary-dark)', marginTop: 'auto'}}>₹{book.price}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Webinars Highlights */}
      {webinars.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Masterclasses</h2>
            <Link href="/webinars" className={styles.viewAll}>View Schedule &rarr;</Link>
          </div>
          <div className={styles.dynamicGrid}>
            {webinars.map(webinar => (
              <div key={webinar._id.toString()} className="glass-card">
                <h3>{webinar.title}</h3>
                <div style={{fontSize: '0.9rem', color: '#6B7280', margin: '0.5rem 0'}}>
                  📅 {new Date(webinar.date).toLocaleDateString()} at {webinar.time}
                </div>
                <div style={{fontWeight: 'bold', color: 'var(--primary-dark)', marginTop: 'auto'}}>
                  ₹{webinar.price} • {webinar.seatsTotal - webinar.seatsBooked} seats left
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Blogs Highlights */}
      {blogs.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Latest Insights & Strategy</h2>
            <Link href="/blog" className={styles.viewAll}>Read All &rarr;</Link>
          </div>
          <div className={styles.dynamicGrid}>
            {blogs.map(blog => (
              <div key={blog._id.toString()} className="glass-card">
                <div style={{fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.5rem'}}>{blog.category}</div>
                <h3>{blog.title}</h3>
                <p style={{fontSize: '0.9rem', color: '#6B7280', margin: '0.5rem 0'}}>{blog.excerpt}</p>
                <Link href={`/blog/${blog.slug}`} style={{fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 'bold', textDecoration: 'none'}}>Read More &rarr;</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
