import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import PublicProfileClient from "./PublicProfileClient";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        select: { name: true, role: true }
    });

    if (!user) return { title: "Profile Not Found" };

    const roleText = user.role === "JOBSEEKER" ? "Job Seeker" : user.role === "EMPLOYER" ? "Employer" : "Teacher";

    return {
        title: `${user.name} | ${roleText} Profile`,
        description: `View the professional profile of ${user.name} on Rojgaar Nepal. Connect for job and freelancing opportunities.`,
    };
}

export default async function PublicProfilePage({ params }: Props) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        notFound();
    }

    return <PublicProfileClient />;
}
