import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer, questionType, jobTitle } = body;

    const prompt = `
Analyze this interview answer and provide detailed feedback:

Interview Question: ${question}
Question Type: ${questionType || 'general'}
Job Role: ${jobTitle || 'Professional Role'}

Candidate's Answer:
"${answer}"

Provide comprehensive feedback including:
1. A score from 1-10
2. Specific strengths in the answer
3. Areas that need improvement
4. A better sample answer (2-3 paragraphs)
5. Tips for improvement (especially STAR method tips if behavioral question)

Be constructive, encouraging, and specific in your feedback.
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.interviewFeedback },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.6, maxTokens: 2000 });

    // Parse JSON response
    let feedback;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      feedback = {
        score: 5,
        strengths: ["You provided an answer"],
        improvements: ["Try to be more specific"],
        sampleAnswer: result,
        tips: ["Use the STAR method for behavioral questions"]
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
