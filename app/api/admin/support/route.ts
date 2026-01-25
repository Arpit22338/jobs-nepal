import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

// SECURITY: Strict input validation schema
const updateTicketSchema = z.object({
  ticketId: z.string().min(1).max(100),
  reply: z.string().min(1).max(5000).trim(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const tickets = await (prisma as any).supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } }
  });

  return NextResponse.json(tickets);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { ticketId, reply } = updateTicketSchema.parse(body);

    // SECURITY: Verify ticket exists before updating
    const existingTicket = await (prisma as any).supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = await (prisma as any).supportTicket.update({
      where: { id: ticketId },
      data: { 
        reply,
        status: "CLOSED"
      },
    });

    // Notify user
    const replySnippet = reply.length > 50 ? reply.substring(0, 50) + "..." : reply;
    await (prisma as any).notification.create({
      data: {
        userId: ticket.userId,
        content: `Support: Admin replied to "${ticket.subject}": ${replySnippet}`,
        type: "SUPPORT",
        link: "/support",
      },
    });

    // Send email notification
    const user = await prisma.user.findUnique({
      where: { id: ticket.userId },
      select: { email: true },
    });

    if (user?.email) {
      const { sendNotificationEmail } = await import("@/lib/mail");
      await sendNotificationEmail(
        user.email,
        `Admin replied to your support ticket "${ticket.subject}": ${replySnippet}`,
        "SUPPORT",
        "/support"
      ).catch(err => console.error("Failed to send notification email:", err));
    }

    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Support ticket update error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
