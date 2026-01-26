import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import * as z from "zod";

// OWASP A03: Input validation schema
const interviewGenerateSchema = z.object({
  jobTitle: z.string().min(2).max(100),
  experienceLevel: z.string().max(50),
  industry: z.string().max(100).optional(),
  companyName: z.string().max(100).optional(),
  focusTopics: z.array(z.string().max(100)).max(10).optional(),
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
  if (limit.count >= 10) return false;
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
    const validatedData = interviewGenerateSchema.parse(body);
    
    const { jobTitle, experienceLevel, industry, companyName, focusTopics } = validatedData;

    const prompt = `
Generate comprehensive interview questions for the following role:

Job Title/Role: ${jobTitle}
Experience Level: ${experienceLevel}
${industry ? `Industry: ${industry}` : ''}
${companyName ? `Company: ${companyName}` : ''}
${focusTopics?.length > 0 ? `Focus Topics/Skills: ${focusTopics.join(', ')}` : ''}

Requirements:
- Generate 15-20 high-quality interview questions
- Include a mix of behavioral (STAR method), technical, situational, and culture fit questions
- For each question, provide a brief tip on how to approach answering it
- Tailor questions to the experience level
- If a company is mentioned, include 2-3 company-specific questions
- Focus on the specified topics/skills if provided

IMPORTANT: Return ONLY a valid JSON object (no markdown, no code blocks, no extra text).
Return in this exact JSON format:
{
  "behavioral": [{"question": "...", "tip": "..."}],
  "technical": [{"question": "...", "tip": "..."}],
  "situational": [{"question": "...", "tip": "..."}],
  "cultureFit": [{"question": "...", "tip": "..."}],
  "careerGoals": [{"question": "...", "tip": "..."}]
}
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.interviewPrep + "\n\nIMPORTANT: Always return ONLY valid JSON without markdown code blocks or any other text." },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.7, maxTokens: 3000 });

    // Parse JSON response
    let questions;
    try {
      questions = parseAIResponse(result);
    } catch {
      // Fallback: return as structured data
      questions = {
        behavioral: [{ question: result, tip: "Think about specific examples from your experience" }],
        technical: [],
        situational: [],
        cultureFit: [],
        careerGoals: []
      };
    }

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Interview prep error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
