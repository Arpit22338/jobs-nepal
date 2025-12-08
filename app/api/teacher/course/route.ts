import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  priceNpr: z.number().min(0),
  totalRequiredMinutes: z.number().min(0),
  thumbnailImage: z.string().optional().or(z.literal("")),
  qrCodeImage: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findFirst({
      where: { teacherId: session.user.id } as any,
      include: {
        enrollments: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        },
        lessons: {
            orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check KYC
    const kyc = await (prisma as any).kycRecord.findFirst({
      where: { teacherId: session.user.id, status: "APPROVED" }
    });
    if (!kyc) {
      return NextResponse.json({ error: "KYC not approved" }, { status: 403 });
    }

    // Check existing course
    const existingCourse = await prisma.course.findFirst({
      where: { teacherId: session.user.id } as any
    });
    if (existingCourse) {
      return NextResponse.json({ error: "You can only create one course" }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, priceNpr, totalRequiredMinutes, thumbnailImage, qrCodeImage } = courseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        teacherId: session.user.id,
        title,
        description,
        priceNpr,
        totalRequiredMinutes,
        thumbnailUrl: thumbnailImage,
        qrCodeUrl: qrCodeImage,
      } as any,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Course creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid course data", details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create course", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priceNpr, totalRequiredMinutes, thumbnailImage, qrCodeImage, isPublished } = courseSchema.parse(body);

    const course = await prisma.course.findFirst({
      where: { teacherId: session.user.id } as any
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if ((course as any).editCount >= 10) {
       return NextResponse.json({ error: "Maximum edit limit reached (10)" }, { status: 403 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: course.id },
      data: {
        title,
        description,
        priceNpr,
        totalRequiredMinutes,
        thumbnailUrl: thumbnailImage,
        qrCodeUrl: qrCodeImage,
        isPublished,
        editCount: { increment: 1 }
      } as any
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
