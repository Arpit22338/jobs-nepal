import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ courseId: string; examId: string }>;
}

const db: any = prisma;

// POST - Submit exam answers
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { attemptId, answers, timeSpent } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID is required" }, { status: 400 });
    }

    // Get the attempt
    const attempt = await db.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            course: true,
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "This attempt has already been submitted" }, { status: 400 });
    }

    // Check if time has expired
    const startTime = new Date(attempt.startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const maxTime = attempt.exam.timeLimit * 60;
    const isExpired = elapsed > maxTime + 30; // 30 second grace period

    // Grade the exam
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedAnswers: {
      questionId: string;
      answer: string | null;
      isCorrect: boolean;
      pointsEarned: number;
    }[] = [];

    for (const question of attempt.exam.questions) {
      const userAnswer = answers?.[question.id] || null;
      totalPoints += question.points;

      let isCorrect = false;
      
      if (userAnswer !== null && userAnswer !== undefined && userAnswer !== "") {
        if (question.questionType === "MULTIPLE_CHOICE") {
          // For MCQ, compare the answer letter/index
          isCorrect = userAnswer.toString().toUpperCase().trim() === 
                     question.correctAnswer.toString().toUpperCase().trim();
        } else if (question.questionType === "TRUE_FALSE") {
          isCorrect = userAnswer.toString().toLowerCase().trim() === 
                     question.correctAnswer.toString().toLowerCase().trim();
        } else if (question.questionType === "SHORT_ANSWER") {
          // For short answer, check if answer matches any acceptable answer
          const acceptableAnswers = question.correctAnswer.split("|").map((a: string) => a.toLowerCase().trim());
          isCorrect = acceptableAnswers.includes(userAnswer.toString().toLowerCase().trim());
        }
      }

      const pointsEarned = isCorrect ? question.points : 0;
      earnedPoints += pointsEarned;

      gradedAnswers.push({
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        pointsEarned
      });
    }

    // Calculate score percentage
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= attempt.exam.passingScore;

    // Save answers and update attempt
    await db.examAnswer.createMany({
      data: gradedAnswers.map(a => ({
        attemptId,
        questionId: a.questionId,
        answer: a.answer,
        isCorrect: a.isCorrect,
        pointsEarned: a.pointsEarned
      }))
    });

    await db.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: isExpired ? "EXPIRED" : "GRADED",
        submittedAt: new Date(),
        score: Math.round(score * 100) / 100,
        totalPoints: earnedPoints,
        maxPoints: totalPoints,
        passed,
        timeSpent: timeSpent || elapsed
      }
    });

    // If passed, generate certificate
    let certificateId = null;
    if (passed) {
      // Check if certificate already exists
      const existingCert = await prisma.certificate.findFirst({
        where: {
          userId: session.user.id,
          courseId
        }
      });

      if (!existingCert) {
        const certificate = await prisma.certificate.create({
          data: {
            userId: session.user.id,
            courseId,
            score,
            certificateUrl: `/certificate/` // Will be filled with actual ID
          }
        });

        // Update certificate URL with ID
        await prisma.certificate.update({
          where: { id: certificate.id },
          data: { certificateUrl: `/certificate/${certificate.id}` }
        });

        certificateId = certificate.id;

        // Update exam attempt with certificate ID
        await db.examAttempt.update({
          where: { id: attemptId },
          data: { certificateId }
        });

        // Update enrollment status to completed
        await prisma.enrollment.update({
          where: {
            courseId_userId: {
              courseId,
              userId: session.user.id
            }
          },
          data: {
            status: "COMPLETED",
            finalScore: score
          }
        });
      } else {
        certificateId = existingCert.id;
      }
    }

    // Prepare results
    const results: {
      score: number;
      totalPoints: number;
      earnedPoints: number;
      passed: boolean;
      passingScore: number;
      timeSpent: number;
      certificateId: string | null;
      showResults: boolean;
      answers?: any[];
    } = {
      score: Math.round(score * 100) / 100,
      totalPoints,
      earnedPoints,
      passed,
      passingScore: attempt.exam.passingScore,
      timeSpent: timeSpent || elapsed,
      certificateId,
      showResults: attempt.exam.showResults
    };

    // Include detailed results if showResults is enabled
    if (attempt.exam.showResults) {
      results.answers = gradedAnswers.map(a => {
        const question = attempt.exam.questions.find((q: any) => q.id === a.questionId)!;
        return {
          questionId: a.questionId,
          questionText: question.questionText,
          userAnswer: a.answer,
          correctAnswer: question.correctAnswer,
          isCorrect: a.isCorrect,
          explanation: question.explanation,
          pointsEarned: a.pointsEarned
        };
      });
    }

    return NextResponse.json({
      success: true,
      results,
      message: passed 
        ? "Congratulations! You passed the exam!" 
        : "You did not pass. Please review and try again."
    });

  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
