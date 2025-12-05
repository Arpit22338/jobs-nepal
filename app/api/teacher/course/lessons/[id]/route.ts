import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lessonSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  youtubeUrl: z.string().optional(),
  orderIndex: z.number().int(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findFirst({
      where: { teacherId: session.user.id } as any
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify lesson belongs to course
    const existingLesson = await (prisma as any).lesson.findFirst({
      where: { id, courseId: course.id }
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, content, youtubeUrl, orderIndex } = lessonSchema.parse(body);

    const lesson = await (prisma as any).lesson.update({
      where: { id },
      data: {
        title,
        content,
        youtubeUrl,
        orderIndex
      }
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findFirst({
      where: { teacherId: session.user.id } as any
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existingLesson = await (prisma as any).lesson.findFirst({
      where: { id, courseId: course.id }
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await (prisma as any).lesson.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
