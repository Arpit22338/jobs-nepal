import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      courseId,
      numQuestions,
      questionTypes,
      difficultyDistribution,
      passingScore
    } = body;

    // Fetch course content
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: { quizQuestions: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user is course teacher or admin
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (user?.role !== 'ADMIN' && course.teacherId !== (session.user as any).id) {
      return NextResponse.json(
        { success: false, error: "Not authorized to generate exam for this course" },
        { status: 403 }
      );
    }

    // Extract course content for AI
    const courseContent = course.lessons.map(lesson => `
Lesson: ${lesson.title}
Content: ${lesson.content}
`).join('\n\n');

    const prompt = `
Generate exam questions for the following course:

COURSE: ${course.title}
DESCRIPTION: ${course.description}

COURSE CONTENT:
${courseContent}

EXAM REQUIREMENTS:
- Number of Questions: ${numQuestions}
- Question Types: ${questionTypes.join(', ')}
- Difficulty Distribution:
  - Easy: ${difficultyDistribution.easy}%
  - Medium: ${difficultyDistribution.medium}%
  - Hard: ${difficultyDistribution.hard}%
- Passing Score: ${passingScore}%

Generate questions that:
1. Test understanding, not just memorization
2. Cover key concepts from ALL lessons
3. Have clear, unambiguous correct answers
4. Include plausible but incorrect distractors for MCQ
5. Follow the specified difficulty distribution
6. Include explanations for why each answer is correct

For multiple choice questions, provide 4 options (A, B, C, D).
For true/false questions, the correct answer should be "true" or "false".

Generate ${Math.ceil(numQuestions * 1.5)} questions to create a question bank (more than needed for randomization).

Return in JSON format with questions array.
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.examGenerator },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.6, maxTokens: 6000 });

    // Parse JSON response
    let examData;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        examData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse generated questions" },
        { status: 500 }
      );
    }

    // Add unique IDs to questions if not present
    if (examData.questions) {
      examData.questions = examData.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${index}`
      }));
    }

    return NextResponse.json({
      success: true,
      exam: {
        courseId,
        courseName: course.title,
        questions: examData.questions || [],
        settings: {
          numQuestions,
          questionTypes,
          difficultyDistribution,
          passingScore
        }
      }
    });
  } catch (error) {
    console.error("Exam generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate exam" },
      { status: 500 }
    );
  }
}
