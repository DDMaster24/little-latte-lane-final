import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, bookingReference } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      );
    }

    // Get booking details
    const supabase = getSupabaseAdmin();
    const { data: booking, error } = await supabase
      .from('hall_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Format date and time for display
    const eventDate = new Date(booking.event_date).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = `${booking.event_start_time} - ${booking.event_end_time}`;

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Roberts Hall Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #00ffff, #ff00ff); padding: 30px 20px; text-align: center; }
          .header h1 { color: #000; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 30px 20px; }
          .success-badge { background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .booking-ref { font-size: 24px; font-weight: bold; color: #00ffff; text-align: center; margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 8px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #00ffff; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #00ffff; padding-bottom: 5px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; }
          .payment-summary { background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #00ffff; margin: 20px 0; }
          .next-steps { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .next-steps h3 { color: #856404; margin-top: 0; }
          .next-steps ul { margin: 10px 0; padding-left: 20px; }
          .next-steps li { color: #856404; margin: 8px 0; }
          .important-note { background: #fee; padding: 15px; border-radius: 8px; border-left: 4px solid #f00; margin: 20px 0; }
          .important-note h3 { color: #c00; margin-top: 0; }
          .footer { background: #333; color: #fff; padding: 20px; text-align: center; font-size: 14px; }
          .footer a { color: #00ffff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏛️ Roberts Hall Booking Confirmation</h1>
          </div>

          <div class="content">
            <div class="success-badge">
              <h2 style="margin: 0; font-size: 20px;">✅ Payment Successful - Booking Confirmed!</h2>
            </div>

            <p>Dear ${booking.applicant_name} ${booking.applicant_surname},</p>

            <p>Thank you for booking Roberts Hall! Your payment has been processed successfully and your booking is now confirmed.</p>

            <div class="booking-ref">
              Booking Reference: ${booking.booking_reference}
            </div>

            <div class="section">
              <h2>📅 Event Details</h2>
              <div class="detail-row">
                <span class="detail-label">Event Type:</span>
                <span class="detail-value">${booking.event_type}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event Date:</span>
                <span class="detail-value">${eventDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event Time:</span>
                <span class="detail-value">${eventTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Guests:</span>
                <span class="detail-value">${booking.total_guests} guests</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Vehicles:</span>
                <span class="detail-value">${booking.number_of_vehicles} vehicles</span>
              </div>
            </div>

            <div class="payment-summary">
              <h3 style="margin-top: 0; color: #00ffff;">💰 Payment Summary</h3>
              <div class="detail-row">
                <span class="detail-label">Hall Rental Fee:</span>
                <span class="detail-value">R ${booking.rental_fee.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Security Deposit:</span>
                <span class="detail-value">R ${booking.deposit_amount.toFixed(2)}</span>
              </div>
              <div class="detail-row" style="border-bottom: none; font-size: 18px; font-weight: bold; margin-top: 10px;">
                <span class="detail-label">Total Paid:</span>
                <span class="detail-value" style="color: #00ffff;">R ${booking.total_amount.toFixed(2)}</span>
              </div>
              <p style="font-size: 13px; color: #666; margin: 10px 0 0 0;">
                * The R${booking.deposit_amount.toFixed(2)} deposit will be refunded within 7 working days after your event, provided there are no damages.
              </p>
            </div>

            <div class="next-steps">
              <h3>📋 What Happens Next?</h3>
              <ul>
                <li><strong>Office Review:</strong> Our office will review your booking details and confirm within 24-48 hours.</li>
                <li><strong>Access Code:</strong> You will receive the hall access code 24 hours before your event date.</li>
                <li><strong>Preparation:</strong> Please review all terms and conditions before your event.</li>
                <li><strong>Inspection:</strong> A post-event inspection will be conducted to process your deposit refund.</li>
              </ul>
            </div>

            <div class="important-note">
              <h3>⚠️ Important Reminders</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="color: #c00; margin: 8px 0;">Functions must END by 23:00 (11:00 PM) - NO EXCEPTIONS</li>
                <li style="color: #c00; margin: 8px 0;">Maximum 50 guests and 30 vehicles permitted</li>
                <li style="color: #c00; margin: 8px 0;">Speed limit within Roberts Estate is 30 km/h</li>
                <li style="color: #c00; margin: 8px 0;">Leave the hall clean and tidy for deposit refund</li>
                <li style="color: #c00; margin: 8px 0;">All guests must respect neighboring residents</li>
              </ul>
            </div>

            <div class="section">
              <h2>📞 Need Help?</h2>
              <p>If you have any questions or need to make changes to your booking, please contact us:</p>
              <p>
                <strong>Email:</strong> admin@littlelattelane.co.za<br>
                <strong>Booking Reference:</strong> ${booking.booking_reference}
              </p>
            </div>

            <p style="margin-top: 30px;">We look forward to hosting your event at Roberts Hall!</p>

            <p style="margin-top: 20px;">
              Best regards,<br>
              <strong>Little Latte Lane Team</strong>
            </p>
          </div>

          <div class="footer">
            <p>This confirmation was sent to ${booking.applicant_email}</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/account">View your booking online</a></p>
            <p>&copy; ${new Date().getFullYear()} Little Latte Lane - Where every sip tastes like home</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Roberts Hall Booking Confirmation

Payment Successful - Booking Confirmed!

Dear ${booking.applicant_name} ${booking.applicant_surname},

Thank you for booking Roberts Hall! Your payment has been processed successfully.

Booking Reference: ${booking.booking_reference}

EVENT DETAILS:
- Event Type: ${booking.event_type}
- Event Date: ${eventDate}
- Event Time: ${eventTime}
- Number of Guests: ${booking.total_guests}
- Number of Vehicles: ${booking.number_of_vehicles}

PAYMENT SUMMARY:
- Hall Rental Fee: R${booking.rental_fee.toFixed(2)}
- Security Deposit: R${booking.deposit_amount.toFixed(2)}
- Total Paid: R${booking.total_amount.toFixed(2)}

* The R${booking.deposit_amount.toFixed(2)} deposit will be refunded within 7 working days after your event.

WHAT HAPPENS NEXT:
1. Office Review: We will review your booking and confirm within 24-48 hours.
2. Access Code: You'll receive the hall access code 24 hours before your event.
3. Inspection: A post-event inspection will be conducted for deposit refund.

IMPORTANT REMINDERS:
- Functions must END by 23:00 (11:00 PM) - NO EXCEPTIONS
- Maximum 50 guests and 30 vehicles permitted
- Speed limit within Roberts Estate is 30 km/h
- Leave the hall clean and tidy for deposit refund

Need help? Contact us at admin@littlelattelane.co.za
Reference: ${booking.booking_reference}

Best regards,
Little Latte Lane Team
    `;

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send to customer
        await resend.emails.send({
          from: 'Little Latte Lane <bookings@littlelattelane.co.za>',
          to: [booking.applicant_email],
          subject: `✅ Roberts Hall Booking Confirmed - ${booking.booking_reference}`,
          html: emailHtml,
          text: emailText,
        });

        // Send copy to admin
        await resend.emails.send({
          from: 'Little Latte Lane <bookings@littlelattelane.co.za>',
          to: ['admin@littlelattelane.co.za'],
          subject: `🏛️ NEW HALL BOOKING: ${booking.booking_reference} - ${booking.applicant_name}`,
          html: emailHtml,
          text: emailText,
        });

        console.log('Hall booking confirmation emails sent successfully');
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.warn('RESEND_API_KEY not configured - confirmation email not sent');
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation sent',
    });

  } catch (error) {
    console.error('Confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation' },
      { status: 500 }
    );
  }
}
