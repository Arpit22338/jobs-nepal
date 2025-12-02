import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const { ticketId, reply } = await req.json();

  const ticket = await (prisma as any).supportTicket.update({
    where: { id: ticketId },
    data: { 
      reply,
      status: "CLOSED"
    },
  });

  // Notify user
  await (prisma as any).notification.create({
    data: {
      userId: ticket.userId,
      content: `Support: Admin replied to your ticket "${ticket.subject}"`,
      link: "/support", // Or a specific ticket view if we had one
    },
  });

  return NextResponse.json(ticket);
}
