const nodemailer = require('nodemailer');

// --- Mock Templates ---
const forgotPasswordTemplate = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the button below to proceed:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`;

const consultationBookingTemplate = (name, date, time) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Consultation Booked Successfully!</h2>
    <p>Hi ${name},</p>
    <p>Your consultation has been received and is currently Pending. We will review your request and reach out shortly.</p>
    <ul>
      <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
      <li><strong>Time:</strong> ${time}</li>
    </ul>
    <br/>
    <p>Best Regards,</p>
    <p><strong>ASG Team</strong></p>
  </div>
`;

const contactAutoReplyTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Thank You for Reaching Out!</h2>
    <p>Hi ${name},</p>
    <p>We have received your message and will get back to you as soon as possible.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>ASG Team</strong></p>
  </div>
`;

const adminNotificationTemplate = (subject, detailsHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #333;">New Admin Alert: ${subject}</h2>
    <div style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
      ${detailsHtml}
    </div>
  </div>
`;

const orderConfirmationTemplate = (name, totalAmount, orderId) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Order Confirmed!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for your purchase. Your order has been placed successfully.</p>
    <ul>
      <li><strong>Order ID:</strong> ${orderId}</li>
      <li><strong>Total Amount:</strong> ₹${totalAmount}</li>
    </ul>
    <br/>
    <p>Best Regards,</p>
    <p><strong>ASG Team</strong></p>
  </div>
`;

const seminarTicketTemplate = (name, ticketNumber) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Your Seminar Ticket</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering for the seminar. Here is your ticket information:</p>
    <div style="font-size: 24px; font-weight: bold; padding: 15px; text-align: center; background: #eee; margin: 20px 0;">
      ${ticketNumber}
    </div>
    <p>Please present this ticket number at the entry.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>ASG Team</strong></p>
  </div>
`;

async function testAllMails() {
  console.log('Generating Ethereal test account... Please wait.\\n');
  
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const emailsToTest = [
      {
        subject: '2. Forgot Password Email',
        html: forgotPasswordTemplate('http://localhost:3000/reset-password?token=dummy123')
      },
      {
        subject: '3. Consultation Booking Email',
        html: consultationBookingTemplate('Krish', new Date(), '14:00 PM')
      },
      {
        subject: '4. Contact Auto-Reply',
        html: contactAutoReplyTemplate('Krish')
      },
      {
        subject: '5. Admin Alert (New Order)',
        html: adminNotificationTemplate('New Store Order', '<p>Order <b>#664abcd123</b> received for ₹450.</p>')
      },
      {
        subject: '6. Store Order Confirmed',
        html: orderConfirmationTemplate('Krish', 450, '664abcd123456789')
      },
      {
        subject: '7. Seminar Ticket',
        html: seminarTicketTemplate('Krish', 'SEM-123456')
      }
    ];

    for (const email of emailsToTest) {
      process.stdout.write('Sending "' + email.subject + '"... ');
      const info = await transporter.sendMail({
        from: '"ASG System" <test@asg.com>',
        to: 'user@example.com',
        subject: email.subject,
        html: email.html,
      });
      console.log('Done! Preview: ' + nodemailer.getTestMessageUrl(info));
    }

    console.log('\\nAll emails tested successfully! Click the links above to preview them.');

  } catch (err) {
    console.error('Failed to send test emails:', err);
  }
}

testAllMails();
