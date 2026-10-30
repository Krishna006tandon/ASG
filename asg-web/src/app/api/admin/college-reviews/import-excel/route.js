import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CollegeReview from '@/models/CollegeReview';

export async function POST(req) {
  try {
    const { reviews } = await req.json();

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: 'No reviews found in the uploaded file.' }, { status: 400 });
    }

    await connectToDatabase();

    const validDocuments = [];
    const skippedRows = [];

    reviews.forEach((row, index) => {
      // Find field names flexibly (case-insensitive, handling various column headers)
      const getField = (keys) => {
        for (const k of keys) {
          for (const rowKey of Object.keys(row)) {
            if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
              return row[rowKey];
            }
          }
        }
        return '';
      };

      const studentName = String(getField(['Student Name', 'Name', 'Student', 'Full Name', 'Candidate'])).trim();
      const collegeName = String(getField(['College Name', 'College', 'Institute', 'University', 'Campus'])).trim();
      const workshopTitle = String(getField(['Workshop Title', 'Workshop', 'Topic', 'Session Title', 'Event'])).trim() || 'College Empowerment Workshop';
      const comment = String(getField(['Review', 'Comment', 'Feedback', 'Review / Comment', 'Message', 'Student Feedback'])).trim();
      const rawRating = getField(['Rating', 'Stars', 'Score']);
      const department = String(getField(['Department', 'Branch', 'Dept', 'Stream'])).trim();
      const year = String(getField(['Year', 'Semester', 'Class'])).trim();
      const keyTakeaway = String(getField(['Key Takeaway', 'Takeaway', 'Learnings', 'Best Part'])).trim();
      const rawDate = getField(['Date', 'Workshop Date', 'Year/Date']);

      if (!studentName || !comment) {
        skippedRows.push({ row: index + 1, reason: 'Missing Student Name or Comment' });
        return;
      }

      let parsedRating = Number(rawRating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        parsedRating = 5; // Default to 5 if not specified or out of bounds
      }

      let parsedDate = new Date();
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) parsedDate = d;
      }

      validDocuments.push({
        collegeName: collegeName || 'College Workshop',
        workshopTitle,
        studentName,
        studentEmail: '',
        department,
        year,
        rating: parsedRating,
        comment,
        keyTakeaway,
        source: 'excel_import',
        status: 'approved',
        isFeatured: false,
        workshopDate: parsedDate
      });
    });

    if (validDocuments.length === 0) {
      return NextResponse.json({ 
        error: 'No valid rows found. Please ensure your Excel/CSV has columns like "Student Name", "College Name", "Rating", and "Review".' 
      }, { status: 400 });
    }

    const inserted = await CollegeReview.insertMany(validDocuments);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${inserted.length} reviews from Excel!`,
      importedCount: inserted.length,
      skippedCount: skippedRows.length,
      skippedRows
    }, { status: 201 });

  } catch (error) {
    console.error('Import Excel Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import reviews' }, { status: 500 });
  }
}
