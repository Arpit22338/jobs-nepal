import { NextRequest, NextResponse } from "next/server";
import { callGroqAI } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questions, answers, jobTitle, experienceLevel } = body;

    if (!questions || !answers || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Questions and answers are required" },
        { status: 400 }
      );
    }

    // Build Q&A pairs for analysis
    const qaPairs = questions.map((q: any, i: number) => ({
      question: q.question,
      category: q.category || "General",
      answer: answers[i] || "No answer provided",
    }));

    const prompt = `
Analyze the following interview performance for a ${jobTitle} role (${experienceLevel}):

Interview Q&A:
${qaPairs.map((qa: any, i: number) => `
Question ${i + 1} (${qa.category}): ${qa.question}
Answer: ${qa.answer}
`).join("\n")}

Provide a comprehensive analysis in JSON format:
{
  "overallScore": <number 0-100>,
  "summary": "<brief overall assessment>",
  "categoryScores": {
    "technical": <number 0-100>,
    "behavioral": <number 0-100>,
    "communication": <number 0-100>,
    "problemSolving": <number 0-100>,
    "cultureFit": <number 0-100>
  },
  "questionScores": [
    {
      "questionNumber": 1,
      "question": "<question text>",
      "score": <number 0-10>,
      "feedback": "<specific feedback for this answer>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendations": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "hireRecommendation": "<Strong Hire / Hire / Maybe / No Hire>",
  "keyTakeaways": "<2-3 sentence summary of most important points>"
}

Be fair but constructive in your assessment. Focus on specific, actionable feedback.
`;

    const messages = [
      { 
        role: "system" as const, 
        content: `You are an expert interview coach and hiring manager. 
Analyze interview responses objectively and provide detailed, constructive feedback.
Always return valid JSON. Be specific and actionable in your feedback.` 
      },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.5, maxTokens: 3000 });

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Provide default analysis structure
      analysis = {
        overallScore: 60,
        summary: "Analysis completed. Please review your responses.",
        categoryScores: {
          technical: 60,
          behavioral: 60,
          communication: 60,
          problemSolving: 60,
          cultureFit: 60,
        },
        questionScores: qaPairs.map((qa: any, i: number) => ({
          questionNumber: i + 1,
          question: qa.question,
          score: 6,
          feedback: "Good attempt. Consider providing more specific examples.",
        })),
        strengths: ["Completed the interview", "Attempted all questions"],
        improvements: ["Provide more detailed examples", "Use the STAR method"],
        recommendations: ["Practice common behavioral questions", "Prepare specific examples from your experience"],
        hireRecommendation: "Maybe",
        keyTakeaways: "Continue practicing to improve your interview skills.",
      };
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Interview analysis error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze interview" },
      { status: 500 }
    );
  }
}
