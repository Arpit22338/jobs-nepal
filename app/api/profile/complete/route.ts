import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { skills, location, experience } = await req.json();

        // Validate required fields
        if (!skills || skills.length === 0) {
            return NextResponse.json({ error: "At least one skill is required" }, { status: 400 });
        }
        if (!location || location.trim() === "") {
            return NextResponse.json({ error: "Location is required" }, { status: 400 });
        }

        // Upsert JobSeekerProfile
        await prisma.jobSeekerProfile.upsert({
            where: { userId: session.user.id },
            update: {
                skills: Array.isArray(skills) ? skills.join(", ") : skills,
                location: location.trim(),
                experience: experience?.trim() || null,
            },
            create: {
                userId: session.user.id,
                skills: Array.isArray(skills) ? skills.join(", ") : skills,
                location: location.trim(),
                experience: experience?.trim() || null,
            },
        });

        // Mark profile as complete
        await prisma.user.update({
            where: { id: session.user.id },
            data: { isProfileComplete: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile completion error:", error);
        return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }
}
