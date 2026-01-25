import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendVerificationEmail } from "@/lib/mail";
import { randomInt } from "crypto";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
  role: z.enum(["JOBSEEKER", "EMPLOYER", "TEACHER"]),
  image: z.string().max(2000).optional(),
});

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    // SECURITY: Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, role, image } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // SECURITY: Generic response to prevent user enumeration
    if (existingUser) {
      return NextResponse.json(
        { message: "If this email is available, you will receive a verification code." },
        { status: 200 }
      );
    }

    const hashedPassword = await hash(password, 12); // Increased rounds for better security

    // SECURITY: Use cryptographically secure random OTP
    const otp = randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const userData = JSON.stringify({
      name,
      email,
      password: hashedPassword,
      role,
      image: image || null,
    });

    // Check/Update TempRegistration
    const existingTemp = await (prisma as any).tempRegistration.findUnique({
      where: { email }
    });

    if (existingTemp) {
      await (prisma as any).tempRegistration.update({
        where: { email },
        data: {
          otp,
          otpExpires,
          data: userData
        }
      });
    } else {
      await (prisma as any).tempRegistration.create({
        data: {
          email,
          otp,
          otpExpires,
          data: userData
        }
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return NextResponse.json(
      { message: "If this email is available, you will receive a verification code." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    // SECURITY: Generic error message to prevent information disclosure
    return NextResponse.json({ message: "An error occurred. Please try again." }, { status: 500 });
  }
}
