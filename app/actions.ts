"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTrust(trustedId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trusterId = session.user.id;

  if (trusterId === trustedId) {
    throw new Error("Cannot trust yourself");
  }

  const existingTrust = await prisma.trust.findUnique({
    where: {
      trusterId_trustedId: {
        trusterId,
        trustedId,
      },
    },
  });

  if (existingTrust) {
    await prisma.trust.delete({
      where: {
        trusterId_trustedId: {
          trusterId,
          trustedId,
        },
      },
    });
    revalidatePath(`/profile/${trustedId}`);
    return { trusted: false };
  } else {
    await prisma.trust.create({
      data: {
        trusterId,
        trustedId,
      },
    });

    // Send notification message
    await prisma.message.create({
      data: {
        senderId: trusterId,
        receiverId: trustedId,
        content: "I trust you!",
      },
    });

    revalidatePath(`/profile/${trustedId}`);
    return { trusted: true };
  }
}

export async function applyForJob(jobId: string, employerId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if already applied
  const existingApplication = await prisma.application.findFirst({
    where: {
      jobId,
      userId,
    },
  });

  if (existingApplication) {
    return { success: false, message: "You have already applied for this job." };
  }

  // Create application
  await prisma.application.create({
    data: {
      jobId,
      userId,
      status: "PENDING",
    },
  });

  // Fetch job details for the message
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { title: true }
  });

  const jobTitle = job?.title || "this job";

  // Send notification message to employer
  await prisma.message.create({
    data: {
      senderId: userId,
      receiverId: employerId,
      content: `I applied for your job: ${jobTitle}`,
    },
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/my-applications");
  return { success: true, message: "Application submitted successfully!" };
}

export async function deleteJob(jobId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.employerId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.job.delete({
    where: { id: jobId },
  });

  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  
  console.log("Delete User Action - Session:", session?.user);
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    console.log("Unauthorized delete attempt");
    throw new Error("Unauthorized");
  }

  try {
    // Delete related records first if necessary (Prisma cascade should handle most)
    // But let's be explicit about what we are deleting to debug
    console.log("Deleting user:", userId);
    
    await prisma.user.delete({
      where: { id: userId },
    });
    
    console.log("User deleted successfully");
    revalidatePath("/admin/dashboard");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function deleteQuestion(questionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { job: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // Allow deletion if:
  // 1. User is the author of the question
  // 2. User is the employer (job owner)
  // 3. User is ADMIN
  const isAuthor = question.userId === session.user.id;
  const isEmployer = question.job.employerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isEmployer && !isAdmin) {
    throw new Error("Unauthorized");
  }

  await prisma.question.delete({
    where: { id: questionId },
  });

  revalidatePath(`/jobs/${question.jobId}`);
}

export async function deleteMessage(messageId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  // Allow deletion if user is the sender
  // (Optional: Allow receiver to delete? Usually only sender can "unsend" or delete for themselves)
  // For now, let's allow sender to delete.
  if (message.senderId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.message.delete({
    where: { id: messageId },
  });
  
  // We can't easily revalidate the specific chat page from here since we don't know the other user's ID easily without fetching more data,
  // but the client-side polling in ChatPage will pick up the change.
}
