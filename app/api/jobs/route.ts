import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
  salary: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  type: z.string(),
  requiredSkills: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only employers can post jobs" }, { status: 403 });
    }

    // Check limits for Non-Premium Users
    const isMegaPremium = (user as any).isMegaPremium;
    if (!user.isPremium && !isMegaPremium) {
      const jobCount = await prisma.job.count({
        where: { employerId: user.id },
      });

      if (jobCount >= 1) {
        return NextResponse.json({ 
          error: "Free plan limit reached (1 job). Upgrade to Premium to post more jobs." 
        }, { status: 403 });
      }
    }

    const body = await req.json();
    const validatedData = jobSchema.parse(body);

    // Set expiry for non-premium users (24 hours)
    const expiresAt = (user.isPremium || isMegaPremium) ? null : new Date(Date.now() + 24 * 60 * 60 * 1000);
    // Prompt says: "Mega badge on employer profile and job posts." "Search boost".
    // Let's set isPremium = true if user is premium.

    const job = await prisma.job.create({
      data: {
        ...validatedData,
        employerId: user.id,
        expiresAt: expiresAt,
        isPremium: user.isPremium || isMegaPremium,
        isFeatured: isMegaPremium, // Example logic
      } as any,
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    const minSalary = searchParams.get("minSalary");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: Prisma.JobWhereInput = {
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      ]
    };

    if (q) {
      (whereClause.AND as any[]).push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { employer: { employerProfile: { companyName: { contains: q, mode: "insensitive" } } } }
        ]
      });
    }

    if (location) {
      (whereClause.AND as any[]).push({
        location: { contains: location, mode: "insensitive" }
      });
    }

    if (type) {
      (whereClause.AND as any[]).push({
        type: { equals: type, mode: "insensitive" }
      });
    }

    if (minSalary) {
      // This assumes salaryMin is populated. If not, it might miss legacy jobs.
      // For MVP, we filter on salaryMin if it exists.
      (whereClause.AND as any[]).push({
        salaryMin: { gte: parseInt(minSalary) }
      });
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        include: {
          employer: {
            include: {
              employerProfile: true,
            },
          },
        },
        orderBy: [
          { isFeatured: "desc" } as any, // Featured/Mega jobs first
          { isPremium: "desc" } as any,  // Premium jobs second
          { createdAt: "desc" }
        ],
        skip,
        take: limit,
      }),
      prisma.job.count({ where: whereClause })
    ]);

    return NextResponse.json({ jobs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
