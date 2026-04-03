import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { smartAICall, parseAIJSON } from "@/lib/ai/smart-client";
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
  experience: z
    .array(
      z.object({
        title: z.string().max(100),
        company: z.string().max(100),
        location: z.string().max(200).optional(),
        startDate: z.string().max(50),
        endDate: z.string().max(50).optional(),
        current: z.boolean().optional(),
        responsibilities: z.string().max(2000),
      }),
    )
    .max(10)
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().max(100),
        institution: z.string().max(200),
        field: z.string().max(100).optional(),
        graduationYear: z.string().max(10),
        gpa: z.string().max(10).optional(),
        coursework: z.string().max(500).optional(),
        achievements: z.string().max(500).optional(),
      }),
    )
    .max(5),
  skills: z.object({
    technical: z.string().max(1000),
    soft: z.string().max(500).optional(),
    languages: z
      .array(
        z.object({
          language: z.string().max(50),
          proficiency: z.string().max(50),
        }),
      )
      .max(10)
      .optional(),
    tools: z.string().max(500).optional(),
    certifications: z.string().max(500).optional(),
  }),
  hasProjects: z.boolean().optional(),
  projects: z
    .array(
      z.object({
        title: z.string().max(100),
        description: z.string().max(500),
        technologies: z.string().max(200),
        link: z.string().max(500).optional(),
        duration: z.string().max(50).optional(),
      }),
    )
    .max(5)
    .optional(),
  hasVolunteer: z.boolean().optional(),
  volunteer: z
    .array(
      z.object({
        organization: z.string().max(100),
        role: z.string().max(100),
        duration: z.string().max(50),
        description: z.string().max(500),
      }),
    )
    .max(5)
    .optional(),
  hasAwards: z.boolean().optional(),
  awards: z
    .array(
      z.object({
        title: z.string().max(100),
        issuer: z.string().max(100).optional(),
        date: z.string().max(50).optional(),
      }),
    )
    .max(5)
    .optional(),
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
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 },
      );
    }

    const body = await req.json();
    // OWASP A03: Input validation
    const validatedData = resumeSchema.parse(body);

    // Destructure for prompt clarity
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
      hobbies,
    } = validatedData;

    // Detect languages provided by user
    const userProvidedLanguages =
      skills.languages && skills.languages.length > 0
        ? skills.languages
          .map((l) => `${l.language} (${l.proficiency})`)
          .join(", ")
        : "Not specified";

    // Format experience entries
    const formattedExperience =
      hasWorkExperience && experience && experience.length > 0
        ? experience
          .map(
            (exp) =>
              `- ${exp.title} at ${exp.company}${exp.location ? `, ${exp.location}` : ""}
  Duration: ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || "Present"}
  Responsibilities: ${exp.responsibilities}`,
          )
          .join("\n")
        : "NO WORK EXPERIENCE - Focus on projects, education, and skills instead";

    // Format education entries
    const formattedEducation = education
      .map(
        (edu) =>
          `- ${edu.degree}${edu.field ? ` in ${edu.field}` : ""} at ${edu.institution} (${edu.graduationYear})${edu.gpa ? `, GPA: ${edu.gpa}` : ""}${edu.coursework ? `\n  Relevant Coursework: ${edu.coursework}` : ""}${edu.achievements ? `\n  Achievements: ${edu.achievements}` : ""}`,
      )
      .join("\n");

    // Format projects
    const formattedProjects =
      hasProjects && projects && projects.length > 0
        ? projects
          .map(
            (proj) =>
              `- ${proj.title}${proj.duration ? ` (${proj.duration})` : ""}
  Description: ${proj.description}
  Technologies: ${proj.technologies}${proj.link ? `\n  Link: ${proj.link}` : ""}`,
          )
          .join("\n")
        : "No projects provided";

    // Format volunteer work
    const formattedVolunteer =
      hasVolunteer && volunteer && volunteer.length > 0
        ? volunteer
          .map(
            (vol) =>
              `- ${vol.role} at ${vol.organization} (${vol.duration})
  ${vol.description}`,
          )
          .join("\n")
        : "";

    // Format awards
    const formattedAwards =
      hasAwards && awards && awards.length > 0
        ? awards
          .map(
            (award) =>
              `- ${award.title}${award.issuer ? ` from ${award.issuer}` : ""}${award.date ? ` (${award.date})` : ""}`,
          )
          .join("\n")
        : "";

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) Resume Writer.
Your task is to create a professional, polished resume in JSON format.

