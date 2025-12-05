import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    // 1. Verify Enrollment & Completion
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: session.user.id,
        },
      },
    });

    if (!enrollment || enrollment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Course not completed" }, { status: 400 });
    }

    // 2. Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: {
        courseId,
        userId: session.user.id,
      },
    });

    if (existingCert) {
      return NextResponse.json({ certificateId: existingCert.id });
    }

    // 3. Create Certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        courseId,
        score: enrollment.finalScore || 100,
        certificateUrl: "", // We generate on the fly or could upload to S3 here
      },
    });

    return NextResponse.json({ certificateId: certificate.id });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
