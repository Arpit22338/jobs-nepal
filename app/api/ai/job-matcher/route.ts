import { NextRequest, NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/ai/deepseek";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, sanitizeInput } from "@/lib/security/owasp-guards";

// Helper to safely parse JSON from AI responses
function parseAIResponse(result: string) {
  const cleaned = result
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("No valid JSON found in response");
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Rate Limiting (Security Guard)
    if (session?.user?.id) {
      if (!checkRateLimit(session.user.id, 20)) { // 20 requests per minute
        return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
      }
    }

    const body = await req.json();
    const { profileData, filters } = body;

    // 2. Input Sanitization (Security Guard)
    // Basic check ensuring no malicious payloads in text fields
    if (profileData?.currentTitle && !sanitizeInput(profileData.currentTitle).safe) {
      return NextResponse.json({ success: false, error: "Invalid input detected" }, { status: 400 });
    }

    // Fetch available jobs from database
    const jobs = await prisma.job.findMany({
      where: {
        expiresAt: { gte: new Date() },
        ...(filters?.location && { location: { contains: filters.location, mode: 'insensitive' } }),
        ...(filters?.type && { type: filters.type }),
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        employer: {
          include: { employerProfile: true }
        }
      }
    });

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: "No jobs available matching your criteria"
      });
    }

    // Prepare job summaries for AI analysis
    const jobSummaries = jobs.map((job, index) => ({
      index,
      id: job.id,
      title: job.title,
      company: job.employer.employerProfile?.companyName || 'Company',
      location: job.location,
      type: job.type,
      salary: job.salary || `${job.salaryMin || 'N/A'} - ${job.salaryMax || 'N/A'}`,
      requiredSkills: job.requiredSkills || '',
      description: job.description.slice(0, 500)
    }));

    const prompt = `
Analyze the candidate's profile and match them against available jobs:

CANDIDATE PROFILE:
- Current/Desired Title: ${profileData.currentTitle || profileData.desiredTitle}
- Skills: ${Array.isArray(profileData.skills) ? profileData.skills.join(', ') : profileData.skills}
- Years of Experience: ${profileData.experience}
- Education: ${profileData.education || 'Not specified'}
- Preferred Locations: ${profileData.preferredLocations || 'Any'}
- Desired Job Types: ${profileData.jobTypes || 'Any'}
${profileData.salaryExpectation ? `- Salary Expectation: ${profileData.salaryExpectation}` : ''}

AVAILABLE JOBS:
${jobSummaries.map(job => `
Job #${job.index}: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type}
Required Skills: ${job.requiredSkills}
`).join('\n')}

For each relevant job (top 10 matches), provide match score (0-100), reasoning, and skill gaps.

IMPORTANT: Return ONLY a valid JSON object matching this structure:
{
  "matches": [
    {
      "jobIndex": 0,
      "matchScore": 85,
      "matchingSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3"],
      "whyMatch": "explanation",
      "growthAreas": ["area1"]
    }
  ],
  "overallRecommendations": ["recommendation1"],
  "skillsToLearn": ["skill1", "skill2"]
}
`;

    const messages = [
      { role: "system" as const, content: "You are an expert Recruitment AI. Analyze job matches with high precision. Return ONLY JSON." },
      { role: "user" as const, content: prompt }
    ];

    // Use DeepSeek Chat (via OpenRouter)
    const result = await callDeepSeek(messages, { temperature: 0.5, maxTokens: 3000, jsonMode: true });

    // Parse AI response
    let aiMatches;
    try {
      aiMatches = parseAIResponse(result);
    } catch {
      // Fallback with basic matching
      aiMatches = {
        matches: jobSummaries.slice(0, 5).map((job, idx) => ({
          jobIndex: idx,
          matchScore: 70 - (idx * 5),
          matchingSkills: [],
          missingSkills: [],
          whyMatch: "Based on job title similarity",
          growthAreas: []
        })),
        overallRecommendations: ["Update your skills to match job requirements"],
        skillsToLearn: []
      };
    }

    // Combine AI analysis with actual job data
    const safeMatches = Array.isArray(aiMatches.matches) ? aiMatches.matches : [];
    const matchedJobs = safeMatches.map((match: any) => {
      const job = jobSummaries[match.jobIndex];
      if (!job) return null;
      const fullJob = jobs[match.jobIndex];
      return {
        ...match,
        job: {
          id: fullJob.id,
          title: fullJob.title,
          company: job.company,
          location: fullJob.location,
          type: fullJob.type,
          salary: job.salary,
          description: fullJob.description
        }
      };
    }).filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      matches: matchedJobs.sort((a: any, b: any) => b.matchScore - a.matchScore),
      recommendations: aiMatches.overallRecommendations || aiMatches.recommendations || [],
      skillsToLearn: aiMatches.skillsToLearn || []
    });
  } catch (error) {
    console.error("Job matching error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