CRITICAL RULES - FOLLOW EXACTLY:
1. **USE ONLY PROVIDED DATA**: Use ONLY the information provided. Do NOT invent fake jobs, skills, or achievements.
2. **PROFESSIONAL SUMMARY MUST**:
   - Mention their ACTUAL skills (ALL of them)
   - Mention their ACTUAL certifications by name (e.g. "Cyber Security Career Starter (CCSC) or "Google Data Analytics Certificate etc.")
   - Mention their ACTUAL career interests and goals
   - Reference their education level and field
   - Be SPECIFIC to the person, NOT generic
   - Be written in THIRD PERSON (e.g. "Computer Science student with expertise in...")
   - Be 2-3 sentences maximum
3. **BAD SUMMARY** (too generic, DO NOT write like this):
   "I am a dedicated web developer with a passion for creating things."
4. **GOOD SUMMARY** (specific, mentions real data):
   "Computer Science student specializing in front-end development and cybersecurity. Proficient in HTML, CSS, JavaScript, and React with hands-on experience using Git and Linux. Holds Cyber Security Career Starter (CCSC) certification."
5. **LANGUAGES FORMAT**: Return languages as simple objects with language name only. Do NOT include proficiency levels unless user specifically provided them.
6. **NO EXPERIENCE = FOCUS ON POTENTIAL**: For freshers, emphasize education, certifications, projects, and skills heavily.
7. **INCLUDE ALL PROVIDED INFO**: Include ALL languages, skills, certifications, projects, tools exactly as provided.
8. **ATS-FRIENDLY FORMAT**: Use clear headings, action verbs, standard formatting.
9. **NEVER LEAVE SUMMARY EMPTY**: Always generate a specific, detailed summary based on available info.

RETURN FORMAT - VALID JSON ONLY:
{
  "header": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "" },
  "summary": "2-3 SPECIFIC sentences mentioning their actual skills, certifications, education, and career interests",
  "experience": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": boolean, "responsibilities": ["bullet1", "bullet2"] }],
  "education": [{ "degree": "", "institution": "", "field": "", "graduationYear": "", "gpa": "", "coursework": [], "achievements": [] }],
  "skills": { 
    "technical": ["skill1", "skill2"], 
    "soft": ["skill1", "skill2"], 
    "tools": ["tool1", "tool2"],
    "languages": [{ "language": "English" }, { "language": "Nepali" }]
  },
  "projects": [{ "title": "", "description": "", "technologies": ["tech1"], "link": "" }],
  "certifications": ["Full Certification Name 1"],
  "volunteer": [{ "role": "", "organization": "", "duration": "", "description": "" }],
  "awards": [{ "title": "", "issuer": "", "date": "" }]
}`;

    const userPrompt = `Generate a professional ATS-friendly resume for this person using ONLY the information below.

=== PERSONAL INFORMATION ===
Full Name: ${personalInfo.fullName}
Email: ${personalInfo.email}
Phone: ${personalInfo.phone}
Location: ${personalInfo.location}
LinkedIn: ${personalInfo.linkedin || "Not provided"}
Portfolio: ${personalInfo.portfolio || "Not provided"}

=== PROFESSIONAL SUMMARY (User's Input) ===
${summary || "No summary provided - generate one based on their background"}

=== WORK EXPERIENCE ===
Has Work Experience: ${hasWorkExperience ? "YES" : "NO"}
${formattedExperience}

=== EDUCATION ===
${formattedEducation}

=== SKILLS ===
Technical Skills: ${skills.technical || "Not specified"}
Soft Skills: ${skills.soft || "Not specified"}
Tools: ${skills.tools || "Not specified"}
Certifications: ${skills.certifications || "None"}
Languages: ${userProvidedLanguages}

=== PROJECTS ===
${formattedProjects}

${formattedVolunteer ? `=== VOLUNTEER WORK ===\n${formattedVolunteer}` : ""}

${formattedAwards ? `=== AWARDS & ACHIEVEMENTS ===\n${formattedAwards}` : ""}

${publications ? `=== PUBLICATIONS ===\n${publications}` : ""}

${hobbies ? `=== INTERESTS/HOBBIES ===\n${hobbies}` : ""}

IMPORTANT INSTRUCTIONS:
1. Write a SPECIFIC summary in THIRD PERSON. Mention their ACTUAL skills by name, ACTUAL certifications by full name, education, and career interests/hobbies
2. If they have NO work experience, emphasize their projects, education, certifications, and skills heavily in the summary
3. Include ALL their skills, languages, and certifications EXACTLY as provided - do not skip any
4. Languages should be returned as simple objects: [{ "language": "English" }, { "language": "Nepali" }] - NO proficiency levels
5. Polish the descriptions professionally but keep them accurate to what they provided
6. Return ONLY valid JSON, no markdown, no extra text
7. The summary must be UNIQUE to this person - it should NOT be reusable for anyone else`;

    // Use Smart Client (DeepSeek R1 preferred for strong logic/formatting)
    const result = await smartAICall(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        modelType: "reasoner", // Use DeepSeek R1 for reasoning about ATS rules
        temperature: 0.4, // Slightly higher for more personalized output
        jsonMode: true,
      },
    );

    const parsedResume = parseAIJSON(result);

    return NextResponse.json({ success: true, resume: parsedResume });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate resume" },
      { status: 500 },
    );
  }
}
