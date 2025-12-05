"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function RecommendedJobs() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/jobs/recommendations")
        .then(res => res.json())
        .then(data => setJobs(data.jobs || []))
        .catch(err => console.error(err));
    }
  }, [session]);

  if (!session || jobs.length === 0) return null;

  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Recommended for You</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map(job => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
            <p className="text-sm text-gray-600 truncate">{job.employer.employerProfile?.companyName || job.employer.name}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{job.location}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{job.type}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
