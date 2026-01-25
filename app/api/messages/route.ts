import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import * as z from "zod";

// SECURITY: Input validation schemas
const messageSchema = z.object({
  receiverId: z.string().min(1).max(100),
  content: z.string().min(1).max(5000).trim(),
});

const markReadSchema = z.object({
  senderId: z.string().min(1).max(100),
});

// Simple rate limiting for messages
const messageRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MESSAGE_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MESSAGE_RATE_LIMIT_MAX = 30; // 30 messages per minute

function isMessageRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = messageRateLimitMap.get(userId);
  
  if (!record || now > record.resetTime) {
    messageRateLimitMap.set(userId, { count: 1, resetTime: now + MESSAGE_RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MESSAGE_RATE_LIMIT_MAX) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("userId");

  if (otherUserId) {
    // SECURITY: Validate userId format
    if (otherUserId.length > 100) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }

    // Get messages between current user and specific user
    const messages = await (prisma as any).message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: { sender: true, receiver: true },
    });

    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, image: true, lastActivityAt: true } as any,
    });

    return NextResponse.json({ messages, otherUser });
  } else {
    // Get list of conversations with details (last message, unread count)
    const allMessages = await (prisma as any).message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { sender: true, receiver: true },
    });

    const conversationMap = new Map();

    for (const msg of allMessages) {
      const otherUser = msg.senderId === session.user.id ? msg.receiver : msg.sender;
      const otherUserId = otherUser.id;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      const conv = conversationMap.get(otherUserId);
      // Count unread messages for the current user
      if (msg.receiverId === session.user.id && !msg.isRead) {
        conv.unreadCount++;
      }
    }

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({ conversations });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // SECURITY: Rate limiting
  if (isMessageRateLimited(session.user.id)) {
    return NextResponse.json({ message: "Too many messages. Please slow down." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { receiverId, content } = messageSchema.parse(body);

    // SECURITY: Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, email: true, name: true },
    });

    if (!receiver) {
      return NextResponse.json({ message: "Recipient not found" }, { status: 404 });
    }

    // SECURITY: Prevent sending to self
    if (receiverId === session.user.id) {
      return NextResponse.json({ message: "Cannot send message to yourself" }, { status: 400 });
    }

    const message = await (prisma as any).message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
    });

    // Update last activity
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActivityAt: new Date() },
    });

    // Create notification
    await (prisma as any).notification.create({
      data: {
        userId: receiverId,
        content: `New message from ${session.user.name}`,
        type: "MESSAGE",
        link: `/messages/${session.user.id}`,
      },
    });

    // Send email notification
    if (receiver?.email) {
      const { sendNotificationEmail } = await import("@/lib/mail");
      await sendNotificationEmail(
        receiver.email,
        `New message from ${session.user.name}`,
        "MESSAGE",
        `/messages/${session.user.id}`
      ).catch(err => console.error("Failed to send notification email:", err));
    }

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    console.error("Message creation error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { senderId } = markReadSchema.parse(body);

    // Mark all messages from senderId to current user as read
    await (prisma as any).message.updateMany({
      where: {
        senderId: senderId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Update last activity
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    console.error("Mark read error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
