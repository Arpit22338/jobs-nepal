import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// GET - Fetch all exams for a course
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the course to check ownership
    const course = await (prisma as any).course.findUnique({
      where: { id: courseId },
      include: {
        exams: {
          include: {
            questions: {
              select: { id: true }
            },
            attempts: {
              select: { id: true, passed: true, score: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is the teacher/owner or admin
    const isOwner = course.teacherId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    // For students, only show published exams
    let exams = course.exams || [];
    if (!isOwner && !isAdmin) {
      exams = exams.filter((e: any) => e.isPublished && e.isActive);
    }

    // Calculate stats for each exam
    const examsWithStats = exams.map((exam: any) => {
      const totalAttempts = exam.attempts.length;
      const passedAttempts = exam.attempts.filter((a: any) => a.passed).length;
      const avgScore = totalAttempts > 0 
        ? exam.attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / totalAttempts 
        : 0;

      return {
        ...exam,
        questionCount: exam.questions.length,
        stats: {
          totalAttempts,
          passedAttempts,
          passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
          avgScore: Math.round(avgScore * 10) / 10
        }
      };
    });

    return NextResponse.json({ 
      exams: examsWithStats,
      isOwner: isOwner || isAdmin
    });

  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

// POST - Create a new exam
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isOwner = course.teacherId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "You don't have permission to create exams for this course" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      passingScore = 70,
      timeLimit = 60,
      maxAttempts = 3,
      shuffleQuestions = true,
      shuffleOptions = true,
      showResults = true,
      questions = [],
      availableFrom,
      availableUntil,
      isPublished = false
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Exam title is required" }, { status: 400 });
    }

    // Create the exam with questions
    const exam = await (prisma as any).exam.create({
      data: {
        courseId,
        title,
        description,
        passingScore,
        timeLimit,
        maxAttempts,
        shuffleQuestions,
        shuffleOptions,
        showResults,
        isPublished,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType || "MULTIPLE_CHOICE",
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            orderIndex: index,
            difficulty: q.difficulty || "MEDIUM",
            tags: q.tags ? JSON.stringify(q.tags) : null
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      exam,
      message: "Exam created successfully"
    });

  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
