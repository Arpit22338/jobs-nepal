"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Search } from "lucide-react";
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

  // Debounce search
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Find Jobs</h1>
      </div>

      <RecommendedJobs />

      {/* Search & Filters */}
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-md border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-2.5 md:top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 relative group">
            <MapPin className="absolute left-3 top-2.5 md:top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Location"
              className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-48 relative">
             <div className="absolute right-3 top-2.5 md:top-3 pointer-events-none text-gray-500">
              <Briefcase size={18} />
            </div>
            <select
              className="w-full pl-3 pr-10 py-2 md:py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 appearance-none cursor-pointer text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-2.5 px-6 rounded-lg shadow-sm transition-colors duration-200 text-sm whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      {/* Job List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-10">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No jobs found matching your criteria.</p>
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
                <div className="flex items-center gap-3">
                    <SaveJobButton jobId={job.id} initialSaved={savedJobIds.includes(job.id)} />
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {job.type}
                    </span>
                </div>
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

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <JobsContent />
    </Suspense>
  );
}
