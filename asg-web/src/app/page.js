import styles from './page.module.css';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';
import Webinar from '@/models/Webinar';
import Blog from '@/models/Blog';
import AchievementsGallery from '@/components/AchievementsGallery';
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
        <div className={styles.heroBadge}>EXECUTIVE ADVISORY & CONSULTING</div>
        <h1><span className={styles.gradientText}>Elevate Your</span> <span>Business & Finances</span></h1>
        <p>Expert Guidance in Startups, E-Commerce, and Financial Literacy tailored for the modern professional.</p>
        
        <div className={styles.ctaGroup}>
          <Link href="/consulting" className="btn-accent">Explore Consulting</Link>
          <Link href="/webinars" className="btn-primary">View Webinars</Link>
        </div>
      </header>

      {/* Premium Detailed Biography Section */}
      <section className={styles.section} style={{ position: 'relative', padding: '6rem 2rem', margin: '4rem 0', borderRadius: '30px', background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', color: '#111827', marginBottom: '1rem', fontWeight: '900', letterSpacing: '-0.02em' }}>The Journey</h2>
          <div style={{ width: '80px', height: '6px', background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', margin: '0 auto', borderRadius: '3px' }}></div>
          <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', color: '#6B7280', maxWidth: '600px', margin: '1.5rem auto 0' }}>A legacy of engineering excellence, inspiring authorship, and transformational leadership.</p>
        </div>
        
        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
          {/* Vertical Timeline Line */}
          <div style={{ position: 'absolute', left: '26px', top: '0', bottom: '0', width: '4px', background: 'linear-gradient(180deg, var(--primary-color), #10B981, #EC4899)', borderRadius: '2px', opacity: '0.2' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            
            {/* Journey 1: Professional */}
            <div style={{ position: 'relative', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', zIndex: 1, flexShrink: 0, width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 20px rgba(121,66,181,0.3)' }}>
                <img src="/images/image5.jpg" alt="Avinash Gore" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="glass-card" style={{ flexGrow: 1, padding: '2.5rem', border: 'none', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderLeft: '6px solid var(--primary-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#111827', fontWeight: '800' }}>25+ Years of Global Engineering</h3>
                <p style={{ color: '#4B5563', lineHeight: '1.8', fontSize: '1.1rem' }}>
                  As a B.Tech Chemical Engineer, Avinash spent over two and a half decades mastering his craft on a global scale. His career spans top-tier organizations like <strong style={{color: 'var(--primary-dark)'}}>Reliance</strong> and <strong style={{color: 'var(--primary-dark)'}}>Saudi Aramco</strong>. Today, as the Managing Director at <strong style={{color: 'var(--primary-dark)'}}>Perpetual Solutions</strong>, he drives sustainable evolution, consulting for giants like HPCL, KNPC, BVQI, Indorama, and Solar Industries.
                </p>
              </div>
            </div>

            {/* Journey 2: Author */}
            <div style={{ position: 'relative', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', padding: '1.2rem', borderRadius: '50%', flexShrink: 0, boxShadow: '0 10px 20px rgba(16,185,129,0.3)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </div>
              <div className="glass-card" style={{ flexGrow: 1, padding: '2.5rem', border: 'none', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderLeft: '6px solid #10B981', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#111827', fontWeight: '800' }}>Inspiring Through the Written Word</h3>
                <p style={{ color: '#4B5563', lineHeight: '1.8', fontSize: '1.1rem' }}>
                  Recognizing the struggles students face with exam phobia, he authored the highly acclaimed book <strong style={{color: '#059669'}}>"Come on... You can do it!"</strong>. Praised by academic leaders like Dr. Sarita Deshpande for his "spark of a good writer," the book distills complex psychological challenges into actionable scientific study techniques and life-changing success principles.
                </p>
              </div>
            </div>

            {/* Journey 3: Motivator */}
            <div style={{ position: 'relative', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(135deg, #EC4899, #BE185D)', color: 'white', padding: '1.2rem', borderRadius: '50%', flexShrink: 0, boxShadow: '0 10px 20px rgba(236,72,153,0.3)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
              </div>
              <div className="glass-card" style={{ flexGrow: 1, padding: '2.5rem', border: 'none', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderLeft: '6px solid #EC4899', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#111827', fontWeight: '800' }}>Transforming Fear into Focus</h3>
                <p style={{ color: '#4B5563', lineHeight: '1.8', fontSize: '1.1rem' }}>
                  Driven by a mission to unlock true potential, Avinash conducts powerful <strong style={{color: '#BE185D'}}>One Day Workshops</strong> for students and professionals. These sessions go beyond theoretical lectures—focusing on practical exercises, confidence building, and handling real-world pressure like a champion. His ultimate philosophy: Transform anxiety into achievement.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <AchievementsGallery />

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
            <h2>Upcoming Webinars</h2>
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
