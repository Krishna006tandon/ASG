import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CollegeReview from '@/models/CollegeReview';

export async function POST(req) {
  try {
    const { reviews, defaultWorkshopTitle } = await req.json();

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: 'No data rows found in the uploaded file.' }, { status: 400 });
    }

    await connectToDatabase();

    const validDocuments = [];
    const skippedRows = [];

    reviews.forEach((row, index) => {
      // Helper to find column by multiple candidate strings or regex
      const getField = (candidates) => {
        for (const candidate of candidates) {
          for (const key of Object.keys(row)) {
            const normalizedKey = key.trim().toLowerCase();
            const normalizedCand = candidate.toLowerCase();
            if (normalizedKey === normalizedCand || normalizedKey.includes(normalizedCand)) {
              if (row[key] !== undefined && row[key] !== null) {
                return String(row[key]).trim();
              }
            }
          }
        }
        return '';
      };

      // 1. Student Name
      const studentName = getField(['Name', 'Student Name', 'Full Name', 'Candidate']);
      if (!studentName) {
        skippedRows.push({ row: index + 1, reason: 'Missing Name' });
        return;
      }

      // 2. College / Institute Name
      let collegeName = getField([
        'College/ Institute/ Organization',
        'College Name',
        'College',
        'Institute',
        'Organization',
        'University'
      ]);
      if (!collegeName) {
        collegeName = 'Priyadarshini College of Engineering'; // Sensible fallback
      }

      // 3. Contact Info
      const phone = getField(['Mobile No.', 'Mobile', 'Phone', 'Contact']);
      const studentEmail = getField(['Email ID', 'Email', 'Mail']);
      const dob = getField(['D.O.B.', 'DOB', 'Date of Birth']);
      const department = getField([
        'Currently Work/ Job Role/ Area of Study',
        'Area of Study',
        'Department',
        'Branch'
      ]);

      // 4. Ratings Extraction
      // Overall Rating
      let overallRatingRaw = getField(['Overall, how would you rate', 'Overall', 'Rating', 'Stars']);
      let contentRatingRaw = getField(['Training Content']);
      let deliveryRatingRaw = getField(['Presentation/ Delivery Style', 'Delivery Style']);
      let trainer1RatingRaw = getField(['Trainer 1']);
      let trainer2RatingRaw = getField(['Trainer 2']);

      const parseRatingNum = (val, fallback = 5) => {
        const num = Number(val);
        if (!isNaN(num) && num >= 1 && num <= 5) return num;
        return fallback;
      };

      const overallRating = parseRatingNum(overallRatingRaw, 5);
      const contentRating = parseRatingNum(contentRatingRaw, overallRating);
      const deliveryRating = parseRatingNum(deliveryRatingRaw, overallRating);
      const trainer1Rating = parseRatingNum(trainer1RatingRaw, overallRating);
      const trainer2Rating = parseRatingNum(trainer2RatingRaw, overallRating);

      // 5. Review & Feedback Comments
      const likedMost = getField(['What did you like most about the training?', 'liked most', 'Best Part']);
      const suggestions = getField(['What can we improve in future training programs?', 'can we improve', 'Improvement']);
      const otherComments = getField(['Any other comments/ suggestions?', 'other comments', 'Comments']);

      // Clean non-informative text like '.', '-', 'no', 'none', 'n'
      const isInformative = (text) => {
        if (!text) return false;
        const cleaned = text.trim().toLowerCase();
        if (cleaned.length < 2) return false;
        if (/^[\.\,\-\_\s]+$/.test(cleaned)) return false;
        if (['no', 'none', 'nope', 'na', 'n/a', 'nothing', 'not need', 'not sure', 'idk'].includes(cleaned)) return false;
        return true;
      };

      let finalComment = '';
      if (isInformative(likedMost)) {
        finalComment = likedMost;
        if (isInformative(otherComments) && otherComments.toLowerCase() !== likedMost.toLowerCase()) {
          finalComment += ` — ${otherComments}`;
        }
      } else if (isInformative(otherComments)) {
        finalComment = otherComments;
      } else {
        // Fallback friendly comment so the rating and lead can still be showcased
        finalComment = `Attended the workshop session at ${collegeName}. Rated ${overallRating}/5 stars.`;
      }

      // 6. Lead Interests (Crucial for Career Guidance, Books, and Counselling!)
      const bookInterest = getField(['purchasing the book', 'book']).toLowerCase();
      const careerTestInterest = getField(['career assessment test', 'career counselling']).toLowerCase();
      const counsellingInterest = getField(['One-to-One Guidance', 'Personal Counselling']).toLowerCase();
      const upcomingInterest = getField(['upcoming workshops']).toLowerCase();

      const leadInterests = {
        book: bookInterest.includes('yes'),
        careerTest: careerTestInterest.includes('yes'),
        counselling: counsellingInterest.includes('yes'),
        upcomingWorkshops: upcomingInterest.includes('yes')
      };

      // 7. Date
      const timestampRaw = getField(['Timestamp', 'Date']);
      let parsedDate = new Date();
      if (timestampRaw) {
        const d = new Date(timestampRaw);
        if (!isNaN(d.getTime())) parsedDate = d;
      }

      validDocuments.push({
        collegeName,
        workshopTitle: defaultWorkshopTitle || 'Empowerment & Diksharambha Workshop',
        studentName,
        studentEmail,
        phone,
        department,
        dob,
        rating: overallRating,
        ratingsBreakdown: {
          content: contentRating,
          delivery: deliveryRating,
          trainer1: trainer1Rating,
          trainer2: trainer2Rating,
          overall: overallRating
        },
        comment: finalComment,
        keyTakeaway: isInformative(likedMost) ? likedMost : '',
        improvementFeedback: isInformative(suggestions) ? suggestions : '',
        leadInterests,
        source: 'excel_import',
        status: 'approved',
        isFeatured: false,
        workshopDate: parsedDate
      });
    });

    if (validDocuments.length === 0) {
      return NextResponse.json({ 
        error: 'No valid student records found. Please check that the file has a "Name" column.' 
      }, { status: 400 });
    }

    const inserted = await CollegeReview.insertMany(validDocuments);

    // Count leads discovered in this import
    const careerLeadsCount = validDocuments.filter(d => d.leadInterests.careerTest).length;
    const bookLeadsCount = validDocuments.filter(d => d.leadInterests.book).length;
    const counsellingLeadsCount = validDocuments.filter(d => d.leadInterests.counselling).length;

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${inserted.length} workshop reviews!`,
      importedCount: inserted.length,
      skippedCount: skippedRows.length,
      leadStats: {
        careerLeadsCount,
        bookLeadsCount,
        counsellingLeadsCount
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Import Excel Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import reviews' }, { status: 500 });
  }
}
