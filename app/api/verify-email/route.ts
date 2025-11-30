import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = verifySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "User already verified" }, { status: 200 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userWithOtp = user as any;

    if (!userWithOtp.otp || !userWithOtp.otpExpires) {
      return NextResponse.json({ message: "Invalid verification request" }, { status: 400 });
    }

    if (userWithOtp.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(userWithOtp.otpExpires)) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        otp: null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        otpExpires: null,
      },
    });

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
