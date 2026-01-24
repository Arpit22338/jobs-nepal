"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sparkles, MapPin } from "lucide-react";

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
    <div className="glass-card p-6 md:p-8 rounded-3xl border-primary/20 bg-primary/5 mb-8 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-primary animate-pulse" size={24} />
        <h2 className="text-xl font-black text-foreground">Recommended for You</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map(job => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="block glass-card p-5 rounded-2xl hover:border-primary/40 hover:bg-background transition-all hover:scale-[1.02] shadow-sm">
            <h3 className="font-bold text-foreground truncate mb-1">{job.title}</h3>
            <p className="text-sm text-muted-foreground truncate font-medium mb-4">{job.employer.employerProfile?.companyName || job.employer.name}</p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <MapPin size={12} className="text-primary" />
                {job.location}
              </div>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{job.type}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
