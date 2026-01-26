import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      currentTitle, 
      currentSkills, 
      yearsExperience, 
      education,
      targetRole,
      targetIndustry,
      timeline
    } = body;

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

Return in JSON format.
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.skillsGap },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.6, maxTokens: 4000 });

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
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
