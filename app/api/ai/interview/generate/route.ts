import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobTitle, experienceLevel, industry, companyName, focusTopics } = body;

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

Return in JSON format with categorized questions.
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.interviewPrep },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.7, maxTokens: 3000 });

    // Parse JSON response
    let questions;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
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
