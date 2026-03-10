import nodemailer from 'nodemailer';

const ENABLE_EMAIL = process.env.ENABLE_EMAIL === 'true';

// Create transporter (only if email is enabled)
const transporter = ENABLE_EMAIL
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email or log to console based on ENABLE_EMAIL setting
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text } = options;

  if (ENABLE_EMAIL && transporter) {
    // Send real email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'ProjectNova <noreply@projectnova.com>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  } else {
    // Log to console for development
    console.log('\n📧 ============ EMAIL (Console Mode) ============');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    console.log('📧 ============================================\n');
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  const subject = 'Welcome to ProjectNova! 🚀';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">Welcome to ProjectNova!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining ProjectNova - your one-stop platform for defense-ready academic projects.</p>
      <p>You now have access to:</p>
      <ul>
        <li>200+ premium academic projects</li>
        <li>Complete source code and documentation</li>
        <li>Viva Q&A preparation materials</li>
        <li>24/7 expert support</li>
      </ul>
      <p>Start exploring our project catalog and find the perfect project for your needs!</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects" 
           style="background: linear-gradient(to right, #8B5CF6, #6366F1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Browse Projects
        </a>
      </p>
      <p>Best regards,<br>The ProjectNova Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  name: string,
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
  const subject = 'Verify Your Email - ProjectNova';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">Verify Your Email</h1>
      <p>Hi ${name},</p>
      <p>Thank you for registering with ProjectNova! Please verify your email address to activate your account.</p>
      <p>
        <a href="${verificationUrl}" 
           style="background: linear-gradient(to right, #8B5CF6, #6366F1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
        ${verificationUrl}
      </p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>The ProjectNova Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  name: string,
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  const subject = 'Reset Your Password - ProjectNova';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">Reset Your Password</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p>
        <a href="${resetUrl}" 
           style="background: linear-gradient(to right, #8B5CF6, #6366F1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
        ${resetUrl}
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>Best regards,<br>The ProjectNova Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

/**
 * Send password changed confirmation email
 */
export async function sendPasswordChangedEmail(name: string, email: string): Promise<void> {
  const subject = 'Password Changed Successfully - ProjectNova';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">Password Changed</h1>
      <p>Hi ${name},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you didn't make this change, please contact our support team immediately at support@projectnova.com</p>
      <p>Best regards,<br>The ProjectNova Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  name: string,
  email: string,
  orderNumber: string,
  totalAmount: number
): Promise<void> {
  const subject = `Order Confirmation - ${orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B5CF6;">Order Confirmed! 🎉</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your purchase! Your order has been confirmed.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      </div>
      <p>You can now download your project files from your dashboard.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" 
           style="background: linear-gradient(to right, #8B5CF6, #6366F1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          View Order
        </a>
      </p>
      <p>If you have any questions, our support team is here to help!</p>
      <p>Best regards,<br>The ProjectNova Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export { sendEmail };
