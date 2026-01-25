import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ valid: false, message: "Certificate ID is required" }, { status: 400 });
        }

        // Clean the ID (remove CERT- prefix if present)
        const cleanId = id.replace(/^CERT-/i, '').trim();

        const certificate = await prisma.certificate.findUnique({
            where: { id: cleanId },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        if (!certificate) {
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({
            valid: true,
            certificate: {
                id: certificate.id,
                holderName: certificate.user.name || "Anonymous",
                courseTitle: certificate.course.title,
                score: certificate.score,
                issuedAt: certificate.issuedAt,
            },
        });
    } catch (error) {
        console.error("Certificate validation error:", error);
        return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
    }
}
