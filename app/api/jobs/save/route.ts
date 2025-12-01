import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await prisma.savedJob.delete({
        where: {
          id: existingSave.id,
        },
      });
      return NextResponse.json({ saved: false, message: "Job removed from saved jobs" });
    } else {
      // Save
      await prisma.savedJob.create({
        data: {
          userId,
          jobId,
        },
      });
      return NextResponse.json({ saved: true, message: "Job saved successfully" });
    }
  } catch (error) {
    console.error("Error toggling saved job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        const userId = session.user.id;
        
        // Get all saved job IDs for the user to check status on frontend
        const savedJobs = await prisma.savedJob.findMany({
            where: { userId },
            select: { jobId: true }
        });
        
        return NextResponse.json({ savedJobIds: savedJobs.map(s => s.jobId) });

    } catch (error) {
        console.error("Error fetching saved status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
