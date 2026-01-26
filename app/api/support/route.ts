import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

// OWASP A03: Input validation schema
const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject too long"),
  message: z.string().min(20, "Message must be at least 20 characters").max(5000, "Message too long"),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 3600000 }); // 1 hour window
    return true;
  }
  if (limit.count >= 5) return false; // 5 tickets per hour
  limit.count++;
  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await (prisma as any).supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // OWASP A04: Rate limiting
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ message: "Too many tickets. Please wait before submitting another." }, { status: 429 });
  }

  // Check if user is premium
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true }
  });

  if (!user?.isPremium) {
    return NextResponse.json({ message: "Only for premium users" }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    // OWASP A03: Input validation
    const { subject, message } = ticketSchema.parse(body);

    await (prisma as any).supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        message,
      },
    });

    return NextResponse.json({ message: "Ticket created" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
