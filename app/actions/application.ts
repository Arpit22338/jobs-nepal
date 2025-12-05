"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendApplicationStatusEmail } from "@/lib/mail";

export async function updateApplicationStatus(applicationId: string, status: "PENDING" | "REVIEWING" | "SHORTLISTED" | "ACCEPTED" | "REJECTED") {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  try {
    // Verify ownership
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, user: true },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    // Allow Employer who owns the job OR Admin
    if (application.job.employerId !== session.user.id && session.user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    // Notify Job Seeker
    await (prisma as any).notification.create({
      data: {
        userId: application.userId,
        content: `Your application for ${application.job.title} has been ${status.toLowerCase()}`,
        link: `/my-applications`,
      },
    });

    // Send Email
    if (application.user.email) {
        await sendApplicationStatusEmail(application.user.email, application.job.title, status);
    }

    revalidatePath(`/employer/jobs/${application.job.id}/applications`);
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { error: "Failed to update status" };
  }
}
