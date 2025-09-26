import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingContactData {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  partySize: number;
  eventType: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: BookingContactData = await request.json();

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the preferred date for better readability
    const formattedDate = data.preferredDate 
      ? new Date(data.preferredDate).toLocaleDateString('en-ZA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Not specified';

    // Format event type for display
    const eventTypeMap: { [key: string]: string } = {
      'general': 'General Table Booking',
      'birthday': 'Birthday Party',
      'corporate': 'Corporate Event', 
      'wedding': 'Wedding Reception',
      'private': 'Private Dining',
      'other': 'Other Event'
    };

    const eventTypeDisplay = eventTypeMap[data.eventType] || data.eventType;

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Inquiry - Little Latte Lane</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00ffff, #ff00ff); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: #000; margin: 0; font-size: 24px; font-weight: bold; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .field label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
          .field value { background: #fff; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd; display: block; }
          .message-box { background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 14px; }
          .urgent { color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ New Booking Inquiry</h1>
          </div>
          <div class="content">
            <p><strong>You have received a new booking inquiry through your website!</strong></p>
            
            <div class="field">
              <label>👤 Customer Name:</label>
              <span class="value">${data.name}</span>
            </div>
            
            <div class="field">
              <label>📧 Email Address:</label>
              <span class="value">${data.email}</span>
            </div>
            
            ${data.phone ? `
            <div class="field">
              <label>📞 Phone Number:</label>
              <span class="value">${data.phone}</span>
            </div>
            ` : ''}
            
            <div class="field">
              <label>📅 Preferred Date:</label>
              <span class="value">${formattedDate}</span>
            </div>
            
            <div class="field">
              <label>👥 Party Size:</label>
              <span class="value">${data.partySize} people</span>
            </div>
            
            <div class="field">
              <label>🎉 Type of Booking:</label>
              <span class="value">${eventTypeDisplay}</span>
            </div>
            
            <div class="field">
              <label>💬 Message & Special Requests:</label>
              <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 2px solid #eee;">
            
            <p class="urgent">⏰ Please respond within 24 hours to provide excellent customer service!</p>
            
            <p><strong>Quick Actions:</strong></p>
            <ul>
              <li>Reply to: <a href="mailto:${data.email}">${data.email}</a></li>
              ${data.phone ? `<li>Call: ${data.phone}</li>` : ''}
              <li>Check availability for: ${formattedDate}</li>
            </ul>
          </div>
          <div class="footer">
            <p>This booking inquiry was submitted through littlelattelane.co.za</p>
            <p>Little Latte Lane - Where every sip tastes like home</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Booking Inquiry - Little Latte Lane

Customer Details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone || 'Not provided'}
- Preferred Date: ${formattedDate}
- Party Size: ${data.partySize} people
- Type of Booking: ${eventTypeDisplay}

Message & Special Requests:
${data.message}

Please respond within 24 hours for excellent customer service!
Reply to: ${data.email}
    `;

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Little Latte Lane <bookings@littlelattelane.co.za>',
        to: ['admin@littlelattelane.co.za'],
        replyTo: data.email,
        subject: `🍽️ New Booking Inquiry from ${data.name} - ${eventTypeDisplay}`,
        html: emailHtml,
        text: emailText,
      });
    } else {
      console.warn('RESEND_API_KEY not configured - email not sent');
      console.log('Booking inquiry received:', {
        name: data.name,
        email: data.email,
        eventType: eventTypeDisplay,
        date: formattedDate,
        partySize: data.partySize
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking inquiry sent successfully' 
    });

  } catch (error) {
    console.error('Booking contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking inquiry' },
      { status: 500 }
    );
  }
}