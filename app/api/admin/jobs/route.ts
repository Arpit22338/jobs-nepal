import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: { employerId: session.user.id },
      select: {
        id: true,
        title: true,
        location: true,
        createdAt: true,
        views: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Admin jobs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch admin jobs" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { employerId: true }
    });

    if (!job || job.employerId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.job.delete({ where: { id: jobId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin job delete error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
