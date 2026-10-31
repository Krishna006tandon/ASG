"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './examGuidance.module.css';
import { getBookCoverUrl } from '@/lib/imageHelper';

export default function ExamGuidancePage() {
  const [books, setBooks] = useState([]);
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check admin status
  useEffect(() => {
    try {
      const role = localStorage.getItem('asg_role');
      const token = localStorage.getItem('asg_token');
      if (role === 'admin' || (token && atob(token.split('.')[1]).includes('"admin"'))) {
        setIsAdmin(true);
      }
    } catch (e) {}
  }, []);

  // Fetch books from database
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/admin/books');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBooks(data);
            // Default to 'Come On... You Can Do It!' if present
            const comeOnIndex = data.findIndex(b => /can do it|come on/i.test(b.title));
            if (comeOnIndex !== -1) {
              setSelectedBookIndex(comeOnIndex);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch books for guidance page:", err);
      }
    };

    fetchBooks();
  }, []);

  // Default fallback book if database has no items yet
  const defaultBook = {
    title: "Come On… You Can Do It!",
    description: "A simple, practical, and deeply motivational guide designed to transform learning habits, dismantle examination phobia, and prepare students to face examinations with calm, unwavering confidence.",
    price: 299,
    originalPrice: 499,
    physicalPrice: 199,
    coverImage: "",
    isFeatured: true
  };

  const selectedBook = books[selectedBookIndex] || defaultBook;

  const wellnessDimensions = [
    {
      num: "01",
      title: "Physical Wellness",
      subtitle: "Understanding Your Body",
      icon: "🏃‍♂️",
      question: "How many students are systematically taught how to maintain their bodies throughout life?",
      desc: "Knowing the importance of exercise, nutrition, sleep, hydration, preventive healthcare, and healthy habits is essential. Students learn biology, but understanding how to apply health knowledge to daily life is equally vital.",
      takeaway: "Your body is your lifelong companion. You must learn how to take care of it."
    },
    {
      num: "02",
      title: "Emotional Wellness",
      subtitle: "Understanding Your Emotions",
      icon: "🧘‍♂️",
      question: "How do you handle failure, rejection, competition, and intense pressure?",
      desc: "Life will not always go according to our expectations. Failure, disappointment, and uncertainty are unavoidable. Academic intelligence alone does not guarantee emotional resilience.",
      takeaway: "Learning how to handle emotions is as important as learning mathematics or science."
    },
    {
      num: "03",
      title: "Occupational Wellness",
      subtitle: "Discovering the Right Work",
      icon: "💼",
      question: "Are students guided towards the specific work they are naturally suited for?",
      desc: "Students choose streams and degrees, but often end up in professions that clash with their temperament. Occupational wellness is about finding meaningful work aligned with natural strengths.",
      takeaway: "Align your professional journey with your natural inclinations and abilities."
    },
    {
      num: "04",
      title: "Intellectual Wellness",
      subtitle: "Developing a Learning Mindset",
      icon: "🧠",
      question: "Do we learn merely what to think, or do we learn how to think?",
      desc: "The ability to think independently, question assumptions, solve problems, and remain curious throughout life makes a person intellectually formidable. Curiosity should become a lifelong habit.",
      takeaway: "Students must learn not just what to think, but how to think independently."
    },
    {
      num: "05",
      title: "Environmental Wellness",
      subtitle: "Understanding Our Responsibility",
      icon: "🌱",
      question: "Does our environmental awareness translate into daily, responsible habits?",
      desc: "Our surroundings influence our health, productivity, and peace of mind. Cleanliness, sustainability, conservation of resources, and living in harmony with nature must go far beyond textbooks.",
      takeaway: "Cultivate environmental consciousness into everyday responsible actions."
    },
    {
      num: "06",
      title: "Financial Wellness",
      subtitle: "Learning How Money Works",
      icon: "📈",
      question: "How many young graduates truly understand budgeting, compounding, and inflation?",
      desc: "A person may earn an excellent salary but still struggle because they were never taught how to manage money. Financial literacy is about informed decisions, avoiding debt, and financial independence.",
      takeaway: "Financial literacy is not about getting rich quick; it's about making wise choices."
    },
    {
      num: "07",
      title: "Social Wellness",
      subtitle: "Learning How to Maintain Relationships",
      icon: "🤝",
      question: "How much structured guidance do we receive on empathy, listening, and teamwork?",
      desc: "Our happiness is deeply shaped by relationships with family, friends, and society. Communication, empathy, active listening, conflict resolution, and teamwork are essential life skills.",
      takeaway: "Knowing how to interact and understand different perspectives is a lifelong skill."
    },
    {
      num: "08",
      title: "Spiritual Wellness",
      subtitle: "Understanding Your Purpose",
      icon: "🕊️",
      question: "What are your core values, and what gives your everyday efforts meaning?",
      desc: "Spiritual wellness is not about following dogma; it is about discovering your core values, finding inner peace, cultivating gratitude, and choosing to live with genuine integrity.",
      takeaway: "Live with clear values, deep gratitude, and uncompromising integrity."
    }
  ];

  const bookPillars = [
    {
      icon: "⏱️",
      title: "Effective Study Techniques",
      desc: "Learn how to systematically organise your studies, eliminate clutter, and make far better use of your available hours."
    },
    {
      icon: "🧠",
      title: "Memory Improvement",
      desc: "Discover scientifically proven, practical ways to encode and retain complex information for long periods without rote exhaustion."
    },
    {
      icon: "🎵",
      title: "The Music Method",
      desc: "Explore an engaging and innovative learning approach that uses rhythm, association, and cadence to make recall effortless."
    },
    {
      icon: "🎯",
      title: "Better Concentration",
      desc: "Develop laser focus and sustainable everyday study habits that help you remain consistent even when motivation dips."
    },
    {
      icon: "🛡️",
      title: "Examination Confidence",
      desc: "Overcome debilitating examination fear, dismantle negative self-talk, and walk into any test room with a calm, positive mindset."
    },
    {
      icon: "📝",
      title: "Practical Learning",
      desc: "Apply simple, hands-on principles and actionable exercises that immediately integrate into your daily revision routine."
    },
    {
      icon: "🚀",
      title: "Self-Motivation",
      desc: "Build self-reliance, learn to set realistic milestone goals, overcome roadblocks, and maintain steady forward momentum."
    }
  ];

  const lifeExams = [
    {
      icon: "🎓",
      title: "Academic Exams",
      desc: "Board examinations, competitive tests, entrance evaluations, and college degrees."
    },
    {
      icon: "💼",
      title: "Professional Milestones",
      desc: "Job interviews, high-stakes presentations, career transitions, and leadership hurdles."
    },
    {
      icon: "⚖️",
      title: "Critical Decisions",
      desc: "Career choices, financial investments, crisis management, and major crossroads."
    },
    {
      icon: "🌱",
      title: "Personal Life",
      desc: "Family responsibilities, emotional resilience under pressure, and self-mastery."
    }
  ];

  return (
    <main className={styles.main}>
      {/* Admin Notice Banner (Visible when admin is logged in) */}
      {isAdmin && (
        <div className={styles.adminNoticeBanner}>
          <div className={styles.adminNoticeText}>
            <span>⚙️</span>
            <span>
              <strong>Admin Controls:</strong> You can add more books, upload custom cover thumbnails, and update descriptions in the Admin Portal.
            </span>
          </div>
          <Link href="/admin/ecommerce" className={styles.adminNoticeLink}>
            Open Books &amp; Store Catalog &rarr;
          </Link>
        </div>
      )}

      {/* 1. FOUNDATIONAL START: PHILOSOPHY (From ChatGPT Conversation) */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span>💡</span> Education &amp; Life Skills Philosophy
        </div>
        <h1 className={styles.heroTitle}>
          Education Is Not Just About Degrees.<br />
          It Is About Preparing for Life!
        </h1>
        <p className={styles.heroSubtitle}>
          &ldquo;Are We Educating Our Children to Live Life, or Merely to Pass Examinations?&rdquo;
        </p>
        
        <p className={styles.heroLead}>
          Is the purpose of education simply to complete school, obtain a college degree, secure a job, and start earning money?
          I believe education must mean much more than that.
        </p>

        <p className={styles.heroLead}>
          One of the fundamental purposes of education should be to pass on the knowledge, wisdom, and experiences acquired by one generation to the next, so that the younger generation does not have to repeat the same mistakes. They should be able to start from where the previous generation left off and move further ahead in life.
        </p>

        <p className={styles.heroLead}>
          And moving ahead should not mean earning more money alone. It should mean becoming physically healthier, emotionally stronger, intellectually sharper, financially wiser, socially responsible, and spiritually more fulfilled.
        </p>

        <div className={styles.heroHighlightBox}>
          &ldquo;In simple words, the next generation should not just become richer than the previous generation; it should become wiser, healthier, and happier.&rdquo;
        </div>
      </section>

      {/* 2. THE EIGHT DIMENSIONS OF WELLNESS */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Holistic Foundation</span>
          <h2 className={styles.sectionTitle}>The Eight Dimensions of Wellness</h2>
          <p className={styles.sectionDesc}>
            A truly successful life is not built around a single academic score. It is a harmonious balance across eight vital dimensions of human existence.
          </p>
        </div>

        <div className={styles.dimensionsGrid}>
          {wellnessDimensions.map((dim, idx) => (
            <div key={idx} className={styles.dimensionCard}>
              <div className={styles.dimensionHeader}>
                <div className={styles.dimensionIcon}>{dim.icon}</div>
                <div>
                  <div className={styles.dimensionNumber}>Dimension {dim.num}</div>
                  <div className={styles.dimensionTitle}>{dim.title}</div>
                </div>
              </div>
              <div className={styles.dimensionKeyQuestion}>
                &ldquo;{dim.question}&rdquo;
              </div>
              <div className={styles.dimensionDesc}>
                {dim.desc}
              </div>
              <div className={styles.dimensionTakeaway}>
                {dim.takeaway}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DISCOVER YOUR SWADHARMA (From Indian Philosophy) */}
      <section className={styles.swadharmaCard}>
        <span className={styles.swadharmaBadge}>Ancient Wisdom &middot; Modern Application</span>
        <h2 className={styles.swadharmaTitle}>Discover Your Swadharma (स्वधर्म) &ndash; Your Natural Way of Being</h2>
        
        <div className={styles.swadharmaGrid}>
          <div className={styles.swadharmaText}>
            <p style={{ marginBottom: '1rem' }}>
              There is something fascinating about human beings. Just as every individual has a unique, unrepeatable fingerprint, every individual has a distinctive combination of natural abilities, interests, temperament, and strengths.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Why, then, should everyone follow exactly the same definition of success? Some people are naturally inclined towards working with people. Some thrive solving deep technical problems. Others are creative thinkers, organizers, researchers, or born leaders.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              In Indian philosophy, this is known as <strong>स्वधर्म (Swadharma)</strong> &mdash; one&apos;s own natural disposition, inherent strengths, and rightful way of contributing to the world.
            </p>
            <p>
              When your life and work align with your natural strengths, learning becomes joyful, improvement is continuous, and achievement becomes deeply fulfilling.
            </p>
          </div>

          <div className={styles.swadharmaQuoteBox}>
            <div style={{ fontSize: '2.5rem', color: '#F59E0B', lineHeight: 1, marginBottom: '0.5rem' }}>&ldquo;</div>
            <div className={styles.swadharmaQuote}>
              Don&apos;t spend your entire life trying to become somebody else. Discover what is distinctive about you and work towards becoming the best version of yourself.
            </div>
            <div className={styles.swadharmaQuoteAuthor}>
              &mdash; Avinash S. Gore
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE BRIDGE: FROM LIFE PHILOSOPHY TO EXAM REALITY */}
      <section className={styles.bridgeBanner}>
        <h3>Before Facing Life&apos;s Examinations, Master the Exams in Front of You</h3>
        <p>
          These are profound life questions, and finding answers takes time, reflection, and proper mentoring.
          However, before we learn how to navigate our entire lives, we must manage the immediate responsibilities right before us.
          For students and young learners, that starting point is <strong>examinations</strong>.
        </p>
        <div className={styles.bridgePills}>
          <div className={styles.bridgePill}>✓ Remove Exam Phobia</div>
          <div className={styles.bridgePill}>✓ Study Smart, Not Long</div>
          <div className={styles.bridgePill}>✓ Retain with Science</div>
          <div className={styles.bridgePill}>✓ Build Lifelong Poise</div>
        </div>
      </section>

      {/* 5. EXAM GUIDANCE MAIN SECTION */}
      <section className={styles.examHero}>
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
          <span className={styles.sectionBadge}>Perpetual Solutions Academic Excellence</span>
          <h2 className={styles.sectionTitle} style={{ fontSize: '2.4rem' }}>
            EXAM GUIDANCE
          </h2>
          <p style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
            Prepare Smart. Remember Better. Perform with Confidence.
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1F2937', marginBottom: '1.25rem' }}>
            Every Student Can Do Better. All You Need Is the Right Guidance!
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: '#4B5563' }}>
            Examinations are an important part of student life, but preparing for them should not be a source of fear, anxiety, or frustration.
          </p>
        </div>

        {/* The Student Dilemma */}
        <div className={styles.dilemmaGrid}>
          <div className={styles.dilemmaCard}>
            <div className={styles.dilemmaIcon}>❓</div>
            <p>Have you ever studied something thoroughly, but struggled to remember it during the examination?</p>
          </div>
          <div className={styles.dilemmaCard}>
            <div className={styles.dilemmaIcon}>⏳</div>
            <p>Do you find it difficult to concentrate, manage your daily study time, or maintain consistency?</p>
          </div>
          <div className={styles.dilemmaCard}>
            <div className={styles.dilemmaIcon}>😰</div>
            <p>Do you experience sudden fear, nervousness, or mental blanks when faced with exam questions?</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '1.5rem 0 0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4F46E5', background: '#EEF2FF', padding: '0.4rem 1.25rem', borderRadius: '50px' }}>
            You Are Not Alone!
          </span>
        </div>

        <div className={styles.secretBox}>
          <h4>The Secret to High Examination Performance</h4>
          <p>
            Effective preparation is not about burning the midnight oil for endless exhausting hours.
            It is understanding <strong>how to study</strong>, <strong>how to remember</strong>, <strong>how to revise</strong>, and <strong>how to present</strong> what you have learned under exam conditions.
          </p>
          <p style={{ marginTop: '0.75rem', fontWeight: '600' }}>
            At Perpetual Solutions, we believe that every student has the potential to perform better with the right approach, scientific guidance, and authentic motivation.
          </p>
        </div>
      </section>

      {/* 6. DYNAMIC BOOK SHOWCASE (Managed via Admin Portal) */}
      <section className={styles.bookSection}>
        {/* If Admin has added multiple books, show a switcher bar */}
        {books.length > 1 && (
          <div className={styles.bookTabsBar}>
            <span className={styles.bookTabLabel}>Select Book:</span>
            {books.map((b, idx) => (
              <button
                key={b._id || idx}
                onClick={() => {
                  setSelectedBookIndex(idx);
                  setImageError(false);
                }}
                className={`${styles.bookTabBtn} ${selectedBookIndex === idx ? styles.bookTabBtnActive : ''}`}
              >
                <span>📖</span> {b.title}
              </button>
            ))}
          </div>
        )}

        <div className={styles.bookCard}>
          {/* Left Media: Cover Thumbnail or 3D Realistic Book Cover */}
          <div className={styles.bookMedia}>
            {selectedBook.coverImage && !imageError ? (
              <div className={styles.bookCoverWrapper}>
                <img 
                  src={getBookCoverUrl(selectedBook.coverImage)} 
                  alt={selectedBook.title}
                  className={styles.bookCover}
                  onError={() => setImageError(true)}
                />
                <div className={styles.bookBadgeFloating}>
                  ★ Best Seller
                </div>
              </div>
            ) : (
              /* Realistic 3D Book Cover Presentation when no custom image is uploaded */
              <div className={styles.realisticBook}>
                <span className={styles.realisticBookBadge}>★ Official Guidebook</span>
                <div>
                  <div className={styles.realisticBookTitle}>
                    {selectedBook.title}
                  </div>
                  <div className={styles.realisticBookTagline}>
                    A Small Book That Can Make a Big Difference!
                  </div>
                </div>
                <div className={styles.realisticBookAuthor}>
                  Written by Avinash S. Gore
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: '500' }}>
                Available in eBook &amp; Physical Paperback
              </span>
            </div>
          </div>

          {/* Right Details: Managed via Admin Catalog */}
          <div className={styles.bookDetails}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className={styles.bookMetaPill}>
                <span>📖</span> Study Skills &amp; Motivation
              </div>

              {isAdmin && (
                <Link 
                  href="/admin/ecommerce" 
                  style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: '600', textDecoration: 'underline' }}
                >
                  ✏️ Edit Book in Admin
                </Link>
              )}
            </div>

            <h2 className={styles.bookTitle}>
              Introducing: {selectedBook.title}
            </h2>
            <div className={styles.bookAuthor}>
              Written by Avinash S. Gore
            </div>
            <div className={styles.bookTagline}>
              A Small Book That Can Make a Big Difference!
            </div>
            <p className={styles.bookDescription}>
              {selectedBook.description || "Written specifically for students and young learners, Come On… You Can Do It! is a simple, practical, and deeply motivational guide designed to transform learning habits and examination results."}
            </p>
            <p className={styles.bookDescription}>
              Unlike conventional, dry academic manuals, it zooms straight into how human psychology, memory encoding, and stress response actually work during test preparation. Through lucid explanations, relatable real-world examples, and easy-to-adopt techniques, the book helps you build a winning routine.
            </p>

            {/* Pricing Box */}
            <div className={styles.priceBox}>
              <div className={styles.priceTag}>
                <span className={styles.priceLabel}>eBook:</span>
                <span className={styles.sellingPrice}>₹{selectedBook.price}</span>
                {selectedBook.originalPrice > selectedBook.price && (
                  <span className={styles.originalPrice}>₹{selectedBook.originalPrice}</span>
                )}
              </div>
              {selectedBook.physicalPrice > 0 && (
                <span className={styles.formatBadge}>
                  Paperback: +₹{selectedBook.physicalPrice}
                </span>
              )}
              <span className={styles.formatBadge} style={{ background: '#ECFDF5', color: '#059669' }}>
                Instant Access
              </span>
            </div>

            <div className={styles.bookFeatureTags}>
              <span className={styles.bookFeatureTag}>⚡ The Famous &apos;Music Method&apos;</span>
              <span className={styles.bookFeatureTag}>🧠 Long-Term Memory Retention</span>
              <span className={styles.bookFeatureTag}>🎯 Distraction Elimination</span>
              <span className={styles.bookFeatureTag}>🧘 Phobia &amp; Stress Dissolution</span>
              <span className={styles.bookFeatureTag}>📊 Time Distribution Matrix</span>
            </div>

            <div className={styles.bookCtas}>
              <Link href="/ecommerce" className={`${styles.conversionBtn} ${styles.btnPrimary}`}>
                Get the Book in Store &rarr;
              </Link>
              <Link href="/contact" className={`${styles.conversionBtn} ${styles.btnSecondary}`}>
                Enquire for School/College Bulks
              </Link>
            </div>
          </div>
        </div>

        {/* If Admin has added multiple books, display a catalog grid */}
        {books.length > 1 && (
          <div className={styles.moreBooksSection}>
            <div className={styles.sectionHeader} style={{ marginBottom: '1.5rem' }}>
              <span className={styles.sectionBadge}>Complete Literature</span>
              <h3 className={styles.sectionTitle} style={{ fontSize: '1.75rem' }}>
                All Books &amp; Study Resources by Avinash Gore
              </h3>
              <p className={styles.sectionDesc}>
                Explore additional publications, guides, and strategic resources from our published catalog.
              </p>
            </div>

            <div className={styles.moreBooksGrid}>
              {books.map((b, idx) => (
                <div key={b._id || idx} className={styles.moreBookCard}>
                  <div className={styles.moreBookThumbWrapper}>
                    {b.coverImage ? (
                      <img 
                        src={getBookCoverUrl(b.coverImage)} 
                        alt={b.title} 
                        className={styles.moreBookThumb} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem', color: '#4B5563', fontWeight: '700' }}>
                        📖 {b.title}
                      </div>
                    )}
                  </div>
                  <h4 className={styles.moreBookTitle}>{b.title}</h4>
                  <p className={styles.moreBookDesc}>{b.description}</p>
                  <div className={styles.moreBookPrice}>₹{b.price}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedBookIndex(idx);
                        window.scrollTo({ top: 900, behavior: 'smooth' });
                      }}
                      className={styles.conversionBtn}
                      style={{ flex: 1, padding: '0.5rem', background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', cursor: 'pointer' }}
                    >
                      Inspect
                    </button>
                    <Link
                      href="/ecommerce"
                      className={`${styles.conversionBtn} ${styles.btnPrimary}`}
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                    >
                      Buy in Store
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 7. WHAT WILL YOU DISCOVER IN THIS BOOK? (7 Pillars) */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Inside the Book</span>
          <h2 className={styles.sectionTitle}>What Will You Discover in This Book?</h2>
          <p className={styles.sectionDesc}>
            Seven transformative pillars designed to turn examination anxiety into quiet, self-assured confidence.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {bookPillars.map((pillar, i) => (
            <div key={i} className={styles.pillarCard}>
              <div className={styles.pillarIconBox}>{pillar.icon}</div>
              <div>
                <h4>{pillar.title}</h4>
                <p>{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. NOT JUST FOR STUDENTS – A GUIDE FOR LIFE! */}
      <section className={styles.guideForLifeCard}>
        <div className={styles.guideForLifeHeader}>
          <span className={styles.sectionBadge} style={{ background: '#DBEAFE', color: '#1D4ED8' }}>Universal Relevance</span>
          <h3>Not Just for Students &ndash; A Guide for Life!</h3>
          <p>
            Although the book is primarily written for students, its principles are equally useful for working professionals, teachers, leaders, and adults.
          </p>
        </div>

        <div className={styles.lifeExamsGrid}>
          {lifeExams.map((item, idx) => (
            <div key={idx} className={styles.lifeExamItem}>
              <div className={styles.lifeExamIcon}>{item.icon}</div>
              <h5>{item.title}</h5>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.lifeQuoteBanner}>
          <p>
            &ldquo;The book is not just about passing examinations. It is about preparing yourself to face life&apos;s examinations!&rdquo;
          </p>
        </div>
      </section>

      {/* 9. WHAT READERS HAVE TO SAY & ACADEMIC APPRECIATION */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Testimonials &amp; Endorsements</span>
          <h2 className={styles.sectionTitle}>What Readers &amp; Educators Have to Say</h2>
          <p className={styles.sectionDesc}>
            Real praise from readers and distinguished academic leaders who experienced the impact of the book firsthand.
          </p>
        </div>

        <div className={styles.reviewsGrid}>
          {/* Reader review */}
          <div className={styles.reviewCard}>
            <div>
              <div style={{ color: '#F59E0B', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                ★★★★★
              </div>
              <p className={styles.reviewQuote}>
                &ldquo;Small &amp; Beautiful, Come on, BUY IT, READ IT, and You Can Do It! I just loved this book. I just finished the whole book, the day I bought it. This book has more potential to always keep you awake with its simple examples and practical exercises. He has put forward the Music Method, which is equally interesting and useful. The principles are easily adaptable to daily life. You will be on your winning path when you complete this book.&rdquo;
              </p>
            </div>
            <div className={styles.reviewerMeta}>
              <div className={styles.reviewerAvatar}>R</div>
              <div>
                <div className={styles.reviewerName}>Verified Amazon &amp; BookGanga Reader</div>
                <div className={styles.reviewerRole}>Review of &ldquo;Come On… You Can Do It!&rdquo;</div>
              </div>
            </div>
          </div>

          {/* Academic endorsement */}
          <div className={styles.reviewCard}>
            <div>
              <div style={{ color: '#F59E0B', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                ★★★★★
              </div>
              <p className={styles.reviewQuote}>
                &ldquo;A remarkable spark of a good writer. The book is written in extraordinarily simple language with a deeply motivational approach, practical study techniques, and captivating presentation. It will inspire students, significantly reduce examination phobia, and be a constant companion in their learning journey.&rdquo;
              </p>
            </div>
            <div className={styles.reviewerMeta}>
              <div className={styles.reviewerAvatar} style={{ background: '#ECFDF5', color: '#059669' }}>D</div>
              <div>
                <div className={styles.reviewerName}>Dr. Sarita Deshpande</div>
                <div className={styles.reviewerRole}>Principal, Raisoni College, Nagpur</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ABOUT THE AUTHOR */}
      <section className={styles.authorCard}>
        <div className={styles.authorImgWrapper}>
          <img 
            src="/images/image5.jpg" 
            alt="Avinash S. Gore - Author and Mentor" 
            className={styles.authorImg}
          />
        </div>

        <div className={styles.authorInfo}>
          <span className={styles.sectionBadge} style={{ marginBottom: '0.5rem' }}>The Author &amp; Mentor</span>
          <h3>Avinash S. Gore</h3>
          <div className={styles.authorRole}>
            Chemical Engineer, MBA in Environmental Management &middot; MD, Perpetual Solutions
          </div>
          <p className={styles.authorBio}>
            Avinash S. Gore brings over 25 years of diverse professional and industrial leadership across global multinational enterprises like Reliance, Sadara Chemical Company (JV of Saudi Aramco &amp; Dow Chemical), Jubilant Life Science, and Supreme Petrochem.
          </p>
          <p className={styles.authorBio}>
            As an empathetic mentor, trainer, and industry leader, he has interacted with thousands of school students, engineering graduates, young professionals, and experienced executives across diverse learning environments.
          </p>
          <div className={styles.authorMissionBox}>
            <strong>His Author Mission:</strong> &ldquo;To help learners understand that success is not only about intelligence or hard work. It is about developing the right approach to learning.&rdquo;
          </div>
        </div>
      </section>

      {/* 11. CENTRAL PHILOSOPHICAL QUOTE BANNER */}
      <section className={styles.philosophyBanner}>
        <div className={styles.philosophyQuote}>
          &ldquo;Education should not merely teach you how to earn a living. It should teach you how to live.&rdquo;
        </div>
        <div className={styles.philosophyAuthor}>
          &mdash; Avinash S. Gore
        </div>
      </section>

      {/* 12. ACTIONABLE NEXT STEPS: HOW WE CAN HELP YOU */}
      <section>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Take the First Step</span>
          <h2 className={styles.sectionTitle}>Take the First Step Towards Understanding Yourself!</h2>
          <p className={styles.sectionDesc}>
            Your academic journey is important, but your life is much bigger than your academic results.
            Start by improving the way you study, discover your natural strengths, and build the confidence to conquer every challenge.
          </p>
          <div style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--primary-color)', fontSize: '1.1rem' }}>
            &ldquo;Our objective is not to tell everyone what to become. It is to help every individual discover what they can become.&rdquo;
          </div>
        </div>

        <div className={styles.conversionGrid}>
          {/* Pathway 1 */}
          <div className={styles.conversionCard}>
            <span className={`${styles.conversionBadge} ${styles.conversionBadgeHighlight}`}>Recommended Start</span>
            <div>
              <div className={styles.conversionNumber}>STEP 01</div>
              <h4>Exam Preparation &amp; Study Skills</h4>
              <p>
                Master practical techniques for time management, memory improvement, laser concentration, structured revision, and fearless examination performance.
              </p>
            </div>
            <Link href="/ecommerce" className={`${styles.conversionBtn} ${styles.btnPrimary}`}>
              Order the Book &rarr;
            </Link>
          </div>

          {/* Pathway 2 */}
          <div className={styles.conversionCard}>
            <span className={styles.conversionBadge}>Assessment</span>
            <div>
              <div className={styles.conversionNumber}>STEP 02</div>
              <h4>Career &amp; Natural Strength Assessment</h4>
              <p>
                Understand your temperament, cognitive preferences, natural abilities, and Swadharma across 10 career archetypes through our scientific assessment.
              </p>
            </div>
            <Link href="/career-guidance" className={`${styles.conversionBtn} ${styles.btnPrimary}`}>
              Take Career Assessment &rarr;
            </Link>
          </div>

          {/* Pathway 3 */}
          <div className={styles.conversionCard}>
            <span className={styles.conversionBadge}>Interactive</span>
            <div>
              <div className={styles.conversionNumber}>STEP 03</div>
              <h4>Life Skills &amp; Personal Development</h4>
              <p>
                Develop awareness of the eight dimensions of wellness, build emotional resilience, and join our transformative institutional workshops and seminars.
              </p>
            </div>
            <Link href="/webinars" className={`${styles.conversionBtn} ${styles.btnSecondary}`}>
              Explore Workshops &rarr;
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '0.04em' }}>
            COME ON… YOU CAN DO IT!
          </span>
        </div>
      </section>
    </main>
  );
}
