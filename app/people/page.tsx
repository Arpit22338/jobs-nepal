"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Briefcase, MessageSquare, Crown } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isPremium?: boolean;
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
        <h1 className="text-3xl font-bold text-foreground">Community</h1>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 md:p-5 rounded-xl border border-border/50">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-2.5 md:top-3 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48 relative">
            <div className="absolute right-3 top-2.5 md:top-3 pointer-events-none text-muted-foreground">
              <Briefcase size={18} />
            </div>
            <select
              className="w-full pl-3 pr-10 py-2 md:py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none cursor-pointer text-sm"
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
          <div className="col-span-full text-center py-10 text-muted-foreground">Loading profiles...</div>
        ) : users.length === 0 ? (
          <p className="col-span-full text-muted-foreground text-center py-10">No profiles found.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 group flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 shrink-0">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-accent flex items-center justify-center text-muted-foreground text-xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground line-clamp-1 flex items-center gap-1">
                    <Link href={`/profile/${user.id}`} className="hover:text-primary transition-colors">
                      {user.name}
                    </Link>
                    {user.isPremium && <Crown size={16} className="text-yellow-500" fill="currentColor" />}
                  </h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'EMPLOYER' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                    {user.role === 'EMPLOYER' ? 'Employer' : 'Job Seeker'}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-sm text-muted-foreground mb-4">
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
                        <span key={i} className="bg-accent text-muted-foreground px-2 py-0.5 rounded text-xs">
                          {skill}
                        </span>
                      ));
                    })()}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
                <Link
                  href={`/profile/${user.id}`}
                  className="flex-1 text-center py-2 border border-border rounded-xl hover:bg-accent text-sm font-medium transition-colors text-foreground"
                >
                  View Profile
                </Link>
                <Link
                  href={`/messages/${user.id}`}
                  className="flex-1 text-center py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
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
