import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, isPremium, durationDays } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: any = { isPremium };

    if (isPremium && durationDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays));
      updateData.premiumExpiresAt = expiresAt;
      updateData.isVerified = true; // Auto-verify premium users
    } else if (!isPremium) {
      updateData.premiumExpiresAt = null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling premium:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
