"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Search, ArrowRight, Star, MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SaveJobButton from "@/components/SaveJobButton";
import RecommendedJobs from "@/components/RecommendedJobs";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  salary: string | null;
  employerId: string;
  employer: {
    name: string | null;
    employerProfile: {
      companyName: string;
    } | null;
  };
}

function JobsContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  // Fetch saved jobs
  useEffect(() => {
    if (session?.user) {
      fetch("/api/jobs/save")
        .then((res) => res.json())
        .then((data) => {
          if (data.savedJobIds) {
            setSavedJobIds(data.savedJobIds);
          }
        })
        .catch((err) => console.error("Failed to fetch saved jobs", err));
    }
  }, [session]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (location) params.set("location", location);
      if (type) params.set("type", type);

      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  }, [query, location, type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4">
      <div className="text-center md:text-left space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Find Your <span className="text-gradient">Professional Path</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Browse through hundreds of high-quality verified job opportunities in Nepal.
        </p>
      </div>

      <RecommendedJobs />

      {/* Search & Filters */}
      <div className="glass-card p-6 rounded-3xl shadow-xl border-white/40">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Search</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                className="w-full pl-12 pr-4 py-3.5 bg-accent/20 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-background transition-all text-foreground font-medium placeholder:text-muted-foreground/60"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Location</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="City or Remote"
                className="w-full pl-12 pr-4 py-3.5 bg-accent/20 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-background transition-all text-foreground font-medium placeholder:text-muted-foreground/60"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full lg:w-48 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <Briefcase size={20} />
              </div>
              <select
                className="w-full pl-12 pr-10 py-3.5 bg-accent/20 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-background transition-all text-foreground font-medium appearance-none cursor-pointer"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      {/* Job List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Finding the best roles for you...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl p-10">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">No matches found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">We couldn't find any jobs matching your current search. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="glass-card p-6 md:p-8 rounded-3xl group hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-2xl font-black text-primary group-hover:bg-primary/10 transition-colors shadow-sm">
                        {job.employer.employerProfile?.companyName?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                          <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                        </h2>
                        <Link href={`/profile/${job.employerId}`} className="text-muted-foreground font-bold hover:text-primary hover:underline transition-colors flex items-center gap-1.5 mt-0.5">
                          {job.employer.employerProfile?.companyName || job.employer.name}
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 text-foreground/80 text-xs font-bold border border-border/40">
                        <MapPin size={14} className="text-primary" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/50 text-blue-700 text-xs font-bold border border-blue-200/50">
                        <Briefcase size={14} />
                        {job.type}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100/50 text-green-700 text-xs font-bold border border-green-200/50">
                          <span className="font-black text-[10px]">NPR</span> {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <SaveJobButton jobId={job.id} initialSaved={savedJobIds.includes(job.id)} />
                      <Link href={`/messages/${job.employerId}`} className="p-3 rounded-2xl bg-accent hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                        <MessageCircle size={20} />
                      </Link>
                    </div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex-1 md:flex-none text-center bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3 rounded-2xl transition-all shadow-md hover:shadow-primary/20"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold opacity-50">Loading Opportunities...</div>}>
      <JobsContent />
    </Suspense>
  );
}
