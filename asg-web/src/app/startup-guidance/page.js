"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './startupGuidance.module.css';

export default function StartupGuidancePage() {
  // Modal states
  const [activeVideoModal, setActiveVideoModal] = useState(null); // 'intro' | 1 | 2 | 3 | null
  
  // Self assessment state (interactive reality check)
  const [checkedQuestions, setCheckedQuestions] = useState({});
  
  // Appointment Enquiry Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentStage: 'Employed professional exploring a business idea',
    businessIdea: '',
    challenges: [],
    message: '',
    sessionMode: 'Virtual (Google Meet/Zoom)',
    preferredDate: '',
    agreedPayBenefitted: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Introspective questions
  const introspectiveQuestions = [
    {
      icon: "💡",
      text: "Do you have a business idea but are confused about how to get started?"
    },
    {
      icon: "💼",
      text: "Are you employed but constantly thinking about starting something of your own?"
    },
    {
      icon: "🛡️",
      text: "Do you want to start a business but are afraid of making mistakes and losing money?"
    },
    {
      icon: "📊",
      text: "Have you already started a business but are struggling to get customers, manage operations or generate profits?"
    },
    {
      icon: "🔀",
      text: "Do you have multiple ideas but cannot decide which one to pursue?"
    },
    {
      icon: "🚀",
      text: "Are you running a business but feel that you are not achieving your true potential?"
    }
  ];

  // Businesses built & operated
  const businesses = [
    {
      num: "01",
      icon: "🏭",
      name: "Perpetual Solutions",
      sector: "Industrial Consultancy",
      desc: "An industrial consulting organisation providing specialised services in Process Safety, Sustainability, Process Engineering, Operational Improvement and Professional Training.",
      tags: ["Process Safety", "Sustainability", "Process Engineering", "Corporate Training"],
      url: "https://perpetualsolutions.co.in/home"
    },
    {
      num: "02",
      icon: "🎉",
      name: "Celefesto",
      sector: "Events & Celebrations",
      desc: "A business focused on organising and managing high-end corporate events, personal celebrations and bespoke occasions with end-to-end operational execution.",
      tags: ["Corporate Events", "Celebrations", "Operations", "Logistics"],
      url: "https://celefesto.com"
    },
    {
      num: "03",
      icon: "🎒",
      name: "X-Caliber",
      sector: "Nursery & Kids School",
      desc: "An initiative in early childhood education, nurturing young minds, managing human talent, and providing children with a joyful foundation for their learning journey.",
      tags: ["Early Childhood", "Education", "Institution Building", "Talent Management"],
      url: null
    },
    {
      num: "04",
      icon: "💻",
      name: "Digital Businesses",
      sector: "Apps, Websites & Software",
      desc: "Exploring and developing digital solutions, applications, websites and software products, understanding the nuances of tech-driven businesses and SaaS models.",
      tags: ["Software Products", "Web & Mobile Apps", "Automation", "CRM"],
      url: null
    }
  ];

  // 9 Common mistakes avoided
  const mistakes = [
    "Starting without properly understanding the market.",
    "Investing money before validating the business idea.",
    "Assuming that a good product will automatically attract customers.",
    "Underestimating sales, marketing and customer acquisition.",
    "Employing people without defining their roles and responsibilities.",
    "Spending too much time on minor activities instead of focusing on business growth.",
    "Not understanding cash flow, working capital and profitability.",
    "Trying to do everything independently instead of building systems.",
    "Expanding too early without establishing a stable business model."
  ];

  // 8 Discussion pillars
  const pillars = [
    {
      num: "01",
      icon: "🔍",
      title: "Business Idea Evaluation",
      question: "Is your idea commercially viable? Is there a genuine need?",
      desc: "Understand who your customers are and what makes your offering different before investing significant capital and time."
    },
    {
      num: "02",
      icon: "📊",
      title: "Business Model Development",
      question: "How will your business actually generate recurring revenue?",
      desc: "Analyse pricing strategies, revenue models, unit economics, cost structures, profitability and operational scalability."
    },
    {
      num: "03",
      icon: "🏁",
      title: "Starting from Scratch",
      question: "What should you do first? What can wait?",
      desc: "Convert your raw idea into an actionable 0-to-1 blueprint, estimating realistic initial capital and what to outsource."
    },
    {
      num: "04",
      icon: "🎯",
      title: "Sales & Customer Acquisition",
      question: "How will you find customers and get them to pay?",
      desc: "A business cannot survive without paying customers. Formulate clear positioning, generate inquiries, and build high-conversion sales channels."
    },
    {
      num: "05",
      icon: "⚙️",
      title: "Operations & Team Management",
      question: "How will you build systems and delegate as you grow?",
      desc: "Learn how to establish standard operating procedures, define employee responsibilities, set KPIs, and avoid operational chaos."
    },
    {
      num: "06",
      icon: "💻",
      title: "Digital Presence & Technology",
      question: "How can software, automation & CRM give you an edge?",
      desc: "Leverage websites, mobile apps, digital workflow automation, CRM tools, and digital marketing to scale with lean overheads."
    },
    {
      num: "07",
      icon: "🚀",
      title: "Business Growth & Expansion",
      question: "When and how should you scale your operations?",
      desc: "Scale through measured strategy rather than reckless optimism. Evaluate new product lines, team expansion, and market entry."
    },
    {
      num: "08",
      icon: "🧩",
      title: "Overcoming Roadblocks",
      question: "Need an objective outside sounding board?",
      desc: "Get an unbiased perspective to question assumptions, unpack complex bottlenecks, and pinpoint practical paths forward."
    }
  ];

  // Self assessment questions
  const selfCheckQuestions = [
    { id: 1, text: "Do I enjoy taking full personal responsibility?" },
    { id: 2, text: "Can I handle uncertainty, ambiguity, and sudden change?" },
    { id: 3, text: "Am I comfortable approaching people, pitching, and selling?" },
    { id: 4, text: "Can I manage financial risks and fluctuations?" },
    { id: 5, text: "Am I willing to work tirelessly without immediate rewards?" },
    { id: 6, text: "Do I have the patience to build something steadily over several years?" }
  ];

  // Who should approach me
  const personas = [
    { icon: "💡", title: "Aspiring entrepreneurs with an early-stage business idea" },
    { icon: "💼", title: "Working professionals planning to launch their own venture" },
    { icon: "🌱", title: "First-generation founders needing practical direction" },
    { icon: "📈", title: "Small business owners struggling with revenue & growth" },
    { icon: "🔄", title: "Existing entrepreneurs looking for fresh, unbiased perspectives" },
    { icon: "🏢", title: "Founders entering consultancy, services, education, events or digital tech" },
    { icon: "🎓", title: "Young graduates wanting to explore entrepreneurship over conventional jobs" }
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      journey: "Transitioned from Corporate Engineering to B2B Industrial Equipment",
      avatarBg: "#059669",
      tag: "B2B & Manufacturing",
      thumb: "/images/image3.jpg",
      quote: "Avinash Sir's pre-validation questions saved me from sinking ₹15 Lakhs into premature machinery. He made me focus on customer pre-orders and pilot contracts first. That single piece of advice made all the difference.",
      videoTitle: "Rahul's Journey: From Corporate Employee to Sustainable B2B Founder",
      videoOutline: [
        "Identified niche in industrial process components.",
        "Overcame the fear of leaving a 12-year corporate salary.",
        "Validated demand with 3 anchor clients before investing capital.",
        "Avinash's personal mentoring on pricing and B2B contract terms."
      ]
    },
    {
      id: 2,
      name: "Priya Deshmukh",
      journey: "Founder, LittleSparks Preschool & Learning Center",
      avatarBg: "#4F46E5",
      tag: "Education & Services",
      thumb: "/images/image1.png",
      quote: "Running a school is emotionally demanding. Avinash Sir's insights on SOPs, staff delegation, and parent communication transformed our operations completely. I transitioned from daily firefighting to strategic expansion.",
      videoTitle: "Priya's Journey: Building Systems in Education & Services",
      videoOutline: [
        "Started with passion but lacked operational systems.",
        "Struggled with high staff turnover and administrative burnout.",
        "Implemented structured employee roles and parent onboarding.",
        "Scaled enrollment by 40% with calm, predictable operations."
      ]
    },
    {
      id: 3,
      name: "Vikram Patel",
      journey: "Founder, CraftBoutique Events & D2C Experiences",
      avatarBg: "#D97706",
      tag: "Events & Digital Brand",
      thumb: "/images/image4.png",
      quote: "The 'Pay If You Get Benefitted' philosophy proved his absolute sincerity. He took time to dissect my cash flow bottlenecks and marketing missteps. In just three sessions, our unit economics turned profitable.",
      videoTitle: "Vikram's Journey: Mastering Working Capital & Event Logistics",
      videoOutline: [
        "High revenue but constant cash crunches and delayed payments.",
        "Re-engineered client advance milestone structures.",
        "Established digital marketing and referral partnerships.",
        "Achieved positive cash flow within 90 days."
      ]
    }
  ];

  const handleTogglePill = (challenge) => {
    setFormData(prev => {
      const exists = prev.challenges.includes(challenge);
      return {
        ...prev,
        challenges: exists 
          ? prev.challenges.filter(c => c !== challenge)
          : [...prev.challenges, challenge]
      };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/startup-guidance/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry.');
      }

      setFormSuccess(true);
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleCheck = (id) => {
    setCheckedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const checkedCount = Object.values(checkedQuestions).filter(Boolean).length;

  return (
    <main className={styles.main}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span>🚀</span> From an Idea to an Enterprise – Let&apos;s Make It Happen!
        </div>

        <h1 className={styles.heroTitle}>
          START-UP <span className={styles.heroTitleAccent}>GUIDANCE</span>
        </h1>

        <div className={styles.heroTagline}>
          Ideas are everywhere. Execution makes the difference.
        </div>

        <div className={styles.heroPhilosophyQuote}>
          &ldquo;Don&apos;t just dream of starting a business. Understand how to make it work.&rdquo;
        </div>

        <p className={styles.heroLead}>
          Practical, one-on-one personal mentoring by <strong>Avinash S. Gore</strong> &mdash; serial entrepreneur, industrial leader, and founder of businesses across industrial consulting, event management, education, and digital technology.
        </p>

        <p className={styles.heroLead}>
          Starting a business is not just about having an exciting idea. It is about converting that idea into something people genuinely need, are willing to pay for, and which you can reliably deliver and scale.
        </p>

        <div className={styles.heroCtas}>
          <button 
            onClick={() => {
              const el = document.getElementById('booking-enquiry-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={styles.ctaPrimary}
          >
            <span>📅</span> Book a Personal Guidance Session &rarr;
          </button>
          <button 
            onClick={() => setActiveVideoModal('intro')}
            className={styles.ctaSecondary}
          >
            <span>▶</span> Watch Introduction Video (2 Min)
          </button>
        </div>

        {/* Key Feature Stats Pills */}
        <div className={styles.heroKeyStats}>
          <div className={styles.statPill}>
            <div className={styles.statIcon}>🤝</div>
            <div>
              <div className={styles.statLabel}>Unique Philosophy</div>
              <div className={styles.statValue}>Pay If You Get Benefitted</div>
            </div>
          </div>
          <div className={styles.statPill}>
            <div className={styles.statIcon}>🏢</div>
            <div>
              <div className={styles.statLabel}>Proven Foundation</div>
              <div className={styles.statValue}>Real Multi-Sector Founder</div>
            </div>
          </div>
          <div className={styles.statPill}>
            <div className={styles.statIcon}>🎯</div>
            <div>
              <div className={styles.statLabel}>Mentoring Approach</div>
              <div className={styles.statValue}>Zero Fluff &middot; 100% Practical</div>
            </div>
          </div>
          <div className={styles.statPill}>
            <div className={styles.statIcon}>📈</div>
            <div>
              <div className={styles.statLabel}>0-to-1 Roadmap</div>
              <div className={styles.statValue}>Validation to Scale</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MENTOR CREDIBILITY & INTRO VIDEO (ChatGPT Recommendation #1) */}
      <section className={styles.mentorSection}>
        <div className={styles.mentorGrid}>
          {/* Left: Credibility & Background */}
          <div className={styles.mentorProfile}>
            <div className={styles.mentorAvatarBox}>
              <img 
                src="/images/image5.jpg" 
                alt="Avinash S. Gore - Entrepreneur & Mentor" 
                className={styles.mentorPhoto}
              />
              <div className={styles.mentorTitleArea}>
                <h3>Avinash S. Gore</h3>
                <div className={styles.mentorRoleTag}>
                  Founder, Serial Entrepreneur &amp; Managing Director
                </div>
              </div>
            </div>

            <p className={styles.mentorBioText}>
              &ldquo;My strongest differentiator is not that I am a management consultant who offers textbook frameworks. It is that <strong>I have actually built, funded, staffed, and operated real businesses across diverse industries</strong> &mdash; from high-stakes industrial safety and process engineering to education, events, and modern software.&rdquo;
            </p>

            <p className={styles.mentorBioText}>
              I know firsthand the anxiety of the 0-to-1 phase, the difficulty of landing your first paying customers, managing cash flow during dry quarters, and putting systems in place so your business does not collapse under pressure.
            </p>

            <div className={styles.mentorCredentialBadges}>
              <span className={styles.credentialBadge}>🎓 B.Tech Chemical Engineering</span>
              <span className={styles.credentialBadge}>🌱 MBA in Environmental Mgmt</span>
              <span className={styles.credentialBadge}>🏭 25+ Years Global Industry Leadership</span>
              <span className={styles.credentialBadge}>🚀 4 Active Venture Portfolios</span>
            </div>
          </div>

          {/* Right: Video Card with Play Action */}
          <div className={styles.videoCard}>
            <div 
              className={styles.videoThumbWrapper}
              onClick={() => setActiveVideoModal('intro')}
              role="button"
              tabIndex={0}
              aria-label="Play introductory video"
            >
              <img 
                src="/images/image1.png" 
                alt="Avinash S. Gore startup mentoring video thumbnail" 
                className={styles.videoThumbImg}
              />
              <div className={styles.playBtnCircle}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className={styles.videoDurationBadge}>2:45 MIN</span>
            </div>

            <div className={styles.videoMetaInfo}>
              <div className={styles.videoMetaTitle}>
                A Personal Message to Aspiring Founders
              </div>
              <div className={styles.videoMetaDesc}>
                Avinash explains his core mentoring philosophy, why practical experience matters more than theory, and how our &ldquo;Pay If You Get Benefitted&rdquo; sessions work.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTROSPECTIVE QUESTIONS / FOUNDER HOOK */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Self-Discovery</span>
          <h2 className={styles.sectionTitle}>
            Have a Business Idea? Want to Become an Entrepreneur? But Don&apos;t Know Where to Start?
          </h2>
          <p className={styles.sectionDesc}>
            Let me ask you a few honest questions that every aspiring founder grapples with.
          </p>
        </div>

        <div className={styles.questionsGrid}>
          {introspectiveQuestions.map((q, idx) => (
            <div key={idx} className={styles.questionCard}>
              <div className={styles.questionIcon}>{q.icon}</div>
              <div className={styles.questionText}>{q.text}</div>
            </div>
          ))}
        </div>

        <div className={styles.questionsHookBanner}>
          <div className={styles.questionsHookText}>
            If you relate to any of these questions, perhaps a conversation with an experienced entrepreneur can help you see things differently.
          </div>
          <div className={styles.questionsHookSub}>
            Starting a business is not just about having an idea. It is about converting that idea into something people need, are willing to pay for, and which you can successfully deliver.
          </div>
        </div>
      </section>

      {/* 4. WHY LISTEN TO ME? REAL BUSINESSES BUILT & OPERATED */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Entrepreneurial Track Record</span>
          <h2 className={styles.sectionTitle}>Why Listen to Me?</h2>
          <p className={styles.sectionDesc}>
            I am not someone who has only studied entrepreneurship through books or conducted theoretical business management sessions. I have personally ventured into multiple businesses across different industries, each with its own challenges, customers, people, operations, and business models.
          </p>
        </div>

        <div className={styles.venturesGrid}>
          {businesses.map((biz, idx) => (
            <div key={idx} className={styles.ventureCard}>
              <div>
                <div className={styles.ventureHeader}>
                  <div className={styles.ventureIcon}>{biz.icon}</div>
                  <div className={styles.ventureIndex}>Venture {biz.num}</div>
                </div>
                <h3 className={styles.ventureName}>{biz.name}</h3>
                <div className={styles.ventureSector}>{biz.sector}</div>
                <p className={styles.ventureDesc}>{biz.desc}</p>
              </div>

              <div>
                <div className={styles.ventureTags}>
                  {biz.tags.map((t, i) => (
                    <span key={i} className={styles.ventureTag}>{t}</span>
                  ))}
                </div>

                {biz.url ? (
                  <a 
                    href={biz.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.ventureLink}
                  >
                    Visit Venture Website &rarr;
                  </a>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' }}>
                    Active Venture Portfolio
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.fundamentalsBanner}>
          <div className={styles.fundamentalsTitle}>
            The Big Lesson from Multi-Sector Entrepreneurship
          </div>
          <p className={styles.fundamentalsText}>
            From industrial consulting to event management, education to digital products, each venture has taught me something new about entrepreneurship. And perhaps the biggest lesson is this: <strong>Every business is different, but the fundamentals of building a successful business remain surprisingly similar.</strong>
          </p>
        </div>
      </section>

      {/* 5. WHAT I HAVE LEARNT: COMMON MISTAKES TO AVOID */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge} style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
            Avoid Expensive Pitfalls
          </span>
          <h2 className={styles.sectionTitle}>What I Have Learnt Through My Entrepreneurial Journey</h2>
          <p className={styles.sectionDesc}>
            Having a business idea is easy. Making it successful is an entirely different journey. Over the years, I have realised that many businesses struggle not because founders lack intelligence or hard work, but because they overlook critical fundamentals.
          </p>
        </div>

        <div className={styles.mistakesGrid}>
          {mistakes.map((mistake, idx) => (
            <div key={idx} className={styles.mistakeCard}>
              <div className={styles.mistakeCross}>✕</div>
              <div className={styles.mistakeTitle}>{mistake}</div>
            </div>
          ))}
        </div>

        <div className={styles.mistakesQuoteBox}>
          <div className={styles.mistakesQuoteText}>
            &ldquo;Many of these mistakes can be avoided through the right questions, proper planning, and timely guidance. You do not necessarily need to learn everything through expensive mistakes. Learn from the experiences of others, but build your own journey.&rdquo;
          </div>
          <div className={styles.mistakesQuoteAuthor}>
            &mdash; Avinash S. Gore
          </div>
        </div>
      </section>

      {/* 6. HOW CAN I HELP YOU? (8 CORE PILLARS) */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Actionable Mentoring</span>
          <h2 className={styles.sectionTitle}>How Can I Help You?</h2>
          <p className={styles.sectionDesc}>
            My objective is not to give you a ready-made formula for success &mdash; no such formula exists. My objective is to understand your idea, your capabilities, your available resources, and your aspirations, and help you identify a practical way forward.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {pillars.map((p, idx) => (
            <div key={idx} className={styles.pillarCard}>
              <div className={styles.pillarTop}>
                <div className={styles.pillarIcon}>{p.icon}</div>
                <div className={styles.pillarNumber}>Pillar {p.num}</div>
              </div>
              <h3 className={styles.pillarTitle}>{p.title}</h3>
              <div className={styles.pillarQuestion}>{p.question}</div>
              <p className={styles.pillarDesc}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. NOT EVERYONE NEEDS TO START A BUSINESS! (HONEST REALITY CHECK) */}
      <section className={styles.realityCheckCard}>
        <div className={styles.realityCheckHeader}>
          <span className={styles.realityBadge}>Honest Perspective</span>
          <h2 className={styles.realityTitle}>Not Everyone Needs to Start a Business!</h2>
          <p className={styles.realityLead}>
            I strongly believe that entrepreneurship is not compulsory for everyone. Some people are naturally inclined towards business, while others may find far greater satisfaction, peace, and success in employment, professional services, research, teaching, or management.
          </p>
          <p className={styles.realityLead} style={{ marginTop: '0.75rem', fontWeight: '700' }}>
            Before risking your savings, understand yourself. Click below to honestly reflect on these 6 checkpoints:
          </p>
        </div>

        <div className={styles.realityChecklistGrid}>
          {selfCheckQuestions.map((q) => {
            const isChecked = !!checkedQuestions[q.id];
            return (
              <div 
                key={q.id} 
                className={styles.realityChecklistItem}
                onClick={() => toggleCheck(q.id)}
              >
                <div className={`${styles.realityCheckbox} ${isChecked ? styles.realityCheckboxActive : ''}`}>
                  {isChecked ? '✓' : ''}
                </div>
                <div className={styles.realityChecklistText}>{q.text}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.realityQuoteBanner}>
          <div className={styles.realityQuoteText}>
            {checkedCount === 0 ? (
              <span>&ldquo;Choose entrepreneurship because it suits you, not because it looks attractive from the outside.&rdquo;</span>
            ) : checkedCount >= 4 ? (
              <span>👍 You exhibit strong entrepreneurial disposition ({checkedCount}/6 checked). A personal guidance session can help channel this into an actionable enterprise.</span>
            ) : (
              <span>💡 You have checked {checkedCount}/6 traits. It is wise to carefully evaluate whether a founder role or an intrapreneurial/professional path best serves your temperament.</span>
            )}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#92400E' }}>
            A business should complement your natural temperament, interests, and capabilities &mdash; not work against them.
          </div>
        </div>
      </section>

      {/* 8. MY PHILOSOPHY: PAY IF YOU GET BENEFITTED! (ChatGPT Recommendation #3) */}
      <section className={styles.payBenefittedSection}>
        <span className={styles.payBenefittedBadge}>Our Differentiator</span>
        <h2 className={styles.payBenefittedTitle}>My Philosophy: Pay If You Get Benefitted!</h2>
        <div className={styles.payBenefittedSubtitle}>
          Personal Guidance Is My Passion, Not Just Another Consulting Assignment.
        </div>

        <div className={styles.payBenefittedGrid}>
          <div className={styles.payBenefittedContent}>
            <p>
              I genuinely enjoy interacting with people, understanding their ideas, and helping them discover possibilities they may not have considered. Personal guidance is something I do out of passion and a desire to make a meaningful difference.
            </p>
            <p>
              I do charge a nominal or mutually agreed fee for my time and involvement because I believe that when people invest something in guidance, they are more likely to value the process and take execution seriously.
            </p>
            <p>
              However, I operate on a very straightforward principle:
            </p>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderLeft: '4px solid #34D399', padding: '1rem 1.25rem', borderRadius: '8px', margin: '1.25rem 0' }}>
              <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
                &ldquo;If you genuinely feel that my guidance has made a positive difference to your thinking, decisions, or business journey, you pay for the value you have received. If you don&apos;t feel benefited, I don&apos;t expect you to pay.&rdquo;
              </strong>
            </div>
            <p>
              I am not interested in charging someone merely for having a conversation. I would rather help a few people make tangible, life-changing progress than conduct numerous sessions without making a difference.
            </p>
          </div>

          <div className={styles.payBenefittedCardHighlight}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝</div>
            <div className={styles.payBenefittedCardTitle}>A Relationship Built on Mutual Trust</div>
            <div className={styles.payBenefittedCardText}>
              Expectations and nominal session parameters are agreed upon mutually prior to the call. You enter the conversation with absolute peace of mind and zero financial risk.
            </div>
            <div className={styles.payBenefittedGuaranteeBox}>
              ✓ 100% Value Guarantee &middot; Authentic Mentoring
            </div>
          </div>
        </div>
      </section>

      {/* 9. WHO SHOULD APPROACH ME? (7 Personas) */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Ideal Profiles</span>
          <h2 className={styles.sectionTitle}>Who Should Approach Me?</h2>
          <p className={styles.sectionDesc}>
            You don&apos;t need to have a perfect pitch deck or a 50-page business plan before reaching out. Sometimes, all you need is an honest conversation to organise your thoughts and identify your next step.
          </p>
        </div>

        <div className={styles.personasGrid}>
          {personas.map((p, idx) => (
            <div key={idx} className={styles.personaCard}>
              <div className={styles.personaIcon}>{p.icon}</div>
              <div className={styles.personaTitle}>{p.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. REAL PEOPLE. REAL JOURNEYS. REAL EXPERIENCES. (ChatGPT Recommendation #2) */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Verified Stories</span>
          <h2 className={styles.sectionTitle}>Real People. Real Journeys. Real Experiences.</h2>
          <p className={styles.sectionDesc}>
            I believe the best way to understand the impact of personal guidance is to hear directly from the founders who have experienced it. Watch their stories and discover how structured mentoring changed their trajectory.
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((t) => (
            <div key={t.id} className={styles.testimonialCard}>
              <div 
                className={styles.testimonialVideoThumb}
                onClick={() => setActiveVideoModal(t.id)}
                role="button"
                tabIndex={0}
                aria-label={`Watch testimonial by ${t.name}`}
              >
                <img 
                  src={t.thumb} 
                  alt={`${t.name} testimonial thumbnail`} 
                  className={styles.testimonialThumbImg}
                />
                <span className={styles.testimonialTag}>{t.tag}</span>
                <div className={styles.testimonialPlayBtn}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              <div className={styles.testimonialContent}>
                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                
                <div className={styles.testimonialFounder}>
                  <div className={styles.founderAvatar} style={{ background: t.avatarBg }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className={styles.founderName}>{t.name}</div>
                    <div className={styles.founderJourney}>{t.journey}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. INTERACTIVE APPOINTMENT ENQUIRY SECTION */}
      <section id="booking-enquiry-section" className={styles.enquirySection}>
        <div className={styles.sectionHeader} style={{ marginBottom: '2.5rem' }}>
          <span className={styles.sectionBadge}>Get in Touch</span>
          <h2 className={styles.sectionTitle}>Let&apos;s Have a Conversation!</h2>
          <p className={styles.sectionDesc}>
            You may have a business idea, an existing business roadblock, or simply a desire to become an entrepreneur. You don&apos;t have to figure everything out alone.
          </p>
        </div>

        {formSuccess ? (
          <div className={styles.successMessageCard}>
            <div className={styles.successIcon}>🎉</div>
            <div className={styles.successTitle}>Enquiry Submitted Successfully!</div>
            <p className={styles.successText}>
              Thank you, <strong>{formData.name}</strong>. We have received your details and an acknowledgement email has been sent to <strong>{formData.email}</strong>.
            </p>
            <p className={styles.successText}>
              Avinash will personally review your venture overview and contact you to schedule your 1-on-1 session. Remember, our &ldquo;Pay If You Get Benefitted&rdquo; philosophy applies completely!
            </p>
            <button 
              onClick={() => {
                setFormSuccess(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  currentStage: 'Employed professional exploring a business idea',
                  businessIdea: '',
                  challenges: [],
                  message: '',
                  sessionMode: 'Virtual (Google Meet/Zoom)',
                  preferredDate: '',
                  agreedPayBenefitted: true
                });
              }}
              className={styles.ctaSecondary}
              style={{ margin: '0 auto' }}
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            {formError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: '600' }}>
                {formError}
              </div>
            )}

            <div className={styles.formGrid}>
              {/* Full Name */}
              <div>
                <label className={styles.formLabel}>Your Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Email Address */}
              <div>
                <label className={styles.formLabel}>Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. ramesh@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className={styles.formLabel}>WhatsApp / Contact Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Current Status */}
              <div>
                <label className={styles.formLabel}>Current Stage / Background</label>
                <select 
                  value={formData.currentStage}
                  onChange={(e) => setFormData({ ...formData, currentStage: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="Employed professional exploring a business idea">Employed professional planning a startup</option>
                  <option value="Aspiring first-time founder (pre-launch)">Aspiring first-time founder (idea stage)</option>
                  <option value="Early-stage startup founder (0–2 years old)">Early-stage startup founder (operational)</option>
                  <option value="Existing business owner looking to scale/turnaround">Existing business owner (scaling/pivot)</option>
                  <option value="Young graduate / student exploring entrepreneurship">Student / recent graduate</option>
                </select>
              </div>

              {/* Business Idea Overview */}
              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>Tell Me About Your Business Idea or Existing Venture</label>
                <textarea 
                  rows={3}
                  placeholder="Briefly describe what product or service you want to build or operate, your target customers, and what progress you've made so far..."
                  value={formData.businessIdea}
                  onChange={(e) => setFormData({ ...formData, businessIdea: e.target.value })}
                  className={styles.formTextarea}
                />
              </div>

              {/* Topics / Discussion Pillars Checkboxes */}
              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>What Core Areas Do You Want to Focus on in the Session?</label>
                <div className={styles.checkboxPillsGrid}>
                  {[
                    "Idea Validation & Demand",
                    "Business Model & Pricing",
                    "0-to-1 Launch Roadmap",
                    "Customer Acquisition & Sales",
                    "Team Roles & SOPs",
                    "Digital Tech & Automation",
                    "Financial Planning & Cashflow",
                    "Overcoming Current Roadblock"
                  ].map((topic, i) => {
                    const isSelected = formData.challenges.includes(topic);
                    return (
                      <div 
                        key={i}
                        className={`${styles.checkboxPill} ${isSelected ? styles.checkboxPillActive : ''}`}
                        onClick={() => handleTogglePill(topic)}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{topic}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specific Question / Goal */}
              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>What is the Single Biggest Question You Want Answered?</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. How do I decide whether to quit my job now or validate for 6 months part-time?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={styles.formTextarea}
                />
              </div>

              {/* Preferred Mode & Date */}
              <div>
                <label className={styles.formLabel}>Preferred Session Format</label>
                <select 
                  value={formData.sessionMode}
                  onChange={(e) => setFormData({ ...formData, sessionMode: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="Virtual (Google Meet/Zoom)">Virtual (Google Meet / Zoom 1-on-1)</option>
                  <option value="In-Person (Nagpur / Pune)">In-Person (Nagpur / Pune by arrangement)</option>
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Target Preferred Date (Flexible)</label>
                <input 
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Pay If You Get Benefitted Checkbox Notice */}
            <div className={styles.formNoticeBox}>
              <div style={{ fontSize: '1.4rem' }}>💡</div>
              <div className={styles.formNoticeText}>
                <strong>&ldquo;Pay If You Get Benefitted&rdquo; Commitment:</strong> We will review your application and agree upon mutually convenient session timings. You only pay the nominal session honorarium if you genuinely feel the consultation has added clarity and value to your entrepreneurial journey.
              </div>
            </div>

            <button 
              type="submit" 
              disabled={formLoading}
              className={styles.submitBtn}
            >
              {formLoading ? 'Submitting Request...' : 'Submit Start-up Guidance Request 🚀'}
            </button>
          </form>
        )}
      </section>

      {/* 12. THE 3-PILLAR PERSONAL MENTORING UNIFIED ECOSYSTEM (ChatGPT's "One More Idea") */}
      <section className={styles.mentoringEcosystem}>
        <div className={styles.sectionHeader} style={{ marginBottom: '1.5rem' }}>
          <span className={styles.sectionBadge} style={{ background: '#EDE9FE', color: '#6D28D9', borderColor: '#C4B5FD' }}>
            Unified Life Philosophy
          </span>
          <h2 className={styles.sectionTitle}>
            &ldquo;Helping People Discover Their Potential and Move Forward in Life.&rdquo;
          </h2>
          <p className={styles.sectionDesc}>
            Personal mentoring by Avinash S. Gore connects three transformative initiatives, guiding individuals through every critical milestone of life.
          </p>
        </div>

        <div className={styles.mentoringGrid}>
          {/* Pillar 1: Exam Guidance */}
          <div className={`${styles.mentoringCard} ${styles.mentoringCardExam}`}>
            <div className={styles.mentoringIcon}>🎓</div>
            <h3 className={styles.mentoringName}>Exam Guidance</h3>
            <div className={styles.mentoringAudience}>For Students &amp; Young Learners</div>
            <p className={styles.mentoringText}>
              Dismantling examination phobia, mastering the revolutionary Music Method, encoding long-term memory, and cultivating calm test-taking poise.
            </p>
            <Link href="/exam-guidance" className={styles.mentoringLink} style={{ color: '#4F46E5' }}>
              Explore Exam Guidance &rarr;
            </Link>
          </div>

          {/* Pillar 2: Career Guidance */}
          <div className={`${styles.mentoringCard} ${styles.mentoringCardCareer}`}>
            <div className={styles.mentoringIcon}>🧭</div>
            <h3 className={styles.mentoringName}>Career Guidance</h3>
            <div className={styles.mentoringAudience}>For Graduates &amp; Professionals</div>
            <p className={styles.mentoringText}>
              Discovering your Swadharma (स्वधर्म) &mdash; assessing natural cognitive preferences, temperament, and strengths across 10 career archetypes.
            </p>
            <Link href="/career-guidance" className={styles.mentoringLink} style={{ color: '#D97706' }}>
              Take Career Assessment &rarr;
            </Link>
          </div>

          {/* Pillar 3: Start-up Guidance */}
          <div className={`${styles.mentoringCard} ${styles.mentoringCardStartup}`}>
            <div className={styles.mentoringIcon}>🚀</div>
            <h3 className={styles.mentoringName}>Start-up Guidance</h3>
            <div className={styles.mentoringAudience}>For Aspiring Founders &amp; Entrepreneurs</div>
            <p className={styles.mentoringText}>
              Converting ideas into commercially viable, profitable enterprises with real-world execution, system building, and customer acquisition.
            </p>
            <span style={{ color: '#059669', fontWeight: '800', fontSize: '0.92rem' }}>
              ✓ You are here
            </span>
          </div>
        </div>
      </section>

      {/* 13. CLOSING PHILOSOPHY BANNER */}
      <section className={styles.closingBanner}>
        <div className={styles.closingLead}>Your Idea &middot; Your Dream &middot; Your Journey</div>
        <h2 className={styles.closingTitle}>Let&apos;s Give It the Right Direction!</h2>
        <p className={styles.closingSubtitle}>
          &ldquo;I may not have all the answers, and I certainly cannot promise that every business idea will succeed. But I can share my experiences, ask the right questions, and help you avoid mistakes that may otherwise cost you years of time, hard-earned money, and effort. Because sometimes, one meaningful conversation can change the direction of your entrepreneurial journey.&rdquo;
        </p>

        <button 
          onClick={() => {
            const el = document.getElementById('booking-enquiry-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={styles.ctaPrimary}
          style={{ background: '#10B981', color: '#064E3B' }}
        >
          Connect with Avinash S. Gore for Personal Guidance &rarr;
        </button>
      </section>

      {/* MODAL: VIDEO & STORY VIEWER */}
      {activeVideoModal && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.modalCloseBtn}
              onClick={() => setActiveVideoModal(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            {activeVideoModal === 'intro' ? (
              <div>
                <span className={styles.sectionBadge} style={{ marginBottom: '0.75rem' }}>
                  Introductory Video Presentation
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>
                  Why I Guide Aspiring Entrepreneurs
                </h3>
                <div style={{ fontSize: '0.92rem', color: '#059669', fontWeight: '600', marginBottom: '1.25rem' }}>
                  A Personal Message from Avinash S. Gore
                </div>

                <div style={{ borderRadius: '14px', overflow: 'hidden', background: '#0F172A', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                  <img 
                    src="/images/image5.jpg" 
                    alt="Avinash Gore" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '1rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>Introductory Video Script &amp; Outline</div>
                    <div style={{ fontSize: '0.85rem', color: '#A7F3D0' }}>Duration: 2 Minutes 45 Seconds</div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#0F172A' }}>Key Highlights Covered:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.94rem', lineHeight: '1.6' }}>
                    <li><strong>The Gap in Theory:</strong> Why MBA textbooks don&apos;t prepare you for real customer objections, cash crunches, and supply chain bottlenecks.</li>
                    <li><strong>The 4 Ventures:</strong> Real lessons from Perpetual Solutions, Celefesto, X-Caliber, and tech platforms.</li>
                    <li><strong>The Mentoring Format:</strong> 1-on-1 private deep dives, dissecting your exact unit economics and launch fears.</li>
                    <li><strong>Pay If You Get Benefitted:</strong> Why personal integrity and your actual results come before fees.</li>
                  </ul>
                </div>

                <button 
                  onClick={() => {
                    setActiveVideoModal(null);
                    const el = document.getElementById('booking-enquiry-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={styles.ctaPrimary}
                  style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                >
                  Book Your 1-on-1 Session Now &rarr;
                </button>
              </div>
            ) : (
              (() => {
                const item = testimonials.find(t => t.id === activeVideoModal);
                if (!item) return null;
                return (
                  <div>
                    <span className={styles.sectionBadge} style={{ marginBottom: '0.75rem' }}>
                      Founder Story &middot; {item.tag}
                    </span>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                      {item.videoTitle}
                    </h3>
                    <div style={{ fontSize: '0.92rem', color: '#059669', fontWeight: '600', marginBottom: '1.25rem' }}>
                      {item.name} &mdash; {item.journey}
                    </div>

                    <div style={{ borderRadius: '14px', overflow: 'hidden', background: '#0F172A', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                      <img 
                        src={item.thumb} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>Case Study &amp; Founder Interview</div>
                        <div style={{ fontSize: '0.82rem', color: '#A7F3D0' }}>Recorded Mentoring Review</div>
                      </div>
                    </div>

                    <blockquote style={{ background: '#F0FDF4', borderLeft: '4px solid #10B981', padding: '1rem 1.25rem', borderRadius: '8px', margin: '0 0 1.25rem', color: '#166534', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>

                    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#0F172A' }}>Breakdown of Guidance Provided:</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.92rem', lineHeight: '1.6' }}>
                        {item.videoOutline.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveVideoModal(null);
                        const el = document.getElementById('booking-enquiry-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={styles.ctaPrimary}
                      style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                    >
                      Discuss Your Own Venture with Avinash &rarr;
                    </button>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </main>
  );
}
