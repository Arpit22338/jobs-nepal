"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Calendar, Building2 } from "lucide-react";

interface Application {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    employer: {
      name: string;
      employerProfile: {
        companyName: string;
      } | null;
    };
  };
}

export default function MyApplicationsPage() {
  const { status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("/api/my-applications");
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications);
        }
      } catch (error) {
        console.error("Failed to fetch applications", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchApplications();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Please login to view your applications.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-green-500/10 text-green-500 dark:text-green-400";
      case "REJECTED": return "bg-red-500/10 text-red-500 dark:text-red-400";
      case "REVIEWING": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "SHORTLISTED": return "bg-purple-500/10 text-purple-500 dark:text-purple-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      <h1 className="text-3xl font-black text-foreground mb-6">My Applications</h1>
      
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border shadow-lg">
          <Briefcase size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You have not applied to any jobs yet.</p>
          <Link href="/jobs" className="text-primary font-bold hover:underline">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border shadow-lg overflow-hidden rounded-2xl">
          <ul className="divide-y divide-border">
            {applications.map((app) => (
              <li key={app.id}>
                <Link href={`/jobs/${app.job.id}`} className="block hover:bg-accent/50 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary truncate">
                        {app.job.title}
                      </p>
                      <div className="ml-2 shrink-0 flex">
                        <p className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-muted-foreground gap-1.5">
                          <Building2 size={14} />
                          {app.job.employer.employerProfile?.companyName || app.job.employer.name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-muted-foreground sm:mt-0 gap-1.5">
                        <Calendar size={14} />
                        <p>
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
