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

export async function POST(req: Request) {
  try {
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

    const body = await req.json();
    const { title, content, youtubeUrl, orderIndex } = lessonSchema.parse(body);

    const lesson = await (prisma as any).lesson.create({
      data: {
        courseId: course.id,
        title,
        content,
        youtubeUrl,
        orderIndex
      }
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
