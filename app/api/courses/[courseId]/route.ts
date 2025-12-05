import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId } = params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            name: true,
            image: true,
          }
        },
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            // Content/Video only if enrolled? 
            // For MVP, we send content but frontend hides it. 
            // Better security: check enrollment here.
            content: true, 
            youtubeUrl: true,
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let enrollment = null;
    if (session?.user) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          courseId_userId: {
            courseId,
            userId: session.user.id
          }
        }
      });
    }

    // Security: If not enrolled and not teacher/admin, hide content
    const sanitizedCourse = { ...course };
    
    if (!enrollment || enrollment.status !== "APPROVED") {
      const isOwner = session?.user?.id === course.teacherId;
      const isAdmin = (session?.user as any)?.role === "ADMIN";
      
      if (!isOwner && !isAdmin) {
        // Strip content
        sanitizedCourse.lessons = course.lessons.map(l => ({
          ...l,
          content: "", // Hide content
          youtubeUrl: "" // Hide video
        }));
      }
    }

    return NextResponse.json({ course: sanitizedCourse, enrollment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
