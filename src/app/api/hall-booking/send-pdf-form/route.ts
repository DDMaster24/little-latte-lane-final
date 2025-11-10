/**
 * API Route for sending uploaded Roberts Hall PDF booking forms via email
 * Handles PDF attachment and sends to admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit, getClientIdentifier, RateLimitPresets, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  console.log('📧 PDF form upload email request received');

  try {
    // Parse form data
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    const senderEmail = formData.get('email') as string;
    const senderName = formData.get('name') as string;

    // Apply rate limiting
    const identifier = getClientIdentifier(request, senderEmail);
    const rateLimitResult = checkRateLimit(identifier, {
      id: 'hall-pdf-upload',
      ...RateLimitPresets.MODERATE,
    });

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.resetAt).toISOString();
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetAt: resetTime,
        },
        {
          status: 429,
          headers: getRateLimitHeaders({
            ...rateLimitResult,
            limit: RateLimitPresets.MODERATE.limit,
          }),
        }
      );
    }

    // Validate inputs
    if (!pdfFile || !senderEmail || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields: pdf, email, or name' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!pdfFile.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (pdfFile.size > maxSize) {
      return NextResponse.json(
        { error: 'PDF file is too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Convert PDF file to base64 for Resend attachment
    const arrayBuffer = await pdfFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Roberts Hall PDF Booking Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00ffff, #ff00ff); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: #000; margin: 0; font-size: 24px; font-weight: bold; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .field label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
          .field value { background: #fff; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd; display: block; }
          .footer { text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 14px; }
          .urgent { color: #e74c3c; font-weight: bold; }
          .attachment-notice { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏛️ Roberts Hall PDF Booking Form</h1>
          </div>
          <div class="content">
            <p><strong>A customer has submitted a completed Roberts Hall booking form via PDF upload!</strong></p>

            <div class="field">
              <label>👤 Submitted by:</label>
              <span class="value">${senderName}</span>
            </div>

            <div class="field">
              <label>📧 Email Address:</label>
              <span class="value">${senderEmail}</span>
            </div>

            <div class="field">
              <label>📄 File Name:</label>
              <span class="value">${pdfFile.name}</span>
            </div>

            <div class="field">
              <label>📊 File Size:</label>
              <span class="value">${(pdfFile.size / 1024).toFixed(2)} KB</span>
            </div>

            <div class="attachment-notice">
              <p style="margin: 0; color: #856404; font-weight: bold;">📎 PDF FORM ATTACHED</p>
              <p style="margin: 5px 0 0 0; color: #856404; font-size: 13px;">
                The completed booking form is attached to this email. Please review and process the booking request.
              </p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 2px solid #eee;">

            <p class="urgent">⏰ Please review and respond within 24 hours!</p>

            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Download and review the attached PDF booking form</li>
              <li>Verify all information is complete and accurate</li>
              <li>Check hall availability for requested date</li>
              <li>Reply to: <a href="mailto:${senderEmail}">${senderEmail}</a></li>
              <li>Process payment and confirm booking</li>
            </ul>
          </div>
          <div class="footer">
            <p>This booking form was submitted through littlelattelane.co.za</p>
            <p>Little Latte Lane - Where every sip tastes like home</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Roberts Hall PDF Booking Form Submission

Submitted by: ${senderName}
Email: ${senderEmail}
File Name: ${pdfFile.name}
File Size: ${(pdfFile.size / 1024).toFixed(2)} KB

A completed Roberts Hall booking form has been attached to this email.

Please review the form and respond to ${senderEmail} within 24 hours.

Next Steps:
- Download and review the attached PDF booking form
- Verify all information is complete
- Check hall availability
- Process payment and confirm booking

This booking form was submitted through littlelattelane.co.za
    `;

    // Send email using Resend with PDF attachment
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - email not sent');
      console.log('📧 PDF Form Submission (Development Mode):', {
        to: 'admin@littlelattelane.co.za',
        from: senderEmail,
        fileName: pdfFile.name,
        size: pdfFile.size,
      });

      return NextResponse.json({
        success: true,
        message: 'Development mode: Email would be sent in production',
      });
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const result = await resend.emails.send({
        from: 'Little Latte Lane <bookings@littlelattelane.co.za>',
        to: ['admin@littlelattelane.co.za'],
        replyTo: senderEmail,
        subject: `🏛️ Roberts Hall PDF Form - ${senderName}`,
        html: emailHtml,
        text: emailText,
        attachments: [
          {
            filename: pdfFile.name,
            content: base64,
          },
        ],
      });

      if (result.error) {
        console.error('❌ Resend API error:', result.error);
        throw new Error(result.error.message || 'Failed to send email');
      }

      console.log('✅ PDF form email sent successfully:', result.data?.id);

      return NextResponse.json({
        success: true,
        message: 'PDF booking form sent successfully',
        emailId: result.data?.id,
      });

    } catch (emailError) {
      console.error('❌ Failed to send PDF form email:', emailError);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ PDF form upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process PDF form submission',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Roberts Hall PDF form upload endpoint',
      methods: ['POST'],
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
