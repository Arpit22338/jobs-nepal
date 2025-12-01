"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Briefcase, MessageSquare } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  jobSeekerProfile: {
    bio: string | null;
    skills: string | null;
    location: string | null;
  } | null;
  employerProfile: {
    companyName: string | null;
    description: string | null;
    location: string | null;
  } | null;
}

export default function PeoplePage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");

  // Debounce search
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (role) params.set("role", role);
        
        const res = await fetch(`/api/users/search?${params.toString()}`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [query, role]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Community</h1>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-2.5 md:top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48 relative">
            <div className="absolute right-3 top-2.5 md:top-3 pointer-events-none text-gray-500">
              <Briefcase size={18} />
            </div>
            <select
              className="w-full pl-3 pr-10 py-2 md:py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 appearance-none cursor-pointer text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ALL">All Profiles</option>
              <option value="JOBSEEKER">Job Seekers</option>
              <option value="EMPLOYER">Employers</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-10">Loading profiles...</div>
        ) : users.length === 0 ? (
          <p className="col-span-full text-gray-500 text-center py-10">No profiles found.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    <Link href={`/profile/${user.id}`} className="hover:text-blue-600">
                      {user.name}
                    </Link>
                  </h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'EMPLOYER' ? 'Employer' : 'Job Seeker'}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-sm text-gray-600 mb-4">
                {user.role === 'EMPLOYER' && user.employerProfile?.companyName && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    <span className="font-medium">{user.employerProfile.companyName}</span>
                  </div>
                )}
                
                {(user.jobSeekerProfile?.location || user.employerProfile?.location) && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{user.jobSeekerProfile?.location || user.employerProfile?.location}</span>
                  </div>
                )}

                {user.role === 'JOBSEEKER' && user.jobSeekerProfile?.skills && (
                   <div className="flex flex-wrap gap-1 mt-2">
                     {/* Handle both JSON string and comma-separated string */}
                     {(() => {
                        let skills: string[] = [];
                        try {
                            const parsed = JSON.parse(user.jobSeekerProfile.skills);
                            if (Array.isArray(parsed)) skills = parsed.map((s: { name: string }) => s.name);
                            else skills = [user.jobSeekerProfile.skills];
                        } catch {
                            skills = user.jobSeekerProfile.skills.split(',').map(s => s.trim());
                        }
                        return skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                {skill}
                            </span>
                        ));
                     })()}
                   </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t flex gap-2">
                <Link
                  href={`/profile/${user.id}`}
                  className="flex-1 text-center py-2 border rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  View Profile
                </Link>
                <Link
                  href={`/messages/${user.id}`}
                  className="flex-1 text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  Message
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
