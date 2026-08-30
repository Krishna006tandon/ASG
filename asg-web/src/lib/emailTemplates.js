export const forgotPasswordTemplate = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the button below to proceed:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`;

export const consultationBookingTemplate = (name, date, time) => `
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

export const contactAutoReplyTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Thank You for Reaching Out!</h2>
    <p>Hi ${name},</p>
    <p>We have received your message and will get back to you as soon as possible.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>ASG Team</strong></p>
  </div>
`;

export const adminNotificationTemplate = (subject, detailsHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #333;">New Admin Alert: ${subject}</h2>
    <div style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
      ${detailsHtml}
    </div>
  </div>
`;

export const orderConfirmationTemplate = (name, totalAmount, orderId) => `
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

export const seminarTicketTemplate = (name, ticketNumber) => `
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

export const webinarRegistrationTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Webinar Registration Confirmed</h2>
    <p>Hi ${name},</p>
    <p>Your registration for the webinar is confirmed. We will share the joining link with you soon.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>ASG Team</strong></p>
  </div>
`;

export const physicalUpgradeTemplate = (name, bookTitle) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Physical Upgrade Confirmed</h2>
    <p>Hi ${name},</p>
    <p>Your physical copy upgrade for <strong>${bookTitle}</strong> has been confirmed. We will notify you once it's dispatched.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>ASG Team</strong></p>
  </div>
`;
