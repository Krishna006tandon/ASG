export const STATIC_REVIEWS = [
  {
    _id: 'rev-amazon-neethu',
    userName: 'Neethu',
    userEmail: 'neethu@amazon.in',
    source: 'Amazon Verified Purchase',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '16 Dec 2014',
    comment: 'Small & Beautiful, Come on, BUY IT, READ IT, and You Can Do it!\n\nI just loved this book. I just finished the whole book, the day I bought it. This book has more potential to always keep you awake with its simple examples and exercises. The book is primarily meant for students, however it applies to each and everybody. The author is primarily focussed on getting good scores in exam, however it applies to all life exams!!\n\nOne small book with answers of all the major problem of us. Small, simple yet captivating enough. He has put forward the music method, which is equally interesting and useful. The principles/ methods put forwarded by this is easily adaptable to daily life. You will be on your winning path when you complete this book. Great delivery from Amazon. All the best and Happy reading ….',
    verified: true
  },
  {
    _id: 'rev-bg-aishwarya',
    userName: 'Aishwarya S',
    userEmail: 'aishwarya@bookganga.com',
    source: 'BookGanga',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '08 Aug 2013',
    comment: 'great book.. it is meant for students, teachers and parents. it tells us how our inner sense of accomplishment helps us more than any amount of external pressure. i would recommend this book to all.',
    verified: true
  },
  {
    _id: 'rev-bg-swapnil',
    userName: 'Swapnil Kubde',
    userEmail: 'swapnil@bookganga.com',
    source: 'BookGanga',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '06 Jul 2013',
    comment: 'Excellent BOOK!!!!! It is very helpful...and very easy learning tips..',
    verified: true
  },
  {
    _id: 'rev-bg-rahul',
    userName: 'rahul',
    userEmail: 'rahul@bookganga.com',
    source: 'BookGanga',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '22 Apr 2013',
    comment: 'frankly speaking it can change vivew of thinking because its not only for student (education) life ;it also for in real life lots thanks to mr avinash for changing my life.',
    verified: true
  },
  {
    _id: 'rev-bg-jashobanta',
    userName: 'jashobanta',
    userEmail: 'jashobanta@bookganga.com',
    source: 'BookGanga',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '22 Apr 2013',
    comment: 'Very good book for beginners................',
    verified: true
  },
  {
    _id: 'rev-bg-kalyani',
    userName: 'Kalyani Nimkar',
    userEmail: 'kalyani@bookganga.com',
    source: 'BookGanga',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '17 Apr 2013',
    comment: 'Really a good job.',
    verified: true
  },
  {
    _id: 'rev-bg-ron',
    userName: 'Ron',
    userEmail: 'ron@bookganga.com',
    source: 'BookGanga',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '14 Apr 2013',
    comment: 'Nice book',
    verified: true
  },
  {
    _id: 'rev-bg-ashvin',
    userName: 'Ashvin Khasale',
    userEmail: 'ashvin@bookganga.com',
    source: 'BookGanga',
    itemType: 'book',
    itemTitle: 'Come on... You can do it!',
    rating: 5,
    date: '14 Apr 2013',
    comment: 'Excellent Book for encouraging I ever read!',
    verified: true
  },
  {
    _id: 'rev-ws-rajesh',
    userName: 'Rajesh Kulkarni',
    userEmail: 'rajesh.k@workshop.com',
    source: 'Workshop Attendee',
    itemType: 'webinar',
    itemTitle: 'Career Strategy & Fear Elimination Workshop',
    rating: 5,
    date: '15 Feb 2026',
    comment: 'Avinash sir has a unique ability to break down complex career dilemmas into clear, actionable steps. The interactive session gave me total clarity on my professional roadmap.',
    verified: true
  },
  {
    _id: 'rev-sem-priya',
    userName: 'Priya Mehta',
    userEmail: 'priya.m@seminar.com',
    source: 'Seminar VIP Attendee',
    itemType: 'seminar',
    itemTitle: 'Youth Empowerment & Leadership Seminar',
    rating: 5,
    date: '01 Mar 2026',
    comment: 'Attending the in-person seminar was an electrifying experience. The energy, real-world case studies, and practical exercises completely shifted my mindset towards entrepreneurship.',
    verified: true
  },
  {
    _id: 'rev-plat-amitabh',
    userName: 'Amitabh Sharma',
    userEmail: 'amitabh@consulting.com',
    source: 'Executive Mentorship Client',
    itemType: 'platform',
    itemTitle: 'Startup & Strategy Mentorship',
    rating: 5,
    date: '10 Jan 2026',
    comment: 'Avinash\'s 25+ years of global engineering and corporate leadership reflect in every piece of advice. His mentorship saved our startup months of trial and error.',
    verified: true
  }
];

export function getStaticReviews(itemType = null) {
  if (!itemType || itemType === 'all') return STATIC_REVIEWS;
  return STATIC_REVIEWS.filter(r => r.itemType === itemType);
}

export function getStaticReviewStats(itemType = null) {
  const list = getStaticReviews(itemType);
  const totalReviews = list.length;
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  list.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
    sum += r.rating;
  });

  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 5.0;

  return {
    totalReviews,
    averageRating,
    ratingBreakdown
  };
}
