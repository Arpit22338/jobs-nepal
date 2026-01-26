import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGroqAI } from "@/lib/groq";

interface ExamGenerationRequest {
  courseName: string;
  courseDescription?: string;
  topics?: string[];
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "MIXED";
  questionCount?: number;
  questionTypes?: ("MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER")[];
  lessonContent?: string; // Optional lesson content for context
}

interface GeneratedQuestion {
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only teachers and admins can generate exams
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can generate exams" }, { status: 403 });
    }

    const body: ExamGenerationRequest = await req.json();
    const {
      courseName,
      courseDescription = "",
      topics = [],
      difficulty = "MIXED",
      questionCount = 10,
      questionTypes = ["MULTIPLE_CHOICE"],
      lessonContent = ""
    } = body;

    if (!courseName) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    // Build the prompt for AI
    const systemPrompt = `You are an expert educational assessment designer. Your task is to generate high-quality exam questions for online courses.

CRITICAL RULES:
1. Questions must be clear, unambiguous, and test actual understanding
2. All options in multiple choice must be plausible (no obviously wrong answers)
3. For TRUE_FALSE questions, the statement must be clear and definitively true or false
4. Explanations should help students learn, not just state the answer
5. Questions should vary in cognitive level (recall, understanding, application, analysis)
6. Avoid trick questions or questions that test memorization only

For MULTIPLE_CHOICE questions:
- Always provide exactly 4 options labeled A, B, C, D
- Only one option should be correct
- Distractors should be plausible misconceptions

For TRUE_FALSE questions:
- Statement must be definitively true or false
- Avoid "always" or "never" unless actually absolute

For SHORT_ANSWER questions:
- Provide 1-3 acceptable answer variations
- Keep expected answers concise (1-5 words)`;

    const userPrompt = `Generate ${questionCount} exam questions for the following course:

COURSE NAME: ${courseName}
${courseDescription ? `COURSE DESCRIPTION: ${courseDescription}` : ""}
${topics.length > 0 ? `TOPICS TO COVER: ${topics.join(", ")}` : ""}
${lessonContent ? `LESSON CONTENT FOR CONTEXT:\n${lessonContent.substring(0, 3000)}` : ""}

REQUIREMENTS:
- Difficulty Level: ${difficulty === "MIXED" ? "Mix of EASY (30%), MEDIUM (50%), HARD (20%)" : difficulty}
- Question Types: ${questionTypes.join(", ")}
- Total Questions: ${questionCount}

Return a valid JSON array of questions in this exact format:
[
  {
    "questionText": "Clear question text here",
    "questionType": "MULTIPLE_CHOICE",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "MEDIUM",
    "tags": ["topic1", "topic2"]
  }
]

For TRUE_FALSE questions, options should be ["True", "False"] and correctAnswer should be "True" or "False".
For SHORT_ANSWER questions, options should be null and correctAnswer should be the expected answer(s) separated by | if multiple acceptable.

IMPORTANT: Return ONLY the JSON array, no other text.`;

    const response = await callGroqAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], {
      temperature: 0.7,
      maxTokens: 8000
    });

    // Parse the JSON response
    let questions: GeneratedQuestion[];
    try {
      // Clean up the response in case it has markdown code blocks
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      questions = JSON.parse(cleanedResponse);

      // Validate the structure
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }

      // Validate each question
      questions = questions.map((q, index) => ({
        questionText: q.questionText || `Question ${index + 1}`,
        questionType: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"].includes(q.questionType) 
          ? q.questionType 
          : "MULTIPLE_CHOICE",
        options: q.options || null,
        correctAnswer: q.correctAnswer || "A",
        explanation: q.explanation || "No explanation provided.",
        difficulty: ["EASY", "MEDIUM", "HARD"].includes(q.difficulty) ? q.difficulty : "MEDIUM",
        tags: Array.isArray(q.tags) ? q.tags : []
      }));

    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", response);
      return NextResponse.json({ 
        error: "Failed to parse AI response. Please try again.",
        rawResponse: response.substring(0, 500)
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        courseName,
        difficulty,
        questionCount: questions.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Exam generation error:", error);
    return NextResponse.json({ 
      error: "Failed to generate exam questions",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Regenerate a single question
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can regenerate questions" }, { status: 403 });
    }

    const body = await req.json();
    const { originalQuestion, courseName, feedback } = body;

    if (!originalQuestion || !courseName) {
      return NextResponse.json({ error: "Original question and course name required" }, { status: 400 });
    }

    const prompt = `Regenerate this exam question to be better. The original question was:

${JSON.stringify(originalQuestion, null, 2)}

Course: ${courseName}
${feedback ? `Instructor Feedback: ${feedback}` : ""}

Requirements:
- Keep the same question type (${originalQuestion.questionType})
- Keep the same difficulty (${originalQuestion.difficulty})
- Make it clearer and more educational
- Provide a better explanation

Return a single question object in the same JSON format. Return ONLY the JSON object, no other text.`;

    const response = await callGroqAI([
      { 
        role: "system", 
        content: "You are an expert educational assessment designer. Generate a single improved exam question." 
      },
      { role: "user", content: prompt }
    ], {
      temperature: 0.8,
      maxTokens: 1500
    });

    let question;
    try {
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      question = JSON.parse(cleanedResponse.trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse regenerated question" }, { status: 500 });
    }

    return NextResponse.json({ success: true, question });

  } catch (error) {
    console.error("Question regeneration error:", error);
    return NextResponse.json({ error: "Failed to regenerate question" }, { status: 500 });
  }
}
