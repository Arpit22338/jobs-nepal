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

    // Ensure course exists in DB (for hardcoded courses)
    let course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      // Create placeholder course if it's one of our known hardcoded ones
      if (courseId === "cv-building") {
        course = await prisma.course.create({
          data: {
            id: "cv-building",
            title: "CV Building Masterclass",
            description: "Learn how to craft a professional CV.",
            priceNpr: 0,
            isPublished: true,
            thumbnailUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=500&auto=format&fit=crop",
          }
        });
      } else if (courseId === "basic-python") {
         course = await prisma.course.create({
          data: {
            id: "basic-python",
            title: "Basic Python Programming",
            description: "Master the fundamentals of Python programming.",
            priceNpr: 299,
            isPublished: true,
            thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
          }
        });
      } else {
         return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
    }

    // 1. Verify Enrollment
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: session.user.id,
        },
      },
    });

    if (!enrollment) {
      // Auto-enroll if it's the free CV course
      if (courseId === "cv-building") {
         enrollment = await prisma.enrollment.create({
           data: {
             userId: session.user.id,
             courseId,
             status: "APPROVED",
             progress: 0
           }
         });
      } else {
        return NextResponse.json({ error: "Not enrolled" }, { status: 400 });
      }
    }

    // 2. Mark as completed (In a real app, this would happen after quizzes)
    // For MVP, we allow manual completion or auto-completion
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "COMPLETED",
        progress: 100,
        finalScore: 100, // Default score for now
      },
    });

    // 3. Generate Certificate Record
    const existingCert = await prisma.certificate.findFirst({
      where: { courseId, userId: session.user.id },
    });

    let certificateCreated = false;
    if (!existingCert) {
      await prisma.certificate.create({
        data: {
          userId: session.user.id,
          courseId,
          score: 100,
          certificateUrl: "",
        },
      });
      certificateCreated = true;
    }

    return NextResponse.json({ 
      success: true, 
      certificateCreated,
      certificateAlreadyExists: !!existingCert,
      message: certificateCreated ? "Certificate created successfully" : "Certificate already exists"
    });
  } catch (error) {
    console.error("Completion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
