import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  screenshotUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { screenshotUrl } = verifySchema.parse(body);

    // Check if request already exists
    const existingRequest = await prisma.premiumRequest.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "Verification request already pending" }, { status: 400 });
    }

    const request = await prisma.premiumRequest.create({
      data: {
        userId: session.user.id,
        planType: "TEACHER_VERIFICATION",
        amount: 499,
        screenshotUrl,
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

    const request = await prisma.premiumRequest.findFirst({
      where: {
        userId: session.user.id,
        planType: "TEACHER_VERIFICATION",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
