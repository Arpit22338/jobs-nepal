import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    include: {
      employer: {
        include: {
          employerProfile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Latest Jobs</h1>
        {/* Add filters here later */}
      </div>

      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No jobs found. Check back later!</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
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

              <div className="mt-4 flex items-center space-x-4">
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-blue-600 font-medium hover:text-blue-800 text-sm"
                >
                  View Details &rarr;
                </Link>
                <Link
                  href={`/messages/${job.employerId}`}
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  Message Employer
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
