import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);

    if (!userId || userId === "undefined") {
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
        _count: {
          select: { receivedTrusts: true }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let isTrusted = false;
    if (session?.user?.id) {
      const trust = await prisma.trust.findUnique({
        where: {
          trusterId_trustedId: {
            trusterId: session.user.id,
            trustedId: userId,
          },
        },
      });
      isTrusted = !!trust;
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

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      profile: profileData,
      trustCount: user._count.receivedTrusts,
      isTrusted
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
