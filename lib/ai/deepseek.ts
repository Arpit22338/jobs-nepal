// DeepSeek API Wrapper - The "Brain" for reasoning/logic tasks
// Used for: Interview questions, CV generation, skill analysis, answer evaluation

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat"; // DeepSeek-V3

interface DeepSeekMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface DeepSeekResponse {
    id: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface InterviewQuestion {
    question: string;
    timer: number; // seconds
    category: string;
    difficulty: "easy" | "medium" | "hard";
}

export interface AnswerFeedback {
    score: number;
    strengths: string[];
    improvements: string[];
    sampleAnswer: string;
}

// Core DeepSeek API call
export async function callDeepSeek(
    messages: DeepSeekMessage[],
    options: {
        temperature?: number;
        maxTokens?: number;
        jsonMode?: boolean;
    } = {}
): Promise<string> {
    const { temperature = 0.7, maxTokens = 4096, jsonMode = false } = options;

    if (!DEEPSEEK_API_KEY) {
        throw new Error("DEEPSEEK_API_KEY not configured");
    }

    const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages,
            temperature,
            max_tokens: maxTokens,
            response_format: jsonMode ? { type: "json_object" } : undefined,
        }),
    });

    if (response.status === 429) {
        throw new Error("DEEPSEEK_RATE_LIMIT");
    }

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || "";
}

// Generate interview question with timer
export async function generateInterviewQuestion(
    jobTitle: string,
    experienceLevel: string,
    previousQuestions: string[] = [],
    category?: string
): Promise<InterviewQuestion> {
    const systemPrompt = `You are an expert technical interviewer for ${jobTitle} positions at ${experienceLevel} level.
Generate a challenging but fair interview question.

Return ONLY valid JSON in this exact format:
{
  "question": "The interview question text",
  "timer": 120,
  "category": "technical|behavioral|situational|problem-solving",
  "difficulty": "easy|medium|hard"
}

Timer guidelines:
- Easy questions: 60-90 seconds
- Medium questions: 90-150 seconds  
- Hard questions: 150-300 seconds
- Behavioral questions: 120-180 seconds

Do NOT repeat any of these questions: ${previousQuestions.join(", ")}`;

    const userPrompt = category
        ? `Generate a ${category} interview question.`
        : `Generate the next interview question. Mix categories for a comprehensive assessment.`;

    const result = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ], { temperature: 0.8, jsonMode: true });

    try {
        const parsed = JSON.parse(result);
        return {
            question: parsed.question || "Tell me about yourself.",
            timer: Math.min(Math.max(parsed.timer || 120, 30), 300), // 30-300 seconds
            category: parsed.category || "general",
            difficulty: parsed.difficulty || "medium"
        };
    } catch {
        return {
            question: "Tell me about a challenging project you've worked on and how you handled it.",
            timer: 120,
            category: "behavioral",
            difficulty: "medium"
        };
    }
}

// Evaluate interview answer
export async function evaluateAnswer(
    question: string,
    answer: string,
    jobTitle: string,
    timeSpent: number,
    timeLimit: number
): Promise<AnswerFeedback> {
    const systemPrompt = `You are an expert interview coach evaluating a candidate for ${jobTitle}.
Analyze the answer objectively and provide constructive feedback.

Return ONLY valid JSON:
{
  "score": 7,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "sampleAnswer": "A better answer would be..."
}

Score from 1-10. Consider:
- Relevance to question
- Clarity and structure (STAR method for behavioral)
- Specific examples provided
- Time management (used ${timeSpent}s of ${timeLimit}s allowed)`;

    const result = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Question: ${question}\n\nCandidate's Answer: ${answer || "(No answer provided - candidate ran out of time)"}` }
    ], { temperature: 0.5, jsonMode: true });

    try {
        const parsed = JSON.parse(result);
        return {
            score: Math.min(Math.max(parsed.score || 5, 1), 10),
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Attempted the question"],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Provide more detail"],
            sampleAnswer: parsed.sampleAnswer || "A strong answer would include specific examples."
        };
    } catch {
        return {
            score: 5,
            strengths: ["Completed the interview"],
            improvements: ["Provide more detailed responses"],
            sampleAnswer: "Focus on specific examples and use the STAR method."
        };
    }
}

// Generate ATS-optimized CV
export async function generateCV(userProfile: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: any[];
    education: any[];
    summary?: string;
}): Promise<any> {
    const systemPrompt = `You are an expert CV writer creating ATS-optimized resumes.
Create a professional, keyword-rich CV that will pass ATS systems.

Return ONLY valid JSON matching this structure:
{
  "header": { "name": "", "email": "", "phone": "", "location": "" },
  "summary": "Professional summary...",
  "experience": [{ "title": "", "company": "", "duration": "", "achievements": [] }],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "skills": { 
    "technical": [], 
    "soft": [], 
    "tools": [],
    "languages": [{ "language": "Language Name", "proficiency": "Proficiency Level" }] 
  },
  "keywords": ["ATS keywords extracted from content"]
}`;

    const result = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a CV for: ${JSON.stringify(userProfile)}` }
    ], { temperature: 0.6, jsonMode: true, maxTokens: 4096 });

    try {
        return JSON.parse(result);
    } catch {
        throw new Error("Failed to generate CV");
    }
}

// Skills gap analysis
export async function analyzeSkillsGap(
    userSkills: string[],
    targetJobDescription: string
): Promise<{
    matchPercentage: number;
    matchingSkills: string[];
    missingSkills: { skill: string; priority: string; learningTime: string }[];
    recommendations: string[];
}> {
    const systemPrompt = `You are a career advisor analyzing skills gaps.
Compare the user's skills with job requirements and provide actionable insights.

Return ONLY valid JSON:
{
  "matchPercentage": 75,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": [
    { "skill": "Required Skill", "priority": "high|medium|low", "learningTime": "2-4 weeks" }
  ],
  "recommendations": ["specific recommendation 1", "recommendation 2"]
}`;

    const result = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Skills: ${userSkills.join(", ")}\n\nTarget Job:\n${targetJobDescription}` }
    ], { temperature: 0.4, jsonMode: true });

    try {
        const parsed = JSON.parse(result);
        return {
            matchPercentage: parsed.matchPercentage || 50,
            matchingSkills: parsed.matchingSkills || [],
            missingSkills: parsed.missingSkills || [],
            recommendations: parsed.recommendations || []
        };
    } catch {
        return {
            matchPercentage: 50,
            matchingSkills: userSkills.slice(0, 3),
            missingSkills: [{ skill: "Review job posting", priority: "high", learningTime: "Varies" }],
            recommendations: ["Compare your skills against the job requirements"]
        };
    }
}

export { DEEPSEEK_API_KEY };
