import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendVerificationEmail } from "@/lib/mail";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["JOBSEEKER", "EMPLOYER"]),
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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        image: image || null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        otp,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        otpExpires,
        isVerified: false,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We don't fail the registration, but the user will need to resend OTP
    }

    // Create profile based on role
    if (role === "JOBSEEKER") {
      await prisma.jobSeekerProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === "EMPLOYER") {
      await prisma.employerProfile.create({
        data: {
          userId: user.id,
          companyName: name || "My Company", // Default company name
        },
      });
    }

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      { user: userWithoutPassword, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
