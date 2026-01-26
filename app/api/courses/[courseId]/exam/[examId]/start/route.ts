import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ courseId: string; examId: string }>;
}

const db: any = prisma;

// POST - Start an exam attempt
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, examId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: session.user.id
        }
      }
    });

    if (!enrollment || enrollment.status !== "APPROVED") {
      return NextResponse.json({ error: "You must be enrolled in this course to take exams" }, { status: 403 });
    }

    // Get the exam
    const exam = await db.exam.findUnique({
      where: { id: examId, courseId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (!exam.isPublished || !exam.isActive) {
      return NextResponse.json({ error: "Exam is not available" }, { status: 403 });
    }

    // Check availability window
    const now = new Date();
    if (exam.availableFrom && now < exam.availableFrom) {
      return NextResponse.json({ error: "Exam is not yet available" }, { status: 403 });
    }
    if (exam.availableUntil && now > exam.availableUntil) {
      return NextResponse.json({ error: "Exam availability period has ended" }, { status: 403 });
    }

    // Check if user has an active attempt
    const activeAttempt = await db.examAttempt.findFirst({
      where: {
        examId,
        userId: session.user.id,
        status: "IN_PROGRESS"
      }
    });

    if (activeAttempt) {
      // Return the existing active attempt with questions
      const questions = exam.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options ? JSON.parse(q.options) : null,
        points: q.points,
        difficulty: q.difficulty
      }));

      // Shuffle if needed
      let finalQuestions = [...questions];
      if (exam.shuffleQuestions) {
        finalQuestions = shuffleArray(finalQuestions);
      }
      if (exam.shuffleOptions) {
        finalQuestions = finalQuestions.map((q: any) => {
          if (q.options && Array.isArray(q.options)) {
            return { ...q, options: shuffleArray([...q.options]) };
          }
          return q;
        });
      }

      // Calculate remaining time
      const startTime = new Date(activeAttempt.startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remainingTime = Math.max(0, (exam.timeLimit * 60) - elapsed);

      return NextResponse.json({
        attempt: activeAttempt,
        questions: finalQuestions,
        timeLimit: exam.timeLimit,
        remainingTime,
        resuming: true
      });
    }

    // Check attempt limits
    const attemptCount = await db.examAttempt.count({
      where: {
        examId,
        userId: session.user.id
      }
    });

    // Check if user already passed
    const passedAttempt = await db.examAttempt.findFirst({
      where: {
        examId,
        userId: session.user.id,
        passed: true
      }
    });

    if (passedAttempt) {
      return NextResponse.json({ 
        error: "You have already passed this exam",
        passed: true,
        score: passedAttempt.score
      }, { status: 400 });
    }

    if (attemptCount >= exam.maxAttempts) {
      return NextResponse.json({ 
        error: `Maximum attempts (${exam.maxAttempts}) reached`,
        attemptsUsed: attemptCount,
        maxAttempts: exam.maxAttempts
      }, { status: 400 });
    }

    // Create new attempt
    const attempt = await db.examAttempt.create({
      data: {
        examId,
        userId: session.user.id,
        attemptNumber: attemptCount + 1,
        status: "IN_PROGRESS",
        maxPoints: exam.questions.reduce((sum: number, q: any) => sum + q.points, 0)
      }
    });

    // Prepare questions (without correct answers)
    const questions = exam.questions.map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options ? JSON.parse(q.options) : null,
      points: q.points,
      difficulty: q.difficulty
    }));

    // Shuffle if needed
    let finalQuestions = [...questions];
    if (exam.shuffleQuestions) {
      finalQuestions = shuffleArray(finalQuestions);
    }
    if (exam.shuffleOptions) {
      finalQuestions = finalQuestions.map((q: any) => {
        if (q.options && Array.isArray(q.options)) {
          return { ...q, options: shuffleArray([...q.options]) };
        }
        return q;
      });
    }

    return NextResponse.json({
      attempt,
      questions: finalQuestions,
      timeLimit: exam.timeLimit,
      remainingTime: exam.timeLimit * 60,
      attemptNumber: attemptCount + 1,
      maxAttempts: exam.maxAttempts
    });

  } catch (error) {
    console.error("Error starting exam:", error);
    return NextResponse.json({ error: "Failed to start exam" }, { status: 500 });
  }
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
