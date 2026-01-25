import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/messages/conversation?userId=xxx - Delete all messages in a conversation
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const otherUserId = searchParams.get("userId");

        if (!otherUserId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const userId = (session.user as any).id;

        // Delete all messages between the two users
        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete conversation error:", error);
        return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
    }
}
