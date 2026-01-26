import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, style, manualData } = body;

    let profileData = manualData;

    // If mode is "auto", fetch user's profile data
    if (mode === "auto") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Authentication required for auto-generate" },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        include: {
          jobSeekerProfile: true,
          employerProfile: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      // Build profile data from database
      const profile = user.jobSeekerProfile || user.employerProfile;
      const jobSeekerProfile = user.jobSeekerProfile;
      profileData = {
        name: user.name || "Professional",
        title: (profile as any)?.experience?.split('\n')?.[0] || "Professional",
        skills: (profile as any)?.skills?.split(',').slice(0, 5) || [],
        experience: jobSeekerProfile?.bio?.length ? "Experienced" : "Entry Level",
        achievement: "",
        industry: "",
      };
    }

    const prompt = `
Generate 3 professional bio variations for the following person:

Name: ${profileData.name}
Current/Desired Job Title: ${profileData.title}
Top Skills: ${Array.isArray(profileData.skills) ? profileData.skills.join(', ') : profileData.skills}
Years of Experience: ${profileData.experience}
${profileData.achievement ? `Key Achievement: ${profileData.achievement}` : ''}
${profileData.industry ? `Industry: ${profileData.industry}` : ''}

Bio Style Preference: ${style || 'all three styles'}

Requirements:
- Each bio should be 2-3 sentences
- Professional bio: formal, corporate tone suitable for LinkedIn
- Casual bio: friendly, approachable tone for personal websites
- Creative bio: unique, personality-driven for standing out

Return as JSON:
{
  "professional": "...",
  "casual": "...",
  "creative": "..."
}
`;

    const messages = [
      { role: "system" as const, content: AI_PROMPTS.bioGenerator },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.8, maxTokens: 1024 });

    // Parse JSON response
    let bios;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        bios = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      bios = {
        professional: result,
        casual: result,
        creative: result
      };
    }

    return NextResponse.json({ success: true, bios });
  } catch (error) {
    console.error("Bio generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate bio" },
      { status: 500 }
    );
  }
}
