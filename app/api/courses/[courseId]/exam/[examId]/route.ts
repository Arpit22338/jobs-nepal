import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ courseId: string; examId: string }>;
}

const db: any = prisma;

// GET - Fetch single exam details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, examId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exam = await db.exam.findUnique({
      where: { id: examId, courseId },
      include: {
        course: {
          select: { id: true, title: true, teacherId: true }
        },
        questions: {
          orderBy: { orderIndex: "asc" }
        },
        attempts: {
          where: { userId: session.user.id },
          orderBy: { attemptNumber: "desc" }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const isOwner = exam.course.teacherId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    // For students, hide correct answers unless exam allows showing results
    if (!isOwner && !isAdmin) {
      if (!exam.isPublished || !exam.isActive) {
        return NextResponse.json({ error: "Exam is not available" }, { status: 403 });
      }

      // Check if exam is within availability window
      const now = new Date();
      if (exam.availableFrom && now < exam.availableFrom) {
        return NextResponse.json({ error: "Exam is not yet available" }, { status: 403 });
      }
      if (exam.availableUntil && now > exam.availableUntil) {
        return NextResponse.json({ error: "Exam availability period has ended" }, { status: 403 });
      }
    }

    // Parse JSON fields in questions
    const questionsWithParsed = exam.questions.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
      tags: q.tags ? JSON.parse(q.tags) : [],
      // Hide correct answer for students unless showing results
      correctAnswer: (isOwner || isAdmin) ? q.correctAnswer : undefined,
      explanation: (isOwner || isAdmin) ? q.explanation : undefined
    }));

    // Get user's attempt stats
    const userAttempts = exam.attempts.length;
    const bestScore = exam.attempts.length > 0 
      ? Math.max(...exam.attempts.map((a: any) => a.score || 0))
      : null;
    const hasPassed = exam.attempts.some((a: any) => a.passed);
    const canRetake = userAttempts < exam.maxAttempts && !hasPassed;
    const hasActiveAttempt = exam.attempts.some((a: any) => a.status === "IN_PROGRESS");

    return NextResponse.json({
      exam: {
        ...exam,
        questions: questionsWithParsed
      },
      userStats: {
        attempts: userAttempts,
        maxAttempts: exam.maxAttempts,
        bestScore,
        hasPassed,
        canRetake,
        hasActiveAttempt,
        lastAttempt: exam.attempts[0] || null
      },
      isOwner: isOwner || isAdmin
    });

  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}

// PUT - Update exam
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, examId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exam = await db.exam.findUnique({
      where: { id: examId, courseId },
      include: { course: true }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const isOwner = exam.course.teacherId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      passingScore,
      timeLimit,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showResults,
      isPublished,
      isActive,
      availableFrom,
      availableUntil,
      questions
    } = body;

    // Update exam settings
    const updatedExam = await db.exam.update({
      where: { id: examId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(passingScore !== undefined && { passingScore }),
        ...(timeLimit !== undefined && { timeLimit }),
        ...(maxAttempts !== undefined && { maxAttempts }),
        ...(shuffleQuestions !== undefined && { shuffleQuestions }),
        ...(shuffleOptions !== undefined && { shuffleOptions }),
        ...(showResults !== undefined && { showResults }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isActive !== undefined && { isActive }),
        ...(availableFrom !== undefined && { availableFrom: availableFrom ? new Date(availableFrom) : null }),
        ...(availableUntil !== undefined && { availableUntil: availableUntil ? new Date(availableUntil) : null })
      }
    });

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await db.examQuestion.deleteMany({ where: { examId } });

      // Create new questions
      await db.examQuestion.createMany({
        data: questions.map((q: any, index: number) => ({
          examId,
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
      });
    }

    return NextResponse.json({ 
      success: true, 
      exam: updatedExam,
      message: "Exam updated successfully"
    });

  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }
}

// DELETE - Delete exam
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, examId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exam = await db.exam.findUnique({
      where: { id: examId, courseId },
      include: { course: true }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const isOwner = exam.course.teacherId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.exam.delete({ where: { id: examId } });

    return NextResponse.json({ 
      success: true, 
      message: "Exam deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}
