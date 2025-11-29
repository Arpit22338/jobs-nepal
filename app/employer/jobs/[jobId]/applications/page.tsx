import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
        <Link href="/employer/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Applications for {job.title}</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {job.applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No applications received yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {job.applications.map((application) => (
              <li key={application.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
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
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                          {application.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">{application.user.email}</p>
                      <div className="mt-1 flex space-x-2">
                        <Link
                          href={`/profile/${application.user.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Profile
                        </Link>
                        {application.user.jobSeekerProfile?.resumeUrl && (
                          <a
                            href={application.user.jobSeekerProfile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/messages/${application.user.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Message
                    </Link>
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
