import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Force TS re-check
const activationSchema = z.object({
  paymentPhone: z.string().min(10),
  paymentScreenshotUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paymentPhone, paymentScreenshotUrl } = activationSchema.parse(body);

    // Check if request already exists
    const existingRequest = await (prisma as any).teacherActivationRequest.findFirst({
      where: {
        teacherId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "Activation request already pending" }, { status: 400 });
    }

    const request = await (prisma as any).teacherActivationRequest.create({
      data: {
        teacherId: session.user.id,
        paymentPhone,
        paymentScreenshotUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await (prisma as any).teacherActivationRequest.findFirst({
      where: {
        teacherId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
