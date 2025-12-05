import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        course: {
          select: {
            title: true,
            instructor: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
