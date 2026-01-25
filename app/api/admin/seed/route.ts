import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

// SECURITY: This endpoint requires a secret key for admin seeding
// The key should be set in environment variables and only used during initial setup
export async function GET(req: Request) {
  try {
    // Security: Require secret key from environment
    const { searchParams } = new URL(req.url);
    const secretKey = searchParams.get("key");
    
    const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET;
    
    // Block if no secret is configured or key doesn't match
    if (!ADMIN_SEED_SECRET || secretKey !== ADMIN_SEED_SECRET) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Security: Get credentials from environment variables, not hardcoded
    const email = process.env.ADMIN_EMAIL;
    const rawPassword = process.env.ADMIN_PASSWORD;

    if (!email || !rawPassword) {
      return NextResponse.json({ message: "Admin credentials not configured in environment" }, { status: 500 });
    }

    const password = await hash(rawPassword, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN",
        password: password,
        isVerified: true,
      },
      create: {
        email,
        name: "Admin",
        password,
        role: "ADMIN",
        isVerified: true,
      },
    });

    // Don't expose user details in response
    return NextResponse.json({ message: "Admin user seeded successfully" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ message: "Error seeding admin" }, { status: 500 });
  }
}
