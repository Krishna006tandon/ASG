import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import SeminarRegistration from '@/models/SeminarRegistration';
import Seminar from '@/models/Seminar';
import Coupon from '@/models/Coupon';
import { sendEmail } from '@/lib/mailer';
import { seminarTicketTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      seminarId, 
      userId, 
      attendees, 
      quantity = 1, 
      amount,
      couponApplied,
      discountAmount
    } = await req.json();

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const secret = (process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere').trim();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify Seminar Capacity
    const seminar = await Seminar.findById(seminarId);
    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    if (seminar.seatsBooked + quantity > seminar.seatsTotal) {
      return NextResponse.json({ error: "Not enough seats remaining. Please contact support for a refund." }, { status: 400 });
    }

    // Loop and generate tickets
    const registrations = [];
    const perTicketAmount = Math.round((amount / 100) / (attendees.length || 1));

    for (const attendee of attendees) {
      // Generate a VIP Ticket Number
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const ticketNumber = `SEM-${randomPart}`;

      const reg = new SeminarRegistration({
        userId,
        seminarId,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        amountPaid: perTicketAmount,
        couponApplied: couponApplied || null,
        discountAmount: Number(discountAmount) || 0,
        paymentStatus: 'Paid',
        ticketNumber: ticketNumber,
        registrationData: {
          name: attendee.name,
          email: attendee.email,
          whatsapp: attendee.whatsapp,
          profession: attendee.profession
        }
      });
      
      await reg.save();
      registrations.push(reg);

      // Send User Ticket Email
      if (attendee.email) {
        await sendEmail({
          to: attendee.email,
          subject: `Your Ticket for ${seminar.title} - ${ticketNumber}`,
          html: seminarTicketTemplate(
            attendee.name, 
            seminar.title, 
            ticketNumber, 
            seminar.date, 
            seminar.location
          )
        });
      }
    }

    // Update Booked Seats count
    await Seminar.findByIdAndUpdate(seminarId, { $inc: { seatsBooked: quantity } });

    // Increment coupon usedCount if coupon applied
    if (couponApplied) {
      await Coupon.findOneAndUpdate(
        { code: String(couponApplied).toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // Send Admin Notification
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Seminar:</strong> ${seminar.title}</p>
        <p><strong>Tickets Booked:</strong> ${quantity}</p>
        <p><strong>Total Amount:</strong> ₹${amount / 100}</p>
        <p><strong>Coupon:</strong> ${couponApplied || 'None'}</p>
        <p><strong>Attendees:</strong> ${attendees.map(a => a.name + ' (' + a.email + ')').join(', ')}</p>
      `;
      await sendEmail({
        to: adminEmail,
        subject: `New Seminar Booking (${quantity} tickets)`,
        html: adminNotificationTemplate('New Seminar Booking', detailsHtml)
      });
    }

    return NextResponse.json({ 
      message: "Payment verified successfully", 
      registrations 
    }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Seminar Verify Error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
