"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Search, ArrowRight, MessageCircle, SlidersHorizontal, X, Clock } from "lucide-react";
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

  const [showFilters, setShowFilters] = useState(false);
  const jobTypes = ["Full-time", "Part-time", "Freelance", "Internship", "Contract"];
  const popularLocations = ["Remote", "Kathmandu", "Lalitpur", "Pokhara", "Bhaktapur"];

  const clearFilters = () => {
    setQuery("");
    setLocation("");
    setType("");
  };

  const hasActiveFilters = query || location || type;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      <div className="text-center md:text-left space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Find Your <span className="text-gradient">Professional Path</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Browse through hundreds of high-quality verified job opportunities in Nepal.
        </p>
      </div>

      <RecommendedJobs />

      {/* Modern Search & Filters */}
      <div className="space-y-4">
        {/* Main Search Bar */}
        <div className="glass-card p-4 rounded-2xl shadow-lg border-white/40">
          <form onSubmit={handleSearch} className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                className="w-full pl-12 pr-4 py-3.5 bg-accent/30 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground font-medium placeholder:text-muted-foreground/60"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3.5 rounded-xl border transition-all ${showFilters || hasActiveFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-accent/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            >
              <SlidersHorizontal size={20} />
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 hidden sm:flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </form>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="glass-card p-5 rounded-2xl shadow-lg border-white/40 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-destructive hover:text-destructive/80 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MapPin size={14} />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter city or area..."
                  className="w-full px-4 py-3 bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground font-medium placeholder:text-muted-foreground/60"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {popularLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        location === loc
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Briefcase size={14} />
                  Job Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((jobType) => (
                    <button
                      key={jobType}
                      type="button"
                      onClick={() => setType(type === jobType ? "" : jobType)}
                      className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                        type === jobType
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground border border-border/50'
                      }`}
                    >
                      {jobType === "Full-time" && <Clock size={14} />}
                      {jobType === "Freelance" && <Briefcase size={14} />}
                      {jobType}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchJobs}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all sm:hidden"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Active Filter Pills */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active:</span>
            {query && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                &quot;{query}&quot;
                <button onClick={() => setQuery("")} className="hover:bg-primary/20 rounded p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-bold rounded-lg">
                <MapPin size={12} />
                {location}
                <button onClick={() => setLocation("")} className="hover:bg-blue-500/20 rounded p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
            {type && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 dark:text-green-400 text-xs font-bold rounded-lg">
                <Briefcase size={12} />
                {type}
                <button onClick={() => setType("")} className="hover:bg-green-500/20 rounded p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
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
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">We couldn&apos;t find any jobs matching your current search. Try adjusting your filters.</p>
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
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
                        <Briefcase size={14} />
                        {job.type}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 text-xs font-bold border border-green-500/20">
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
