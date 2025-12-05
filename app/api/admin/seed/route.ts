import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    const email = "rojgaarnepall@gmail.com";
    const password = await hash("Arpit@2065", 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN",
        password: password,
        isVerified: true, // Ensure admin is verified
      },
      create: {
        email,
        name: "Arpit Kafle",
        password,
        role: "ADMIN",
        isVerified: true,
      },
    });

    return NextResponse.json({ message: "Admin user seeded successfully", user });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ message: "Error seeding admin", error }, { status: 500 });
  }
}
