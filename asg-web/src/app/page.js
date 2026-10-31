import styles from './page.module.css';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';
import Webinar from '@/models/Webinar';
import Blog from '@/models/Blog';
import Review from '@/models/Review';
import AchievementsGallery from '@/components/AchievementsGallery';
import TestimonialsSection from '@/components/TestimonialsSection';
import { getBookCoverUrl } from '@/lib/imageHelper';
import JsonLd from '@/components/JsonLd';
import { getBookSchema } from '@/lib/seoSchemas';

export const metadata = {
  title: "Avinash Gore | Author, Career Mentor & Business Consultant",
  description: "Official website of Avinash Gore. Author of 'Come on... You can do it!', Career Mentor, Youth Empowerment Specialist, and Industrial Safety Consultant.",
  alternates: {
    canonical: "/",
  },
};

// Disable caching to always show fresh data
export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectToDatabase();

  // Fetch dynamic data
  const books = await Book.find({}).sort({ createdAt: -1 }).limit(3).lean();
  const webinars = await Webinar.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(2).lean();
  const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(3).lean();
  const rawReviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(8).lean();
  const reviews = JSON.parse(JSON.stringify(rawReviews));

  const primaryBook = books[0] || {
    title: "Come on... You can do it!",
    description: "Empowering students and young professionals to choose the right career path, build confidence, and achieve their goals.",
    ebookPrice: 299,
  };
  const bookSchema = getBookSchema(primaryBook);

  return (
    <main className={styles.main}>
      <JsonLd data={bookSchema} />
      {/* Hero Section */}
      <header className={`${styles.hero} animate-fade-in`}>
        <div className={styles.heroBadge}>YOUTH EMPOWERMENT</div>
        <h1><span className={styles.gradientText}>Empowering Youth, Inspiring Careers & Transforming Potential</span></h1>
        <p>Empowering students and young professionals to choose the right career path, build confidence, and achieve their goals through practical workshops and the book &quot;Come on... You can do it!&quot;.</p>
        
        <div className={styles.ctaGroup}>
          <Link href="/ecommerce" className="btn-accent">Get The Book</Link>
          <Link href="/webinars" className="btn-primary">Join Workshops</Link>
        </div>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <Link href="/consulting" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>Looking for Business & Startup Consulting?</Link>
        </p>
      </header>

      {/* Premium Detailed Biography Section */}
      <section className={styles.journeySection}>
        <div className={styles.journeyHeader}>
          <h2>The Journey</h2>
          <div className={styles.journeyDivider}></div>
          <p className={styles.journeySubtitle}>
            A legacy of engineering excellence, inspiring authorship, and transformational leadership.
          </p>
        </div>
        
        <div className={styles.journeyTimeline}>
          {/* Vertical Timeline Line */}
          <div className={styles.journeyLine}></div>
          
          <div className={styles.journeyList}>
            
            {/* Journey 1: Professional */}
            <div className={styles.journeyItem}>
              <div className={styles.journeyIconWrapper}>
                <img src="/images/image5.jpg" alt="Avinash Gore" className={styles.journeyIconImg} />
              </div>
              <div className={`glass-card ${styles.journeyCard} ${styles.journeyCardPrimary}`}>
                <h3>25+ Years of Global Engineering</h3>
                <p>
                  As a B.Tech Chemical Engineer, Avinash spent over two and a half decades mastering his craft on a global scale. His career spans top-tier organizations like <strong style={{color: 'var(--primary-dark)'}}>Reliance</strong>, <strong style={{color: 'var(--primary-dark)'}}>Sadara (JV of Saudi Aramco & Dow Chemical)</strong>, <strong style={{color: 'var(--primary-dark)'}}>Jubilant Life Science</strong>, and <strong style={{color: 'var(--primary-dark)'}}>Supreme Petrochem</strong>. Today, as the Managing Director at <strong style={{color: 'var(--primary-dark)'}}>Perpetual Solutions</strong>, he drives sustainable evolution, consulting for giants like HPCL, KNPC, BVQI, Indorama, and Solar Industries.
                </p>
              </div>
            </div>

            {/* Journey 2: Author */}
            <div className={styles.journeyItem}>
              <div 
                className={styles.journeyIconWrapper}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', boxShadow: '0 10px 20px rgba(16,185,129,0.3)' }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '55%', height: '55%' }}>
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <div className={`glass-card ${styles.journeyCard} ${styles.journeyCardGreen}`}>
                <h3>Inspiring Through the Written Word</h3>
                <p>
                  Recognizing the struggles students face with exam phobia, Avinash authored the highly acclaimed book <strong style={{color: '#059669'}}>&quot;Come on... You can do it!&quot;</strong>. Praised by academic leaders like Dr. Sarita Deshpande for his &quot;spark of a good writer,&quot; the book distills complex psychological challenges into actionable scientific study techniques and life-changing success principles.
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <Link href="/exam-guidance" style={{ color: '#059669', fontWeight: '700', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    Explore Exam Guidance &amp; Book &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Journey 3: Motivator */}
            <div className={styles.journeyItem}>
              <div 
                className={styles.journeyIconWrapper}
                style={{ background: 'linear-gradient(135deg, #EC4899, #BE185D)', color: 'white', border: 'none', boxShadow: '0 10px 20px rgba(236,72,153,0.3)' }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '55%', height: '55%' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
              </div>
              <div className={`glass-card ${styles.journeyCard} ${styles.journeyCardPink}`}>
                <h3>Transforming Fear into Focus</h3>
                <p>
                  Driven by a mission to unlock true potential, Avinash conducts powerful <strong style={{color: '#BE185D'}}>One Day Workshops</strong> for students and professionals. These sessions go beyond theoretical lectures—focusing on practical exercises, confidence building, and handling real-world pressure like a champion. His ultimate philosophy: Transform anxiety into achievement.
                </p>
              </div>
            </div>

            {/* Journey 4: Entrepreneur & Start-up Mentor */}
            <div className={styles.journeyItem}>
              <div 
                className={styles.journeyIconWrapper}
                style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none', boxShadow: '0 10px 20px rgba(5,150,105,0.3)' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🚀</span>
              </div>
              <div className={`glass-card ${styles.journeyCard}`} style={{ borderTop: '4px solid #059669' }}>
                <h3>From an Idea to an Enterprise</h3>
                <p>
                  As an entrepreneur who has built and operated successful ventures across industrial consultancy (<strong style={{color: '#059669'}}>Perpetual Solutions</strong>), event management (<strong style={{color: '#059669'}}>Celefesto</strong>), education (<strong style={{color: '#059669'}}>X-Caliber</strong>), and digital software, Avinash provides practical 1-on-1 mentoring for aspiring founders and business owners under a unique <strong style={{color: '#059669'}}>&quot;Pay If You Get Benefitted&quot;</strong> philosophy.
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <Link href="/startup-guidance" style={{ color: '#059669', fontWeight: '700', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    Explore Start-up Guidance &amp; Book Session &rarr;
                  </Link>
                </div>
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
              <div key={book._id.toString()} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={styles.bookCoverContainer}>
                  {book.coverImage ? (
                    <img 
                      src={getBookCoverUrl(book.coverImage)} 
                      alt={book.title} 
                      className={styles.bookCoverImg} 
                    />
                  ) : (
                    <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#D1D5DB' }}>
                      {book.title[0]}
                    </span>
                  )}
                </div>

                {/* Format Badges */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#EEF2FF', color: '#4F46E5' }}>
                    📄 Digital E-Book
                  </span>
                  {book.physicalPrice > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#F0FDF4', color: '#166534' }}>
                      📦 Physical Copy Available
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{book.title}</h3>
                <p style={{fontSize: '0.9rem', color: '#4B5563', lineHeight: '1.5', margin: '0 0 1.25rem 0', flexGrow: 1}}>
                  {book.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-dark)'}}>₹{book.price}</span>
                      {book.originalPrice > book.price && (
                        <span style={{textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.9rem'}}>
                          ₹{book.originalPrice}
                        </span>
                      )}
                    </div>
                    <span style={{fontSize: '0.75rem', color: '#6B7280'}}>Instant Access</span>
                  </div>
                  <Link href="/ecommerce" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                    Get Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Webinars Highlights */}
      {webinars.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Training Workshops</h2>
            <Link href="/webinars" className={styles.viewAll}>View Workshops &rarr;</Link>
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

      {/* Verified Reviews & Testimonials Section */}
      <TestimonialsSection />
    </main>
  );
}
