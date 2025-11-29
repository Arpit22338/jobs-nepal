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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profileData: any = {};
    if (user.role === "JOBSEEKER" && user.jobSeekerProfile) {
      profileData = { ...user.jobSeekerProfile, image: user.image };
    } else if (user.role === "EMPLOYER" && user.employerProfile) {
      profileData = { ...user.employerProfile, image: user.image };
    } else {
      profileData = { image: user.image };
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { role, id: userId } = session.user as any;
    const { image } = body;

    console.log("Updating profile for:", userId, "Role:", role);
    console.log("Update data:", body);

    if (image) {
      await prisma.user.update({
        where: { id: userId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { image } as any,
      });
    }

    if (role === "JOBSEEKER") {
      const { bio, skills, location, experience, education, resumeUrl } = body;
      
      await prisma.jobSeekerProfile.upsert({
        where: { userId },
        update: { bio, skills, location, experience, education, resumeUrl },
        create: {
          userId,
          bio,
          skills,
          location,
          experience,
          education,
          resumeUrl,
        },
      });
    } else if (role === "EMPLOYER") {
      const { companyName, description, location, website } = body;

      await prisma.employerProfile.upsert({
        where: { userId },
        update: { companyName, description, location, website },
        create: {
          userId,
          companyName,
          description,
          location,
          website,
        },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
