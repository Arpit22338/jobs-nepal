import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

// SECURITY: Strict input validation schema
const updateKycSchema = z.object({
  id: z.string().min(1).max(100),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  adminNote: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const records = await prisma.kycRecord.findMany({
    orderBy: { createdAt: "desc" },
    include: { teacher: { select: { name: true, email: true, phoneNumber: true, qrCodeUrl: true } } }
  });

  return NextResponse.json(records);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { id, status, adminNote } = updateKycSchema.parse(body);

    // SECURITY: Verify record exists before updating
    const existingRecord = await prisma.kycRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const record = await prisma.kycRecord.update({
      where: { id },
      data: { status, adminNote: adminNote || null },
    });

    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("KYC update error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
