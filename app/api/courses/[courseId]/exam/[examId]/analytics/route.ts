import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ courseId: string; examId: string }>;
}

const db: any = prisma;

// GET - Fetch exam analytics (for instructors)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, examId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get exam with all data
    const exam = await db.exam.findUnique({
      where: { id: examId, courseId },
      include: {
        course: true,
        questions: {
          include: {
            answers: true
          }
        },
        attempts: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            },
            answers: true
          },
          orderBy: { submittedAt: "desc" }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check authorization
    const isOwner = exam.course.teacherId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to view analytics" }, { status: 403 });
    }

    // Calculate overall statistics
    const completedAttempts = exam.attempts.filter((a: any) => a.status === "GRADED" || a.status === "EXPIRED");
    const passedAttempts = completedAttempts.filter((a: any) => a.passed);
    
    const overallStats = {
      totalAttempts: completedAttempts.length,
      uniqueStudents: new Set(completedAttempts.map((a: any) => a.userId)).size,
      passedCount: passedAttempts.length,
      failedCount: completedAttempts.length - passedAttempts.length,
      passRate: completedAttempts.length > 0 
        ? Math.round((passedAttempts.length / completedAttempts.length) * 100) 
        : 0,
      averageScore: completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completedAttempts.length * 10) / 10
        : 0,
      highestScore: completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((a: any) => a.score || 0))
        : 0,
      lowestScore: completedAttempts.length > 0
        ? Math.min(...completedAttempts.map((a: any) => a.score || 0))
        : 0,
      averageTimeMinutes: completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum: number, a: any) => sum + (a.timeSpent || 0), 0) / completedAttempts.length / 60)
        : 0
    };

    // Score distribution (buckets of 10%)
    const scoreDistribution = Array(10).fill(0);
    completedAttempts.forEach((a: any) => {
      const bucket = Math.min(9, Math.floor((a.score || 0) / 10));
      scoreDistribution[bucket]++;
    });

    // Question-level analytics
    const questionAnalytics = exam.questions.map((question: any) => {
      const answers = question.answers;
      const totalAnswered = answers.length;
      const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
      
      // For MCQ, track option distribution
      const optionDistribution: { [key: string]: number } = {};
      if (question.questionType === "MULTIPLE_CHOICE" && question.options) {
        const options = JSON.parse(question.options);
        options.forEach((opt: string) => {
          optionDistribution[opt] = answers.filter((a: any) => a.answer === opt.charAt(0)).length;
        });
      }

      return {
        id: question.id,
        questionText: question.questionText.substring(0, 100) + (question.questionText.length > 100 ? "..." : ""),
        questionType: question.questionType,
        difficulty: question.difficulty,
        totalAnswered,
        correctCount: correctAnswers,
        incorrectCount: totalAnswered - correctAnswers,
        correctRate: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
        optionDistribution,
        // Flag if question might be problematic (too easy or too hard)
        flag: totalAnswered > 5 && ((correctAnswers / totalAnswered) > 0.95 || (correctAnswers / totalAnswered) < 0.2)
          ? (correctAnswers / totalAnswered) > 0.95 ? "TOO_EASY" : "TOO_HARD"
          : null
      };
    });

    // Recent attempts (top 20)
    const recentAttempts = completedAttempts.slice(0, 20).map((a: any) => ({
      id: a.id,
      user: {
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
        image: a.user.image
      },
      attemptNumber: a.attemptNumber,
      score: a.score,
      passed: a.passed,
      timeSpent: a.timeSpent,
      submittedAt: a.submittedAt
    }));

    // Students who haven't passed yet (might need help)
    const strugglingStudents = completedAttempts
      .filter((a: any) => !a.passed && a.attemptNumber >= 2)
      .reduce((acc: any[], a: any) => {
        if (!acc.find((s: any) => s.userId === a.userId)) {
          acc.push({
            userId: a.user.id,
            userName: a.user.name,
            email: a.user.email,
            attempts: completedAttempts.filter((at: any) => at.userId === a.userId).length,
            bestScore: Math.max(...completedAttempts.filter((at: any) => at.userId === a.userId).map((at: any) => at.score || 0))
          });
        }
        return acc;
      }, []);

    // Time-based stats (attempts over time)
    const attemptsByDay: { [key: string]: number } = {};
    completedAttempts.forEach((a: any) => {
      if (a.submittedAt) {
        const day = new Date(a.submittedAt).toISOString().split("T")[0];
        attemptsByDay[day] = (attemptsByDay[day] || 0) + 1;
      }
    });

    return NextResponse.json({
      examTitle: exam.title,
      passingScore: exam.passingScore,
      maxAttempts: exam.maxAttempts,
      timeLimit: exam.timeLimit,
      questionCount: exam.questions.length,
      overallStats,
      scoreDistribution: scoreDistribution.map((count, i) => ({
        range: `${i * 10}-${(i + 1) * 10}%`,
        count
      })),
      questionAnalytics,
      recentAttempts,
      strugglingStudents,
      attemptsByDay: Object.entries(attemptsByDay).map(([date, count]) => ({ date, count })),
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
