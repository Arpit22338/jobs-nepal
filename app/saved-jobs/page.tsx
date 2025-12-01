import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Briefcase } from "lucide-react";
import DeleteSavedJobButton from "@/components/DeleteSavedJobButton"; // I'll create this component

export default async function SavedJobsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const savedJobs = await prisma.savedJob.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      job: {
        include: {
          employer: {
            include: {
              employerProfile: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Saved Jobs</h1>
      
      <div className="grid gap-6">
        {savedJobs.length === 0 ? (
          <p className="text-gray-500">You haven&apos;t saved any jobs yet.</p>
        ) : (
          savedJobs.map(({ job }) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition relative">
              <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
                      {job.title}
                    </Link>
                  </h2>
                  <Link href={`/profile/${job.employerId}`} className="text-gray-600 mt-1 hover:underline hover:text-blue-600 block">
                    {job.employer.employerProfile?.companyName || job.employer.name}
                  </Link>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {job.type}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase size={16} className="mr-1" />
                  {job.type}
                </div>
                {job.salary && (
                  <div className="flex items-center">
                    <span className="mr-1 font-bold">Rs.</span>
                    {job.salary}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                    href={`/jobs/${job.id}`}
                    className="text-blue-600 font-medium hover:text-blue-800 text-sm"
                    >
                    View Details &rarr;
                    </Link>
                </div>
                <DeleteSavedJobButton jobId={job.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
