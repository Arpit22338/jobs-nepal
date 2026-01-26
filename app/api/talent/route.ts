import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const talentPostSchema = z.object({
  title: z.string().min(5),
  bio: z.string().min(20),
  skills: z.string().min(2),
  // New optional fields
  specialty: z.string().optional(),
  yearsExperience: z.string().optional(),
  currentStatus: z.string().optional(),
  availability: z.array(z.string()).optional(),
  expectedSalary: z.string().optional(),
  hideSalary: z.boolean().optional(),
  preferredJobTypes: z.array(z.string()).optional(),
  preferredIndustries: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  education: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  institution: z.string().optional(),
  portfolioUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  behanceUrl: z.string().optional(),
  otherLinks: z.string().optional(),
  certifications: z.string().optional(),
  languages: z.array(z.object({ language: z.string(), proficiency: z.string() })).optional(),
  achievements: z.string().optional(),
});

export async function GET() {
  try {
    const posts = await (prisma as any).talentPost.findMany({
      include: {
        user: {
          include: {
            jobSeekerProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "JOBSEEKER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const count = await prisma.talentPost.count({ where: { userId: user.id } });
    if (count >= (user as any).talentLimit) {
        return NextResponse.json({ message: `Limit reached (${(user as any).talentLimit}). Upgrade to Premium.` }, { status: 403 });
    }

    const body = await req.json();
    const validated = talentPostSchema.parse(body);

    // Store additional data as JSON in bio or separate fields if schema supports
    const extendedData = {
      specialty: validated.specialty,
      yearsExperience: validated.yearsExperience,
      currentStatus: validated.currentStatus,
      availability: validated.availability,
      expectedSalary: validated.hideSalary ? null : validated.expectedSalary,
      preferredJobTypes: validated.preferredJobTypes,
      preferredIndustries: validated.preferredIndustries,
      preferredLocations: validated.preferredLocations,
      education: validated.education,
      fieldOfStudy: validated.fieldOfStudy,
      institution: validated.institution,
      portfolioUrl: validated.portfolioUrl,
      linkedinUrl: validated.linkedinUrl,
      githubUrl: validated.githubUrl,
      behanceUrl: validated.behanceUrl,
      otherLinks: validated.otherLinks,
      certifications: validated.certifications,
      languages: validated.languages,
      achievements: validated.achievements,
    };

    const post = await (prisma as any).talentPost.create({
      data: {
        userId: session.user.id,
        title: validated.title,
        bio: validated.bio,
        skills: validated.skills,
        // Store extended data as JSON string if needed
        metadata: JSON.stringify(extendedData),
      },
    });

    return NextResponse.json({ post, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: (error as any).errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
