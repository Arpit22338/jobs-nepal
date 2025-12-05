import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const { isBanned } = await req.json();
  
  await prisma.user.update({
    where: { id },
    data: { isBanned }
  });

  return NextResponse.json({ message: "User updated" });
}
