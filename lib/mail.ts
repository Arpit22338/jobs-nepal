import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, otp: string) {
  // If no email credentials are provided, log the OTP to console (for development)
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.log("==================================================");
    console.log(`[DEV MODE] Email to ${email}`);
    console.log(`[DEV MODE] OTP: ${otp}`);
    console.log("==================================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Jobs Nepal" <noreply@jobsnepal.com>',
    to: email,
    subject: "Verify your email - Jobs Nepal",
    text: `Your verification code is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify your email</h2>
        <p>Thank you for registering with Jobs Nepal. Please use the following code to verify your email address:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendApplicationEmail(employerEmail: string, jobTitle: string, applicantName: string) {
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.log(`[DEV MODE] Application Email to ${employerEmail} for ${jobTitle} from ${applicantName}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Jobs Nepal" <noreply@jobsnepal.com>',
    to: employerEmail,
    subject: `New Application for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Job Application</h2>
        <p><strong>${applicantName}</strong> has applied for <strong>${jobTitle}</strong>.</p>
        <p>Log in to your dashboard to review the application.</p>
      </div>
    `,
  });
}

export async function sendApplicationStatusEmail(applicantEmail: string, jobTitle: string, status: string) {
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.log(`[DEV MODE] Status Email to ${applicantEmail} for ${jobTitle}: ${status}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Jobs Nepal" <noreply@jobsnepal.com>',
    to: applicantEmail,
    subject: `Application Status Update: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Application Update</h2>
        <p>Your application for <strong>${jobTitle}</strong> has been marked as <strong>${status}</strong>.</p>
        <p>Log in to check details.</p>
      </div>
    `,
  });
}
