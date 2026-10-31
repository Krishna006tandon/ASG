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
    <p>You can read and download your purchased e-books directly from your Dashboard:</p>
    <div style="margin: 20px 0;">
      <a href="https://avinashsgore.com/dashboard?tab=orders" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4F46E5; text-decoration: none; border-radius: 5px; font-weight: bold;">View Purchased Books</a>
    </div>
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

export const welcomeUserTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
    <div style="border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 style="color: #111827; margin: 0; font-size: 22px;">Welcome to Avinash S. Gore Platform! 🎉</h2>
      <p style="color: #2563EB; font-weight: 600; margin: 4px 0 0;">Exam, Career &amp; Start-up Guidance Ecosystem</p>
    </div>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your account has been created successfully. You now have full access to:</p>
    <ul>
      <li><strong>E-Book Store:</strong> Read and download motivational and self-development books.</li>
      <li><strong>Career Guidance:</strong> Take the Swadharma Career Assessment test.</li>
      <li><strong>Live Workshops &amp; Seminars:</strong> Browse upcoming events, webinars, and book seats.</li>
      <li><strong>1-on-1 Mentorship:</strong> Direct guidance with Avinash S. Gore.</li>
    </ul>
    <div style="margin: 20px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com'}/dashboard" style="display: inline-block; padding: 10px 22px; color: #fff; background-color: #2563EB; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Go to Your Dashboard &rarr;
      </a>
    </div>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Avinash S. Gore &amp; Team</strong></p>
  </div>
`;

export const careerAssessmentAccessTemplate = (name, startUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
    <div style="border-bottom: 2px solid #4F46E5; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 style="color: #111827; margin: 0; font-size: 22px;">Your Career Nature Assessment is Ready! 🎯</h2>
      <p style="color: #4F46E5; font-weight: 600; margin: 4px 0 0;">Swadharma (स्वधर्म) Career Archetype Diagnostic</p>
    </div>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for purchasing the <strong>Career Nature Assessment</strong>. Your test access has been unlocked.</p>
    <div style="background: #EEF2FF; border-left: 4px solid #4F46E5; padding: 14px 16px; margin: 18px 0; border-radius: 4px;">
      <h4 style="margin: 0 0 6px; color: #312E81; font-size: 15px;">Tips for Best Results:</h4>
      <ul style="margin: 0; padding-left: 18px; color: #3730A3; font-size: 13.5px; line-height: 1.5;">
        <li>Take 15-20 minutes in a quiet environment.</li>
        <li>Answer honestly based on what you naturally love doing, not what seems prestigious.</li>
        <li>There are no right or wrong answers.</li>
      </ul>
    </div>
    <div style="margin: 24px 0; text-align: center;">
      <a href="${startUrl}" style="display: inline-block; padding: 12px 28px; color: #fff; background-color: #4F46E5; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
        Start Assessment Now &rarr;
      </a>
    </div>
    <p style="color: #6B7280; font-size: 13px;">If you ever close your browser, you can resume anytime using the link above or from your Dashboard.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Avinash S. Gore Career Mentoring Team</strong></p>
  </div>
`;

export const careerAssessmentResultTemplate = (name, topArchetypesText, synergyHeadline, reportUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
    <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 style="color: #111827; margin: 0; font-size: 22px;">Your Career Nature Assessment Results! 📊</h2>
      <p style="color: #059669; font-weight: 600; margin: 4px 0 0;">Avinash S. Gore Mentoring Diagnostics</p>
    </div>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Congratulations on completing the 30-Question Swadharma Career Nature Assessment. Here is a summary of your dominant cognitive archetype profile:</p>
    <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 16px; margin: 18px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 8px; color: #065F46; font-size: 16px;">Top Dominant Archetypes:</h4>
      <p style="margin: 0 0 10px; font-weight: bold; color: #166534; font-size: 15px;">${topArchetypesText}</p>
      ${synergyHeadline ? `<p style="margin: 0; font-size: 13.5px; color: #047857;"><strong>Core Insight:</strong> ${synergyHeadline}</p>` : ''}
    </div>
    <div style="margin: 24px 0; text-align: center;">
      <a href="${reportUrl}" style="display: inline-block; padding: 12px 28px; color: #fff; background-color: #059669; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
        View Full Diagnostic Report &rarr;
      </a>
    </div>
    <p>Use these findings to align your academic choices, career paths, and daily work with your natural inherent design.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Avinash S. Gore</strong><br/><span style="font-size: 13px; color: #6b7280;">Author &amp; Career Mentor</span></p>
  </div>
`;

export const workshopFeedbackAckTemplate = (studentName, collegeName, workshopTitle) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
    <div style="border-bottom: 2px solid #0284C7; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 style="color: #111827; margin: 0; font-size: 22px;">Thank You for Attending Our Workshop! 🎓</h2>
      <p style="color: #0284C7; font-weight: 600; margin: 4px 0 0;">Avinash S. Gore Youth &amp; Student Mentoring</p>
    </div>
    <p>Dear <strong>${studentName}</strong>,</p>
    <p>Thank you for participating in the <strong>${workshopTitle || 'Student Development Workshop'}</strong> at <strong>${collegeName}</strong> and sharing your valuable feedback.</p>
    <p>Avinash S. Gore and our team are committed to helping students unlock their maximum potential through practical life skills, career clarity, and mindset training.</p>
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px 16px; margin: 18px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 6px; color: #0F172A; font-size: 14px;">Next Steps for Your Growth:</h4>
      <p style="margin: 0; font-size: 13.5px; color: #475569; line-height: 1.5;">
        Explore our e-books like <em>&ldquo;Come On You Can Do It&rdquo;</em>, take the Career Nature Assessment, or book 1-on-1 guidance anytime on our official website.
      </p>
    </div>
    <div style="margin: 20px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com'}" style="display: inline-block; padding: 10px 22px; color: #fff; background-color: #0284C7; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Visit Platform &rarr;
      </a>
    </div>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Avinash S. Gore &amp; Team</strong></p>
  </div>
`;
