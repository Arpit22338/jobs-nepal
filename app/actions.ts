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
