import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import { sendEmail } from '@/lib/mailer';
import { adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { 
      name, 
      email, 
      phone, 
      currentStage, 
      businessIdea, 
      challenges = [], 
      message, 
      sessionMode = 'Virtual (Google Meet/Zoom)',
      preferredDate
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const compiledMessage = `
[START-UP GUIDANCE APPOINTMENT ENQUIRY]
Current Status / Stage: ${currentStage || 'Not specified'}
Preferred Mode: ${sessionMode}
Selected Discussion Areas: ${Array.isArray(challenges) && challenges.length > 0 ? challenges.join(', ') : 'General Discussion'}

Business Idea / Venture Overview:
${businessIdea || 'N/A'}

Specific Challenge / Goal for Session:
${message || 'N/A'}

Philosophy Acknowledged: "Pay If You Get Benefitted"
`.trim();

    // Create Consultation record in DB
    const newBooking = await Consultation.create({
      customerDetails: { 
        name, 
        email, 
        phone: phone || '' 
      },
      date: preferredDate ? new Date(preferredDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Default 2 days ahead
      time: 'Flexible / By Mutual Agreement',
      message: compiledMessage,
      status: 'Pending',
      paymentStatus: 'Unpaid'
    });

    // 1. Send Acknowledgement to User
    const userConfirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #111827; margin: 0; font-size: 22px;">Start-up Guidance Enquiry Received</h2>
          <p style="color: #059669; font-weight: 600; margin: 4px 0 0;">Avinash S. Gore Personal Mentoring</p>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for reaching out for <strong>Personal Start-up Guidance</strong>. I have received your enquiry and details regarding your entrepreneurial journey.</p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 14px 16px; margin: 18px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 6px; color: #065f46; font-size: 15px;">Our "Pay If You Get Benefitted" Philosophy</h4>
          <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #047857;">
            Personal guidance is my passion. If you genuinely feel that our conversation has made a positive difference to your thinking, decisions, or business, you pay for the value received. If you do not feel benefited, I do not expect you to pay.
          </p>
        </div>

        <p><strong>Next Steps:</strong></p>
        <p style="color: #4b5563; line-height: 1.6;">
          I or my team will review your business background and reach out via WhatsApp/email at <strong>${email}</strong> ${phone ? `(${phone})` : ''} to coordinate an agreeable date, time, and session link.
        </p>

        <p style="margin-top: 24px; color: #111827; font-weight: 600;">
          Best Regards,<br/>
          <span style="font-size: 16px;">Avinash S. Gore</span><br/>
          <span style="font-size: 13px; color: #6b7280; font-weight: normal;">Entrepreneur, Mentor &amp; MD, Perpetual Solutions</span>
        </p>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Start-up Guidance Session Request Received | Avinash S. Gore',
        html: userConfirmationHtml
      });
    } catch (mailErr) {
      console.error('Failed to send user confirmation email:', mailErr);
    }

    // 2. Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Applicant Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Current Stage:</strong> ${currentStage || 'N/A'}</p>
        <p><strong>Preferred Mode:</strong> ${sessionMode}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate || 'Flexible'}</p>
        <p><strong>Discussion Pillars:</strong> ${Array.isArray(challenges) ? challenges.join(', ') : 'N/A'}</p>
        <p><strong>Business Idea / Overview:</strong></p>
        <blockquote style="background:#f3f4f6; padding: 10px; border-left: 3px solid #059669; margin: 0;">${businessIdea || 'N/A'}</blockquote>
        <p><strong>Specific Challenge / Goal:</strong></p>
        <blockquote style="background:#f3f4f6; padding: 10px; border-left: 3px solid #3b82f6; margin: 0;">${message || 'N/A'}</blockquote>
      `;

      try {
        await sendEmail({
          to: adminEmail,
          subject: `🚀 New Start-up Guidance Booking Request: ${name}`,
          html: adminNotificationTemplate('New Start-up Guidance Booking Enquiry', detailsHtml)
        });
      } catch (adminMailErr) {
        console.error('Failed to send admin notification email:', adminMailErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Your Start-up Guidance appointment enquiry has been submitted successfully.',
      bookingId: newBooking._id 
    }, { status: 201 });

  } catch (error) {
    console.error('Startup Guidance API Error:', error);
    return NextResponse.json({ error: 'Failed to process enquiry. Please try again.' }, { status: 500 });
  }
}
