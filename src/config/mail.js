import nodemailer from 'nodemailer';

let transporter = null;

export const getMailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
};

export const sendOtpEmail = async (toEmail, otp, name = 'User') => {
  const mailer = getMailTransporter();

  // Always log OTP to server console for quick local development & testing
  console.log(`\n======================================================`);
  console.log(`🔑 [OTP VERIFICATION] For: ${toEmail} | OTP: [ ${otp} ]`);
  console.log(`======================================================\n`);

  if (!mailer) {
    console.warn('⚠️ [Mail] EMAIL_USER or EMAIL_PASS not configured in .env. OTP printed to console above.');
    return { simulated: true, otp };
  }

  try {
    const info = await mailer.sendMail({
      from: `"AiCoach AI" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your AiCoach Verification Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #08090d; color: #e2e8f0; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
          <h2 style="color: #38bdf8; margin-top: 0;">Welcome to AiCoach, ${name}!</h2>
          <p style="font-size: 14px; color: #94a3b8;">Use the one-time verification code below to verify your email and activate your account:</p>
          <div style="background: #111420; border: 1px solid #1e293b; padding: 18px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38bdf8;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`✅ [Mail] OTP Email sent successfully to ${toEmail} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [Mail] Failed to send email: ${error.message}`);
    return { simulated: true, error: error.message };
  }
};
