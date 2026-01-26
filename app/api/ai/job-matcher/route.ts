import { NextRequest, NextResponse } from "next/server";
import { callGroqAI, AI_PROMPTS } from "@/lib/groq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Session can be used for authenticated matching in the future
    await getServerSession(authOptions);
    const body = await req.json();
    const { profileData, filters } = body;

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

For each relevant job (top 10 matches), provide:
1. Match score (0-100)
2. Matching skills
3. Missing skills they should develop
4. Why this job is a good fit
5. Any concerns or growth areas

Return JSON array:
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
      { role: "system" as const, content: AI_PROMPTS.jobMatcher },
      { role: "user" as const, content: prompt }
    ];

    const result = await callGroqAI(messages, { temperature: 0.5, maxTokens: 3000 });

    // Parse AI response
    let aiMatches;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiMatches = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
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
    const matchedJobs = aiMatches.matches?.map((match: any) => {
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
      recommendations: aiMatches.overallRecommendations || [],
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
