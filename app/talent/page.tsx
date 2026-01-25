"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, MapPin, Search, SlidersHorizontal, X, Briefcase } from "lucide-react";
import DeleteTalentButton from "@/components/DeleteTalentButton";

interface TalentPost {
  id: string;
  title: string;
  bio: string;
  skills: string;
  userId: string;
  user: {
    name: string | null;
    image: string | null;
    jobSeekerProfile: {
      location: string | null;
    } | null;
  };
}

export default function TalentPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<TalentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const popularLocations = ["Remote", "Kathmandu", "Lalitpur", "Pokhara", "Bhaktapur"];
  const popularSkills = ["JavaScript", "Python", "Design", "Marketing", "Writing"];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/talent");
        const data = await res.json();
        setPosts(data.posts);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch talent posts", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Use useMemo instead of useEffect + setState for derived state
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.bio.toLowerCase().includes(query) ||
          post.skills.toLowerCase().includes(query) ||
          post.user.name?.toLowerCase().includes(query)
      );
    }

    if (locationFilter) {
      result = result.filter((post) =>
        post.user.jobSeekerProfile?.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    return result;
  }, [searchQuery, locationFilter, posts]);

  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("");
  };

  const hasActiveFilters = searchQuery || locationFilter;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Find <span className="text-gradient">Talent</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Discover skilled professionals ready to work on your projects.
          </p>
        </div>
        {session?.user.role === "JOBSEEKER" && (
          <Link
            href="/talent/new"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Post Your Profile
          </Link>
        )}
      </div>

      {/* Modern Search & Filters */}
      <div className="space-y-4">
        {/* Main Search Bar */}
        <div className="glass-card p-4 rounded-2xl shadow-lg border-white/40">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by name, skills, or title..."
                className="w-full pl-12 pr-4 py-3.5 bg-accent/30 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground font-medium placeholder:text-muted-foreground/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3.5 rounded-xl border transition-all ${showFilters || hasActiveFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-accent/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
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
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
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
                <div className="flex flex-wrap gap-2">
                  {popularLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocationFilter(locationFilter === loc ? "" : loc)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        locationFilter === loc
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Skills */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Briefcase size={14} />
                  Popular Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setSearchQuery(skill)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        searchQuery === skill
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Pills */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="hover:bg-primary/20 rounded p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
            {locationFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 text-xs font-bold rounded-lg">
                <MapPin size={12} />
                {locationFilter}
                <button onClick={() => setLocationFilter("")} className="hover:bg-blue-500/20 rounded p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-muted-foreground font-medium">
          Showing <span className="text-foreground font-bold">{filteredPosts.length}</span> talent{filteredPosts.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Talent Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Finding talent...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full text-center py-20 glass-card rounded-3xl p-10">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">No talent found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              {hasActiveFilters ? "Try adjusting your filters to see more results." : "No talent posts available yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="glass-card p-6 rounded-2xl group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <Link href={`/profile/${post.userId}`} className="shrink-0">
                  {post.user.image ? (
                    <Image
                      src={post.user.image}
                      alt={post.user.name || "User"}
                      width={56}
                      height={56}
                      className="rounded-2xl object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                      unoptimized
                    />
                  ) : (
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User size={24} className="text-primary" />
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${post.userId}`} className="font-bold text-foreground hover:text-primary transition-colors truncate">
                      {post.user.name}
                    </Link>
                    {(session?.user.id === post.userId || session?.user.role === "ADMIN") && (
                      <DeleteTalentButton postId={post.id} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium truncate">{post.title}</p>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {post.skills.split(",").slice(0, 4).map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                    {skill.trim()}
                  </span>
                ))}
                {post.skills.split(",").length > 4 && (
                  <span className="px-2.5 py-1 bg-accent text-muted-foreground text-xs font-bold rounded-lg">
                    +{post.skills.split(",").length - 4} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center text-sm text-muted-foreground font-medium">
                  <MapPin size={14} className="mr-1 text-primary" />
                  {post.user.jobSeekerProfile?.location || "Nepal"}
                </div>
                {session && (
                  <Link
                    href={`/messages/${post.userId}`}
                    className="text-primary text-sm font-bold hover:underline"
                  >
                    Message
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
