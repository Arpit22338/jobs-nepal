import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import * as z from "zod";

// OWASP A03: Input validation schema
const skillsGapSchema = z.object({
  currentTitle: z.string().max(100).optional(),
  currentSkills: z.union([z.array(z.string().max(100)), z.string().max(1000)]),
  yearsExperience: z.number().min(0).max(50).optional(),
  education: z.string().max(200).optional(),
  targetRole: z.string().max(100),
  targetIndustry: z.string().max(100).optional(),
  timeline: z.string().max(50).optional(),
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
  if (limit.count >= 15) return false;
  limit.count++;
  return true;
}

// Helper to safely parse JSON from AI responses
function parseAIResponse(result: string) {
  const cleaned = result
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

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
    const validatedData = skillsGapSchema.parse(body);
    
    const { 
      currentTitle, 
      currentSkills, 
      yearsExperience, 
      education,
      targetRole,
      targetIndustry,
      timeline
    } = validatedData;

    const prompt = `
Perform a comprehensive skills gap analysis:

CURRENT STATE:
- Current Job Title: ${currentTitle || 'Student/Unemployed'}
- Current Skills: ${Array.isArray(currentSkills) ? currentSkills.join(', ') : currentSkills}
- Years of Experience: ${yearsExperience || 0}
- Education Level: ${education || 'Not specified'}

TARGET STATE:
- Desired Job Title/Role: ${targetRole}
${targetIndustry ? `- Target Industry: ${targetIndustry}` : ''}
- Target Timeline: ${timeline || '6 months'}

Provide a comprehensive analysis including:

1. SKILL MATCH PERCENTAGE - How ready they are for the target role

2. TRANSFERABLE SKILLS - Current skills that apply to the target role

3. MISSING SKILLS with:
   - Priority level (high/medium/low based on how commonly required)
   - Estimated learning time
   - Recommended resources (courses, books, projects)

4. LEARNING ROADMAP divided into phases based on their timeline:
   - Phase titles
   - Skills to learn in each phase
   - Specific milestones and checkpoints

5. INTERMEDIATE ROLES - Positions they could apply for NOW with current skills

6. ACTIONABLE TIPS - Specific advice for their transition

Be specific, practical, and encouraging. Focus on actionable steps.

IMPORTANT: Return ONLY a valid JSON object (no markdown, no code blocks, no extra text).
Return in JSON format.
`;

    const messages = [
      { role: "system" as const, content: `${AI_PROMPTS.skillsGap}\n\nIMPORTANT: Always return ONLY valid JSON without markdown code blocks or any other text.` },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.6, maxTokens: 4000 });

    // Parse JSON response
    let analysis;
    try {
      analysis = parseAIResponse(result);
    } catch {
      analysis = {
        matchPercentage: 50,
        transferableSkills: [],
        missingSkills: [{ skill: "Analysis pending", priority: "high", learningTime: "Varies", resources: [] }],
        roadmap: [{ phase: 1, title: "Foundation", duration: "1-2 months", skills: [], milestones: [] }],
        intermediateRoles: [],
        tips: [result]
      };
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Skills gap analysis error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze skills gap" },
      { status: 500 }
    );
  }
}
