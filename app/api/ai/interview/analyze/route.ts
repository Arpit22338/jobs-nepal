import { NextRequest, NextResponse } from "next/server";
import { callGroqAI } from "@/lib/groq";

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

Provide a comprehensive analysis.

IMPORTANT: Return ONLY a valid JSON object (no markdown, no code blocks, no extra text).
Return in this exact JSON format:
{
  "overallScore": 75,
  "summary": "brief overall assessment",
  "categoryScores": {
    "technical": 70,
    "behavioral": 75,
    "communication": 80,
    "problemSolving": 70,
    "cultureFit": 75
  },
  "questionScores": [
    {
      "questionNumber": 1,
      "question": "question text",
      "score": 7,
      "feedback": "specific feedback for this answer"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "recommendations": ["tip 1", "tip 2", "tip 3"],
  "hireRecommendation": "Hire",
  "keyTakeaways": "2-3 sentence summary of most important points"
}

Be fair but constructive in your assessment. Focus on specific, actionable feedback.
`;

    const messages = [
      { 
        role: "system" as const, 
        content: `You are an expert interview coach and hiring manager. 
Analyze interview responses objectively and provide detailed, constructive feedback.
IMPORTANT: Always return ONLY valid JSON without markdown code blocks or any other text.
Be specific and actionable in your feedback.` 
      },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.5, maxTokens: 3000 });

    // Parse JSON response
    let analysis;
    try {
      analysis = parseAIResponse(result);
      
      // Ensure required fields exist with proper types
      analysis = {
        overallScore: analysis.overallScore || 60,
        summary: analysis.summary || "Analysis completed.",
        categoryScores: {
          technical: analysis.categoryScores?.technical || 60,
          behavioral: analysis.categoryScores?.behavioral || 60,
          communication: analysis.categoryScores?.communication || 60,
          problemSolving: analysis.categoryScores?.problemSolving || 60,
          cultureFit: analysis.categoryScores?.cultureFit || 60,
        },
        questionScores: Array.isArray(analysis.questionScores) ? analysis.questionScores : [],
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        hireRecommendation: analysis.hireRecommendation || "Maybe",
        keyTakeaways: analysis.keyTakeaways || "Continue practicing to improve.",
      };
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
