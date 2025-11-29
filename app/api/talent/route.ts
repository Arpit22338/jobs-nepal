import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const talentPostSchema = z.object({
  title: z.string().min(5),
  bio: z.string().min(10),
  skills: z.string().min(2),
});

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const body = await req.json();
    const { title, bio, skills } = talentPostSchema.parse(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const post = await (prisma as any).talentPost.upsert({
      where: { userId: session.user.id },
      update: { title, bio, skills },
      create: {
        userId: session.user.id,
        title,
        bio,
        skills,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ message: "Invalid input", errors: (error as any).errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
