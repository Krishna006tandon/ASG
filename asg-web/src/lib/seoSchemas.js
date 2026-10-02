const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com';

/**
 * Person Schema for Avinash Gore
 */
export function getPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Avinash Gore',
    alternateName: ['Avinash S. Gore', 'ASG'],
    url: SITE_URL,
    image: `${SITE_URL}/images/image5.jpg`,
    jobTitle: 'Managing Director, Author & Career Mentor',
    worksFor: {
      '@type': 'Organization',
      name: 'Perpetual Solutions',
      url: SITE_URL,
    },
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'Laxminarayan Institute of Technology (L.I.T.)',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'National Institute of Business Management (NIBM)',
      },
    ],
    knowsAbout: [
      'Process Safety Management',
      'HAZOP Methodologies',
      'Youth Empowerment',
      'Career Guidance',
      'Exam Stress Management',
      'Financial Literacy',
      'Startup Mentorship',
    ],
    description:
      'Author of "Come on... You can do it!", global engineering leader with 25+ years experience, youth mentor, and Managing Director at Perpetual Solutions.',
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Avinash Gore | Author, Career Mentor & Business Consultant',
    description:
      'Official platform of Avinash Gore: youth empowerment workshops, career mentoring, startup advisory, and authored books.',
    publisher: {
      '@id': `${SITE_URL}/#person`,
    },
    inLanguage: 'en-IN',
  };
}

/**
 * Book Schema
 */
export function getBookSchema(book = {}) {
  const title = book.title || 'Come on... You can do it!';
  const description =
    book.description ||
    'A transformative guide for students and professionals to overcome exam phobia, build self-confidence, and unlock their full potential using scientific techniques.';
  const image = book.coverImage
    ? (book.coverImage.startsWith('http') ? book.coverImage : `${SITE_URL}${book.coverImage}`)
    : `${SITE_URL}/images/image1.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `${SITE_URL}/ecommerce#${book._id || 'book-main'}`,
    name: title,
    author: {
      '@type': 'Person',
      name: 'Avinash Gore',
      url: SITE_URL,
    },
    inLanguage: 'en-IN',
    description,
    image,
    bookFormat: 'https://schema.org/EBook',
    offers: {
      '@type': 'Offer',
      price: book.ebookPrice ? String(book.ebookPrice) : '299',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/ecommerce`,
    },
  };
}

/**
 * Article Schema for Blog Posts
 */
export function getArticleSchema(post) {
  if (!post) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: 'Avinash Gore',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Avinash Gore',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/image5.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    inLanguage: 'en-IN',
  };
}

/**
 * Event Schema for Webinars / Seminars
 */
export function getEventSchema(event, type = 'Webinar') {
  if (!event) return null;
  const isOnline = type.toLowerCase() === 'webinar';
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: event.title,
    description: event.description,
    startDate: event.date ? new Date(event.date).toISOString() : undefined,
    endDate: event.date ? new Date(new Date(event.date).getTime() + (event.durationHours || 2) * 3600000).toISOString() : undefined,
    eventAttendanceMode: isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: isOnline
      ? {
          '@type': 'VirtualLocation',
          url: `${SITE_URL}/webinars`,
        }
      : {
          '@type': 'Place',
          name: event.location || 'Seminar Hall',
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.location || 'India',
            addressCountry: 'IN',
          },
        },
    organizer: {
      '@type': 'Person',
      name: 'Avinash Gore',
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: event.price !== undefined ? String(event.price) : '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/${isOnline ? 'webinars' : 'seminars'}`,
    },
  };
}
