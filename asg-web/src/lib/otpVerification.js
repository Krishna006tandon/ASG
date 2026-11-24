import connectToDatabase from '@/lib/mongodb';
import EmailOtp from '@/models/EmailOtp';

/**
 * Checks whether an email has been verified via OTP within the last 30 minutes.
 * @param {string} email - The customer's email address
 * @param {string} [purpose] - Optional purpose filter ('consultation', 'product_purchase', 'booking')
 * @returns {Promise<{ verified: boolean, error?: string }>}
 */
export async function verifyEmailOtpStatus(email, purpose = null) {
  if (!email || typeof email !== 'string') {
    return { verified: false, error: 'Valid email is required for verification.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  await connectToDatabase();

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const query = {
    email: cleanEmail,
    verified: true,
    verifiedAt: { $gte: thirtyMinutesAgo }
  };

  if (purpose && purpose !== 'general') {
    query.$or = [{ purpose }, { purpose: 'general' }, { purpose: 'booking' }];
  }

  const record = await EmailOtp.findOne(query).sort({ verifiedAt: -1 });

  if (!record) {
    return {
      verified: false,
      error: 'Email verification required. Please verify your email with the OTP sent to your inbox before completing this booking or purchase.'
    };
  }

  return { verified: true, record };
}
