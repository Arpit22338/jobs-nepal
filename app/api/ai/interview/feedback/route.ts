import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import * as z from "zod";

// OWASP A03: Input validation schema
const feedbackSchema = z.object({
  question: z.string().min(5).max(1000),
  answer: z.string().min(10).max(5000),
  questionType: z.string().max(50).optional(),
  jobTitle: z.string().max(100).optional(),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (limit.count >= 20) return false;
  limit.count++;
  return true;
}

// Helper function to safely parse JSON from AI response
function parseAIResponse(result: string) {
  // Remove markdown code blocks if present
  const cleaned = result
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();
  
  // Try to find JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("No valid JSON found in response");
}

export async function POST(req: NextRequest) {
  try {
    // OWASP A01: Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // OWASP A04: Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    // OWASP A03: Input validation
    const validatedData = feedbackSchema.parse(body);
    
    const { question, answer, questionType, jobTitle } = validatedData;

    const prompt = `
Analyze this interview answer and provide detailed feedback:

Interview Question: ${question}
Question Type: ${questionType || 'general'}
Job Role: ${jobTitle || 'Professional Role'}

Candidate's Answer:
"${answer}"

Provide comprehensive feedback including:
1. A score from 1-10
2. Specific strengths in the answer (as an array of strings)
3. Areas that need improvement (as an array of strings)
4. A better sample answer (2-3 paragraphs as a single string)
5. Tips for improvement (as an array of strings, especially STAR method tips if behavioral question)

Be constructive, encouraging, and specific in your feedback.

IMPORTANT: Return ONLY a valid JSON object (no markdown, no code blocks, no extra text).
Return in this exact JSON format:
{
  "score": 7,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "sampleAnswer": "A sample strong answer paragraph...",
  "tips": ["tip 1", "tip 2"]
}
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.interviewFeedback + "\n\nIMPORTANT: Always return ONLY valid JSON without markdown code blocks or any other text." },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.6, maxTokens: 2000 });

    // Parse JSON response
    let feedback;
    try {
      feedback = parseAIResponse(result);
      
      // Ensure all required fields exist
      feedback = {
        score: feedback.score || 5,
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
        improvements: Array.isArray(feedback.improvements) ? feedback.improvements : [],
        sampleAnswer: typeof feedback.sampleAnswer === 'string' ? feedback.sampleAnswer.trim() : "",
        tips: Array.isArray(feedback.tips) ? feedback.tips : []
      };
    } catch {
      feedback = {
        score: 5,
        strengths: ["You provided an answer"],
        improvements: ["Try to be more specific", "Use the STAR method for behavioral questions"],
        sampleAnswer: "Unable to generate sample answer. Please try again.",
        tips: ["Use the STAR method for behavioral questions", "Provide specific examples from your experience"]
      };
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Interview feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
