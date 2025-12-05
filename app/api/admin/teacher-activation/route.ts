import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const requests = await prisma.teacherActivationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { teacher: { select: { name: true, email: true } } }
  });

  return NextResponse.json(requests);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const { id, status, adminNote } = await req.json();

  const request = await prisma.teacherActivationRequest.update({
    where: { id },
    data: { status, adminNote },
  });

  return NextResponse.json(request);
}
