import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

// SECURITY: Strict input validation schema
const updateRequestSchema = z.object({
  id: z.string().min(1).max(100),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  adminNote: z.string().max(1000).optional(),
});

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

  try {
    const body = await req.json();
    const { id, status, adminNote } = updateRequestSchema.parse(body);

    // SECURITY: Verify request exists before updating
    const existingRequest = await prisma.teacherActivationRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const request = await prisma.teacherActivationRequest.update({
      where: { id },
      data: { status, adminNote: adminNote || null },
    });

    return NextResponse.json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Teacher activation update error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
