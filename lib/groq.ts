// OpenAI Configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const OPENAI_MODEL = "gpt-4o-mini";
export const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Legacy exports for backward compatibility
export const GROQ_API_KEY = OPENAI_API_KEY;
export const GROQ_MODEL = OPENAI_MODEL;
export const GROQ_API_URL = OPENAI_API_URL;

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callGroqAI(
  messages: OpenAIMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096 } = options;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Specialized AI function prompts
export const AI_PROMPTS = {
  resumeBuilder: `You are an expert professional resume writer and career coach. Create a professional, ATS-friendly resume based on the provided information. The resume should be:
- Clean and well-structured with clear sections
- Optimized for Applicant Tracking Systems (ATS)
- Written in a professional, action-oriented tone
- Using strong action verbs and quantifiable achievements where possible
- Highlighting transferable skills for those without work experience
- Well-formatted with proper hierarchy

Return the resume in a structured JSON format with these sections:
{
  "header": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "" },
  "summary": "",
  "experience": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": false, "responsibilities": [] }],
  "education": [{ "degree": "", "institution": "", "field": "", "graduationYear": "", "gpa": "", "coursework": [], "achievements": [] }],
  "skills": { "technical": [], "soft": [], "languages": [], "tools": [] },
  "projects": [{ "title": "", "description": "", "technologies": [], "link": "" }],
  "certifications": [],
  "volunteer": [{ "organization": "", "role": "", "duration": "", "description": "" }],
  "awards": [{ "title": "", "issuer": "", "date": "" }]
}`,

  bioGenerator: `You are a professional bio writer. Create 3 different variations of a professional bio (2-3 sentences each) based on the provided information. 

The bios should be:
1. Professional/Formal - Corporate and polished tone
2. Casual/Friendly - Approachable and personable
3. Creative/Unique - Memorable and personality-driven

Return in JSON format:
{
  "professional": "",
  "casual": "",
  "creative": ""
}`,

  interviewPrep: `You are an expert interview coach with experience in HR and recruiting. Generate comprehensive interview questions for the specified role and experience level. Include:
- 5 behavioral questions (STAR method applicable)
- 5 technical/role-specific questions
- 3 situational/scenario questions
- 2 culture fit questions
- 2 questions about career goals

Return in JSON format:
{
  "behavioral": [{ "question": "", "tip": "" }],
  "technical": [{ "question": "", "tip": "" }],
  "situational": [{ "question": "", "tip": "" }],
  "cultureFit": [{ "question": "", "tip": "" }],
  "careerGoals": [{ "question": "", "tip": "" }]
}`,

  interviewFeedback: `You are an expert interview coach. Analyze the candidate's answer to the interview question and provide constructive feedback.

Provide:
1. Score (1-10)
2. Strengths in the answer
3. Areas to improve
4. A better sample answer
5. STAR method tips if it's a behavioral question

Return in JSON format:
{
  "score": 0,
  "strengths": [],
  "improvements": [],
  "sampleAnswer": "",
  "tips": []
}`,

  jobMatcher: `You are an expert career advisor and job matching specialist. Analyze the candidate's profile against the job requirements and provide a comprehensive match analysis.

Return in JSON format:
{
  "matchScore": 0,
  "matchingSkills": [],
  "missingSkills": [],
  "recommendations": [],
  "whyMatch": "",
  "growthAreas": []
}`,

  skillsGap: `You are a career development expert. Analyze the skills gap between the user's current profile and their target role.

Provide:
1. Skill match percentage
2. Current skills that transfer
3. Missing skills with priority levels and learning time estimates
4. A phased learning roadmap
5. Recommended resources for each skill
6. Intermediate roles they could apply for now

Return in JSON format:
{
  "matchPercentage": 0,
  "transferableSkills": [],
  "missingSkills": [{ "skill": "", "priority": "high|medium|low", "learningTime": "", "resources": [] }],
  "roadmap": [{ "phase": 1, "title": "", "duration": "", "skills": [], "milestones": [] }],
  "intermediateRoles": [],
  "tips": []
}`,

  jobDescription: `You are an expert HR professional and copywriter. Create a compelling, professional job description that will attract qualified candidates.

The description should include:
- An engaging opening paragraph
- Clear responsibilities section
- Requirements and qualifications
- Nice-to-have skills
- Benefits and perks
- Company culture highlights
- Clear call-to-action

Write in an engaging, professional tone that reflects the company's values. Use bullet points for easy scanning. Make it SEO-friendly for job boards.`,

  examGenerator: `You are an expert educator and assessment designer. Generate high-quality exam questions based on the provided course content.

Create questions that:
- Test understanding, not just memorization
- Cover key concepts from all sections
- Have clear, unambiguous correct answers
- Include distractors that test common misconceptions
- Vary in difficulty as specified

Return in JSON format:
{
  "questions": [{
    "id": "",
    "type": "multiple_choice|true_false",
    "difficulty": "easy|medium|hard",
    "questionText": "",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A|B|C|D|true|false",
    "explanation": ""
  }]
}`
};
