import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Rate limiting for OTP attempts (in production, use Redis)
const otpAttemptStore = new Map<string, { count: number; lockUntil: number }>(); 
const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkOtpRateLimit(email: string): { allowed: boolean; remainingAttempts?: number } {
  const now = Date.now();
  const key = `otp-verify:${email.toLowerCase()}`;
  const entry = otpAttemptStore.get(key);
  
  if (entry && now < entry.lockUntil) {
    return { allowed: false };
  }
  
  if (!entry || now >= entry.lockUntil) {
    otpAttemptStore.set(key, { count: 1, lockUntil: 0 });
    return { allowed: true, remainingAttempts: MAX_OTP_ATTEMPTS - 1 };
  }
  
  if (entry.count >= MAX_OTP_ATTEMPTS) {
    entry.lockUntil = now + LOCKOUT_DURATION;
    return { allowed: false };
  }
  
  entry.count++;
  return { allowed: true, remainingAttempts: MAX_OTP_ATTEMPTS - entry.count };
}

function clearOtpAttempts(email: string): void {
  otpAttemptStore.delete(`otp-verify:${email.toLowerCase()}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = resetPasswordSchema.parse(body);
    
    // Check rate limit
    const rateCheck = checkOtpRateLimit(email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.otp || !user.otpExpires) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    if (user.otp !== otp) {
      const message = rateCheck.remainingAttempts && rateCheck.remainingAttempts > 0
        ? `Invalid OTP. ${rateCheck.remainingAttempts} attempts remaining.`
        : "Invalid OTP. Account temporarily locked.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Hash new password with cost factor 12
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpires: null,
      },
    });
    
    // Clear rate limit on success
    clearOtpAttempts(email);
    
    // Log security event
    console.log(`[SECURITY] Password reset successful for: ${email}`);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
