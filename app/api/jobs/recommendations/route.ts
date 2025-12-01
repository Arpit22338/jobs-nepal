import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user skills
  const userProfile = await prisma.jobSeekerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile || !userProfile.skills) {
    return NextResponse.json({ jobs: [] });
  }

  const userSkills = userProfile.skills.toLowerCase().split(",").map(s => s.trim()).filter(s => s.length > 0);

  if (userSkills.length === 0) {
      return NextResponse.json({ jobs: [] });
  }

  // Get all jobs (or recent ones)
  const jobs = await prisma.job.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
        employer: {
            include: { employerProfile: true }
        }
    }
  });

  // Simple scoring
  const scoredJobs = jobs.map(job => {
    let score = 0;
    const jobText = (job.title + " " + job.description + " " + (job.requiredSkills || "")).toLowerCase();
    
    userSkills.forEach(skill => {
      if (jobText.includes(skill)) {
        score += 1;
      }
    });

    return { ...job, score };
  });

  // Filter and sort
  const recommendedJobs = scoredJobs
    .filter(job => job.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return NextResponse.json({ jobs: recommendedJobs });
}
