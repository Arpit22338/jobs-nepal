import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

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
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
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
    const { image } = body;

    console.log("Updating profile for:", userId, "Role:", role);

    // Security: Never allow role escalation via profile update
    if (body.role && body.role !== role) {
      return NextResponse.json({ message: "Role changes are not allowed" }, { status: 403 });
    }

    if (image) {
      await prisma.user.update({
        where: { id: userId },
        data: { image } as any,
      });
    }

    if (role === "JOBSEEKER") {
      const { bio, skills, location, experience, education, resumeUrl, portfolioUrl } = body;

      await prisma.jobSeekerProfile.upsert({
        where: { userId },
        update: { bio, skills, location, experience, education, resumeUrl, portfolioUrl } as any,
        create: {
          userId,
          bio,
          skills,
          location,
          experience,
          education,
          resumeUrl,
          portfolioUrl,
        } as any,
      });
    } else if (role === "EMPLOYER") {
      const { companyName, description, location, website, portfolioUrl } = body;

      await prisma.employerProfile.upsert({
        where: { userId },
        update: { companyName, description, location, website, portfolioUrl } as any,
        create: {
          userId,
          companyName,
          description,
          location,
          website,
          portfolioUrl,
        } as any,
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
