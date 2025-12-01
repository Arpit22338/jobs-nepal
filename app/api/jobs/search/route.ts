import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const location = searchParams.get("location") || "";
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  const skip = (page - 1) * pageSize;

  // Build the where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (type) {
    where.type = type;
  }

  // Note: Salary is currently a string in the schema ("salary String?").
  // To filter by minSalary properly, we would ideally need a numeric field.
  // For now, we can try to filter if the string matches, but numeric comparison on string fields is tricky.
  // If you want robust salary filtering, we should migrate salary to Int or Float, or store min/max separately.
  // For this implementation, I will skip salary filtering on the DB level if it's a string, 
  // or we can attempt a basic check if the user enters an exact match, but that's poor UX.
  // Let's assume for now we just return the jobs and maybe the frontend can filter, 
  // OR we can leave it out until the schema is updated to numeric.
  // However, the requirement asked for it. 
  // If the schema has `salary String?`, I will omit the numeric filter for now to avoid crashing,
  // unless we change the schema. I will stick to the existing schema as requested ("Assume Prisma Job model has...").
  
  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            include: {
              employerProfile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error searching jobs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
