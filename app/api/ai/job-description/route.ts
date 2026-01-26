import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body;

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
