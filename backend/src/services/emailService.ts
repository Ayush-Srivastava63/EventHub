import nodemailer from 'nodemailer';

// Use standard SMTP variables or fall back to fake Ethereal account
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email', // Replace via .env for production
    pass: process.env.SMTP_PASS || 'etherealpassword',
  },
});

let etherealAccount: nodemailer.TestAccount | null = null;

async function getTransporter() {
  if (process.env.SMTP_HOST) {
    return transporter;
  }

  // If no SMTP_HOST is provided, automatically generate a test account via Ethereal
  // This is PERFECT for local development and portfolios without needing real email credentials.
  if (!etherealAccount) {
    etherealAccount = await nodemailer.createTestAccount();
    console.log('📧 Created Ethereal Test Email Account:', etherealAccount.user);
  }

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: etherealAccount.user,
      pass: etherealAccount.pass,
    },
  });
}

export async function sendEmail(to: string, subject: string, htmlContent: string, fromName: string = 'EventHub System', replyTo?: string) {
  try {
    const mailTransporter = await getTransporter();
    
    const info = await mailTransporter.sendMail({
      from: `"${fromName}" <noreply@eventhub.demo>`,
      to,
      replyTo: replyTo || undefined,
      subject,
      html: htmlContent,
    });

    console.log(`✉️ Email sent to ${to} | Subject: ${subject}`);
    
    // If using ethereal email (test), we can output the preview URL!
    if (!process.env.SMTP_HOST) {
      console.log(`🔗 Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw the error, we don't want to break the main flow if email fails.
  }
}
