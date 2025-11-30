"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(applicationId: string, status: "ACCEPTED" | "REJECTED") {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "EMPLOYER") {
    return { error: "Unauthorized" };
  }

  try {
    // Verify ownership
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    if (application.job.employerId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    revalidatePath(`/employer/jobs/${application.job.id}/applications`);
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { error: "Failed to update status" };
  }
}
