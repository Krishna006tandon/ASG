import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { contactAutoReplyTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }

    // 1. Send Auto-reply to User
    await sendEmail({
      to: email,
      subject: 'Thank You for Contacting Us',
      html: contactAutoReplyTemplate(name)
    });

    // 2. Send Alert to Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;
      await sendEmail({
        to: adminEmail,
        subject: \`New Contact Form Submission: \${subject || 'General Inquiry'}\`,
        html: adminNotificationTemplate('New Contact Inquiry', detailsHtml)
      });
    }

    return NextResponse.json({ message: 'Your message has been sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
