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

    const { targetJobId, targetUserId, reason } = await req.json();
    
    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    if (!targetJobId && !targetUserId) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetJobId,
        targetUserId,
        reason,
      },
    });

    return NextResponse.json({ success: true, message: "Report submitted successfully" });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
