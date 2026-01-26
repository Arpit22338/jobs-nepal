import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ApplicationStatusControls from "@/components/ApplicationStatusControls";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface Props {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobApplicationsPage({ params }: Props) {
  const { jobId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      applications: {
        include: {
          user: {
            include: {
              jobSeekerProfile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Assuming Application has createdAt, if not we might need to check schema
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  if (job.employerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/employer/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/employer/dashboard" className="text-primary hover:text-primary/80 mb-4 inline-flex items-center gap-2 font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Applications for {job.title}</h1>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
        {job.applications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No applications received yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {job.applications.map((application) => (
              <li key={application.id} className="p-6 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0">
                      {application.user.image ? (
                        <Image
                          src={application.user.image}
                          alt={application.user.name || "Applicant"}
                          width={50}
                          height={50}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold">
                          {application.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        {application.user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{application.user.email}</p>
                      <div className="mt-1 flex space-x-2">
                        <Link
                          href={`/profile/${application.user.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View Profile
                        </Link>
                        {application.user.jobSeekerProfile?.resumeUrl && (
                          <a
                            href={application.user.jobSeekerProfile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Resume
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/messages/${application.user.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors"
                      >
                        <MessageSquare size={14} /> Message
                      </Link>
                      <ApplicationStatusControls 
                        applicationId={application.id} 
                        currentStatus={application.status} 
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
