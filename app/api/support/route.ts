import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await (prisma as any).supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        message,
      },
    });

    return NextResponse.json({ message: "Ticket created" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
