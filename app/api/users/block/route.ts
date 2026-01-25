import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const blockSchema = z.object({
    userId: z.string().min(1, "User ID required"),
});

// POST /api/users/block - Block a user
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = blockSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { userId: blockedUserId } = validation.data;
        const userId = (session.user as { id: string }).id;

        // Can't block yourself
        if (blockedUserId === userId) {
            return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
        }

        // Check if user exists
        const userToBlock = await prisma.user.findUnique({
            where: { id: blockedUserId },
        });

        if (!userToBlock) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already blocked
        const existingBlock = await prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: userId,
                    blockedId: blockedUserId,
                },
            },
        });

        if (existingBlock) {
            return NextResponse.json({ error: "User already blocked" }, { status: 400 });
        }

        // Create block record
        await prisma.blockedUser.create({
            data: {
                blockerId: userId,
                blockedId: blockedUserId,
            },
        });

        // Delete any existing messages between users
        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: blockedUserId },
                    { senderId: blockedUserId, receiverId: userId },
                ],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Block user error:", error);
        return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
    }
}

// DELETE /api/users/block - Unblock a user
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const blockedUserId = searchParams.get("userId");

        if (!blockedUserId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const userId = (session.user as { id: string }).id;

        await prisma.blockedUser.deleteMany({
            where: {
                blockerId: userId,
                blockedId: blockedUserId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unblock user error:", error);
        return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
    }
}

// GET /api/users/block - Get blocked users list
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;

        const blockedUsers = await prisma.blockedUser.findMany({
            where: { blockerId: userId },
            include: {
                blocked: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json({
            blockedUsers: blockedUsers.map(b => b.blocked),
        });
    } catch (error) {
        console.error("Get blocked users error:", error);
        return NextResponse.json({ error: "Failed to get blocked users" }, { status: 500 });
    }
}
