import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail = body.to || process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;

    if (!targetEmail) {
      return NextResponse.json({ error: 'ADMIN_EMAIL or FROM_EMAIL is not configured in .env' }, { status: 400 });
    }

    const testHtml = `
      <p>This is an automated test email from your <strong>Avinash S. Gore Platform</strong>.</p>
      <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Not set'}</p>
      <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 'Not set'}</p>
      <p><strong>SMTP User:</strong> ${process.env.SMTP_USER || 'Not set'}</p>
      <p><strong>Admin Email:</strong> ${targetEmail}</p>
      <p><strong>Status:</strong> ✅ All systems operational. You will receive email notifications whenever a customer:</p>
      <ul>
        <li>Submits a Start-up Guidance Appointment Inquiry</li>
        <li>Buys a Book or places an Order in Store</li>
        <li>Registers for a Webinar</li>
        <li>Books Tickets for a Seminar</li>
        <li>Purchases or Completes a Career Assessment</li>
        <li>Requests a Physical Book Upgrade</li>
        <li>Submits a Contact Message or Review</li>
      </ul>
    `;

    const result = await sendEmail({
      to: targetEmail,
      subject: '✅ ASG Platform - SMTP Test Email Successful',
      html: adminNotificationTemplate('SMTP Test Email Verification', testHtml)
    });

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error, 
        targetEmail 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test email dispatched successfully to ${targetEmail}`,
      messageId: result.messageId
    }, { status: 200 });

  } catch (error) {
    console.error('Test Email API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send test email' }, { status: 500 });
  }
}
