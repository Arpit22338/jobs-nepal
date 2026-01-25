import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId } = await params;
        const userId = (session.user as { id: string }).id;

        // Get the original job
        const originalJob = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!originalJob) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Check if user owns this job or is admin
        if (originalJob.employerId !== userId && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Create a duplicate job
        const newJob = await prisma.job.create({
            data: {
                title: originalJob.title,
                description: originalJob.description,
                location: originalJob.location,
                salary: originalJob.salary,
                type: originalJob.type,
                requiredSkills: originalJob.requiredSkills,
                employerId: userId,
                views: 0,
            },
        });

        return NextResponse.json({ job: newJob });
    } catch (error) {
        console.error("Repost job error:", error);
        return NextResponse.json({ error: "Failed to repost job" }, { status: 500 });
    }
}
