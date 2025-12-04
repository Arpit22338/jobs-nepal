import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "@/lib/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function checkProfileCompletion(userId: string, role: string) {
  if (role === "JOBSEEKER") {
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
    });
    if (!profile) return false;
    // Check if essential fields are filled
    return !!(profile.skills && profile.location && profile.experience);
  } else if (role === "EMPLOYER") {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!profile) return false;
    return !!(profile.companyName && profile.location && profile.description);
  }
  return true; // Admin or other roles
}
