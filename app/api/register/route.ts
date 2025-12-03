import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendVerificationEmail } from "@/lib/mail";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["JOBSEEKER", "EMPLOYER", "TEACHER"]),
  image: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, image } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 3600000); // 1 hour from now

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
      // We don't fail the registration, but the user will need to resend OTP
    }

    return NextResponse.json(
      { message: "Verification code sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.issues }, { status: 400 });
    }
    // Return the actual error message for debugging
    return NextResponse.json({ message: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 });
  }
}
