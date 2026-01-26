import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import * as z from "zod";

// OWASP A03: Input validation schema
const jobDescriptionSchema = z.object({
  jobTitle: z.string().min(2).max(100),
  department: z.string().max(100).optional(),
  location: z.string().max(200),
  locationType: z.string().max(50),
  employmentType: z.string().max(50),
  experienceLevel: z.string().max(50),
  salaryRange: z.string().max(100).optional(),
  requiredSkills: z.union([z.array(z.string().max(100)), z.string().max(1000)]),
  responsibilities: z.union([z.array(z.string().max(200)), z.string().max(2000)]),
  qualifications: z.string().max(1000).optional(),
  niceToHaveSkills: z.string().max(500).optional(),
  benefits: z.string().max(1000).optional(),
  companyValues: z.string().max(500).optional(),
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

export async function POST(req: NextRequest) {
  try {
    // OWASP A01: Authentication check - only employers can generate job descriptions
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
    const validatedData = jobDescriptionSchema.parse(body);
    
    const {
      jobTitle,
      department,
      location,
      locationType,
      employmentType,
      experienceLevel,
      salaryRange,
      requiredSkills,
      responsibilities,
      qualifications,
      niceToHaveSkills,
      benefits,
      companyValues
    } = validatedData;

    const prompt = `
Write a compelling, professional job description for the following position:

JOB DETAILS:
- Job Title: ${jobTitle}
${department ? `- Department/Team: ${department}` : ''}
- Location: ${location} (${locationType})
- Employment Type: ${employmentType}
- Experience Level: ${experienceLevel}
${salaryRange ? `- Salary Range: ${salaryRange}` : ''}

REQUIREMENTS:
- Required Skills: ${Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills}
- Main Responsibilities: ${Array.isArray(responsibilities) ? responsibilities.join('; ') : responsibilities}
${qualifications ? `- Required Qualifications: ${qualifications}` : ''}
${niceToHaveSkills ? `- Nice-to-have Skills: ${niceToHaveSkills}` : ''}

COMPANY INFO:
${benefits ? `- Benefits & Perks: ${Array.isArray(benefits) ? benefits.join(', ') : benefits}` : ''}
${companyValues ? `- Company Culture/Values: ${companyValues}` : ''}

Create a job description that:
1. Starts with an engaging opening paragraph that hooks candidates
2. Clearly outlines the role and impact
3. Lists key responsibilities (use bullet points)
4. Specifies requirements and qualifications
5. Highlights nice-to-have skills
6. Describes benefits and company culture
7. Ends with a clear call-to-action

Make it:
- Professional yet engaging
- SEO-optimized for job boards
- Inclusive and welcoming
- Specific about expectations
- Highlighting growth opportunities

Write the complete job description as formatted text with proper sections and bullet points.
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.jobDescription },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.7, maxTokens: 2000 });

    return NextResponse.json({ 
      success: true, 
      description: result 
    });
  } catch (error) {
    console.error("Job description generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate job description" },
      { status: 500 }
    );
  }
}
