import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

// SECURITY: Strict input validation schema
const updateEnrollmentSchema = z.object({
  id: z.string().min(1).max(100),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
          price: true,
          priceNpr: true,
        } as any,
      },
    },
  });

  return NextResponse.json(enrollments);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = updateEnrollmentSchema.parse(body);

    // SECURITY: Verify enrollment exists before updating
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Enrollment update error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
