import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import * as z from "zod";

// SECURITY: Input validation schemas
const jobSeekerProfileSchema = z.object({
  image: z.string().max(100000).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.string().max(5000).optional(),
  location: z.string().max(200).optional(),
  experience: z.string().max(5000).optional(),
  education: z.string().max(2000).optional(),
  resumeUrl: z.string().url().max(500).optional().or(z.literal("")),
  portfolioUrl: z.string().url().max(500).optional().or(z.literal("")),
  metadata: z.string().max(50000).optional(), // Extended profile data as JSON
});

const employerProfileSchema = z.object({
  image: z.string().max(100000).optional(),
  companyName: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(200).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  portfolioUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let profileData: any = {};
    if (user.role === "JOBSEEKER" && user.jobSeekerProfile) {
      profileData = { ...user.jobSeekerProfile, image: user.image, isPremium: user.isPremium, premiumExpiresAt: user.premiumExpiresAt };
    } else if (user.role === "EMPLOYER" && user.employerProfile) {
      profileData = { ...user.employerProfile, image: user.image, isPremium: user.isPremium, premiumExpiresAt: user.premiumExpiresAt };
    } else {
      profileData = { image: user.image, isPremium: user.isPremium, premiumExpiresAt: user.premiumExpiresAt };
    }

    return NextResponse.json({ profile: profileData });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { role, id: userId } = session.user as any;

    // SECURITY: Never allow role escalation via profile update
    if (body.role && body.role !== role) {
      return NextResponse.json({ message: "Role changes are not allowed" }, { status: 403 });
    }

    if (role === "JOBSEEKER") {
      const validatedData = jobSeekerProfileSchema.parse(body);
      const { image, bio, skills, location, experience, education, resumeUrl, portfolioUrl, metadata } = validatedData;

      if (image) {
        await prisma.user.update({
          where: { id: userId },
          data: { image } as any,
        });
      }

      await prisma.jobSeekerProfile.upsert({
        where: { userId },
        update: { 
          bio: bio || undefined, 
          skills: skills || undefined, 
          location: location || undefined, 
          experience: experience || undefined, 
          education: education || undefined, 
          resumeUrl: resumeUrl || undefined, 
          portfolioUrl: portfolioUrl || undefined,
          metadata: metadata || undefined,
        } as any,
        create: {
          userId,
          bio,
          skills,
          location,
          experience,
          education,
          resumeUrl,
          portfolioUrl,
          metadata,
        } as any,
      });
    } else if (role === "EMPLOYER") {
      const validatedData = employerProfileSchema.parse(body);
      const { image, companyName, description, location, website, portfolioUrl } = validatedData;

      if (image) {
        await prisma.user.update({
          where: { id: userId },
          data: { image } as any,
        });
      }

      await prisma.employerProfile.upsert({
        where: { userId },
        update: { 
          companyName: companyName || undefined, 
          description: description || undefined, 
          location: location || undefined, 
          website: website || undefined, 
          portfolioUrl: portfolioUrl || undefined 
        } as any,
        create: {
          userId,
          companyName,
          description,
          location,
          website,
          portfolioUrl,
        } as any,
      });
    } else {
      // For TEACHER or ADMIN roles, only allow image update
      const { image } = body;
      if (image && typeof image === 'string' && image.length < 100000) {
        await prisma.user.update({
          where: { id: userId },
          data: { image } as any,
        });
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
