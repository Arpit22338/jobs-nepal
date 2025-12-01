import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const role = searchParams.get("role") || "";

    const whereClause: Prisma.UserWhereInput = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    if (role && role !== "ALL") {
      whereClause.role = role;
    } else {
        // Exclude ADMINs from general search usually, unless requested
        whereClause.role = { not: "ADMIN" };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        jobSeekerProfile: {
          select: {
            bio: true,
            skills: true,
            location: true,
          }
        },
        employerProfile: {
          select: {
            companyName: true,
            description: true,
            location: true,
          }
        }
      },
      take: 50,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
