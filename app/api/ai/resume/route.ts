import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import * as z from "zod";

// OWASP: Input validation schema
const resumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().max(20),
    location: z.string().max(200),
    linkedin: z.string().max(500).optional(),
    portfolio: z.string().max(500).optional(),
  }),
  summary: z.string().max(2000),
  hasWorkExperience: z.boolean().optional(),
  experience: z.array(z.object({
    title: z.string().max(100),
    company: z.string().max(100),
    location: z.string().max(200).optional(),
    startDate: z.string().max(50),
    endDate: z.string().max(50).optional(),
    current: z.boolean().optional(),
    responsibilities: z.string().max(2000),
  })).max(10).optional(),
  education: z.array(z.object({
    degree: z.string().max(100),
    institution: z.string().max(200),
    field: z.string().max(100),
    graduationYear: z.string().max(10),
    gpa: z.string().max(10).optional(),
    coursework: z.string().max(500).optional(),
    achievements: z.string().max(500).optional(),
  })).max(5),
  skills: z.object({
    technical: z.string().max(1000),
    soft: z.string().max(500).optional(),
    languages: z.array(z.object({
      language: z.string().max(50),
      proficiency: z.string().max(50),
    })).max(10).optional(),
    tools: z.string().max(500).optional(),
    certifications: z.string().max(500).optional(),
  }),
  hasProjects: z.boolean().optional(),
  projects: z.array(z.object({
    title: z.string().max(100),
    description: z.string().max(500),
    technologies: z.string().max(200),
    link: z.string().max(500).optional(),
    duration: z.string().max(50).optional(),
  })).max(5).optional(),
  hasVolunteer: z.boolean().optional(),
  volunteer: z.array(z.object({
    organization: z.string().max(100),
    role: z.string().max(100),
    duration: z.string().max(50),
    description: z.string().max(500),
  })).max(5).optional(),
  hasAwards: z.boolean().optional(),
  awards: z.array(z.object({
    title: z.string().max(100),
    issuer: z.string().max(100).optional(),
    date: z.string().max(50).optional(),
  })).max(5).optional(),
  publications: z.string().max(1000).optional(),
  hobbies: z.string().max(500).optional(),
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
    const validatedData = resumeSchema.parse(body);
    
    const {
      personalInfo,
      summary,
      hasWorkExperience,
      experience,
      education,
      skills,
      hasProjects,
      projects,
      hasVolunteer,
      volunteer,
      hasAwards,
      awards,
      publications,
      hobbies
    } = validatedData;

    // Build the prompt with user data
    const userDataPrompt = `
Generate a professional, ATS-optimized resume with the following information:

PERSONAL INFORMATION:
- Full Name: ${personalInfo.fullName}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone}
- Location: ${personalInfo.location}
${personalInfo.linkedin ? `- LinkedIn: ${personalInfo.linkedin}` : ''}
${personalInfo.portfolio ? `- Portfolio: ${personalInfo.portfolio}` : ''}

PROFESSIONAL SUMMARY:
${summary}

${hasWorkExperience && experience?.length > 0 ? `
WORK EXPERIENCE:
${experience.map((exp: any, i: number) => `
Experience ${i + 1}:
- Job Title: ${exp.title}
- Company: ${exp.company}
- Location: ${exp.location || 'N/A'}
- Duration: ${exp.startDate} to ${exp.current ? 'Present' : exp.endDate}
- Responsibilities/Achievements:
${exp.responsibilities}
`).join('\n')}
` : 'No work experience yet - focus on education, skills, and projects.'}

EDUCATION:
${education.map((edu: any, i: number) => `
Education ${i + 1}:
- Degree: ${edu.degree}
- Institution: ${edu.institution}
- Field of Study: ${edu.field}
- Graduation Year: ${edu.graduationYear}
${edu.gpa ? `- GPA: ${edu.gpa}` : ''}
${edu.coursework ? `- Relevant Coursework: ${edu.coursework}` : ''}
${edu.achievements ? `- Academic Achievements: ${edu.achievements}` : ''}
`).join('\n')}

SKILLS:
- Technical Skills: ${skills.technical}
${skills.soft ? `- Soft Skills: ${skills.soft}` : ''}
${skills.languages?.length > 0 ? `- Languages: ${skills.languages.map((l: any) => `${l.language} (${l.proficiency})`).join(', ')}` : ''}
${skills.tools ? `- Tools & Technologies: ${skills.tools}` : ''}
${skills.certifications ? `- Certifications: ${skills.certifications}` : ''}

${hasProjects && projects?.length > 0 ? `
PROJECTS:
${projects.map((proj: any, i: number) => `
Project ${i + 1}:
- Title: ${proj.title}
- Description: ${proj.description}
- Technologies: ${proj.technologies}
${proj.link ? `- Link: ${proj.link}` : ''}
${proj.duration ? `- Duration: ${proj.duration}` : ''}
`).join('\n')}
` : ''}

${hasVolunteer && volunteer?.length > 0 ? `
VOLUNTEER WORK:
${volunteer.map((vol: any, i: number) => `
Volunteer ${i + 1}:
- Organization: ${vol.organization}
- Role: ${vol.role}
- Duration: ${vol.duration}
- Description: ${vol.description}
`).join('\n')}
` : ''}

${hasAwards && awards?.length > 0 ? `
AWARDS & ACHIEVEMENTS:
${awards.map((award: any) => `
- ${award.title}${award.issuer ? ` from ${award.issuer}` : ''}${award.date ? ` (${award.date})` : ''}
`).join('\n')}
` : ''}

${publications ? `
PUBLICATIONS:
${publications}
` : ''}

${hobbies ? `
INTERESTS:
${hobbies}
` : ''}

IMPORTANT: 
- Create a clean, ATS-friendly format
- Use strong action verbs
- Quantify achievements where possible
- If no work experience, emphasize education, projects, and skills
- Make the summary compelling and tailored to job searching
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.resumeBuilder },
      { role: "user" as const, content: userDataPrompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.6, maxTokens: 4096 });
    
    // Try to parse as JSON, or return as text
    let parsedResult;
    try {
      // Extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = { rawText: result };
      }
    } catch {
      parsedResult = { rawText: result };
    }

    return NextResponse.json({ success: true, resume: parsedResult });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
