import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const requests = await (prisma as any).premiumRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } }
  });

  return NextResponse.json(requests);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const { id, status, durationDays } = await req.json();

  const request = await (prisma as any).premiumRequest.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED") {
    const now = new Date();
    const expiresAt = new Date();
    let isPremium = false;
    let jobLimitIncrement = 0;
    let talentLimitIncrement = 0;

    // Determine benefits based on plan type
    switch (request.planType) {
      case "15_UPLOADS":
        // Just increase limits, no premium badge
        jobLimitIncrement = 15;
        talentLimitIncrement = 15;
        // Validity 30 days for the pack usage? Or just one time? 
        // Prompt says "for 30 days", implying the pack expires or the status lasts 30 days.
        // But usually upload packs are permanent until used. 
        // However, prompt says "200 for 15 upload pack for 30 days".
        // Let's set expiration for 30 days but NOT set isPremium/isVerified.
        expiresAt.setDate(now.getDate() + 30);
        break;
      
      case "7_DAYS":
        isPremium = true;
        expiresAt.setDate(now.getDate() + 7);
        break;

      case "30_DAYS":
        isPremium = true;
        expiresAt.setDate(now.getDate() + 30);
        break;

      case "75_DAYS":
        isPremium = true;
        expiresAt.setDate(now.getDate() + 75);
        break;

      case "6_MONTHS":
        isPremium = true;
        expiresAt.setDate(now.getDate() + 180);
        break;

      default:
        // Fallback to manual duration if provided, or default 30
        expiresAt.setDate(now.getDate() + (durationDays || 30));
        isPremium = true;
    }

    const updateData: any = {
      premiumExpiresAt: expiresAt,
    };

    if (isPremium) {
      updateData.isPremium = true;
      updateData.isVerified = true;
      // Unlimited posts for premium? Or high limit?
      // Prompt says "Unlimited Job/Talent Posts" for premium plans.
      // We can set a very high number or handle "unlimited" logic in posting route.
      // For now, let's set a high number like 1000.
      updateData.jobLimit = 1000;
      updateData.talentLimit = 1000;
    }

    if (jobLimitIncrement > 0) {
      updateData.jobLimit = { increment: jobLimitIncrement };
      updateData.talentLimit = { increment: talentLimitIncrement };
    }

    await prisma.user.update({
      where: { id: request.userId },
      data: updateData,
    });

    // Create Notification
    await (prisma as any).notification.create({
      data: {
        userId: request.userId,
        content: `Your Premium Request for ${request.planType} has been APPROVED!`,
        link: "/profile",
      },
    });
  } else if (status === "REJECTED") {
     // Create Notification
     await (prisma as any).notification.create({
      data: {
        userId: request.userId,
        content: `Your Premium Request for ${request.planType} was rejected. Please contact support.`,
        link: "/premium",
      },
    });
  }

  return NextResponse.json(request);
}
