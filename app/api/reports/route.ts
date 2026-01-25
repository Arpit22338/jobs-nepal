import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

// SECURITY: Input validation schema
const reportSchema = z.object({
  targetJobId: z.string().min(1).max(100).optional(),
  targetUserId: z.string().min(1).max(100).optional(),
  reason: z.string().min(10).max(1000).trim(),
}).refine(data => data.targetJobId || data.targetUserId, {
  message: "Either targetJobId or targetUserId is required",
});

// Rate limiting for reports
const reportRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const REPORT_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const REPORT_RATE_LIMIT_MAX = 10; // 10 reports per hour

function isReportRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = reportRateLimitMap.get(userId);
  
  if (!record || now > record.resetTime) {
    reportRateLimitMap.set(userId, { count: 1, resetTime: now + REPORT_RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= REPORT_RATE_LIMIT_MAX) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // SECURITY: Rate limiting
    if (isReportRateLimited(session.user.id)) {
      return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { targetJobId, targetUserId, reason } = reportSchema.parse(body);

    // SECURITY: Prevent self-reporting
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
    }

    // SECURITY: Verify target exists
    if (targetJobId) {
      const job = await prisma.job.findUnique({ where: { id: targetJobId } });
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
    }
    if (targetUserId) {
      const user = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // SECURITY: Check for duplicate reports
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        targetJobId: targetJobId || undefined,
        targetUserId: targetUserId || undefined,
      },
    });

    if (existingReport) {
      return NextResponse.json({ error: "You have already reported this" }, { status: 409 });
    }

    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetJobId: targetJobId || null,
        targetUserId: targetUserId || null,
        reason,
      },
    });

    return NextResponse.json({ success: true, message: "Report submitted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
