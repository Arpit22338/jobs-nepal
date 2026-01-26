import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body;

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
