"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import DeleteTalentButton from "@/components/DeleteTalentButton";

interface TalentMetadata {
  yearsExperience?: string;
  currentStatus?: string;
  availability?: string[];
  expectedSalary?: string;
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  education?: string;
  languages?: { language: string; proficiency: string }[];
  certifications?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface TalentPost {
  id: string;
  title: string;
  bio: string;
  skills: string;
  metadata?: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    jobSeekerProfile: {
      location: string | null;
    } | null;
  };
}

const experienceLevels = [
  { value: "0-2", label: "Entry (0-2 yrs)", short: "Entry" },
  { value: "2-5", label: "Mid (2-5 yrs)", short: "Mid" },
  { value: "5-10", label: "Senior (5-10 yrs)", short: "Senior" },
  { value: "10+", label: "Expert (10+ yrs)", short: "Expert" },
];

const availabilityOptions = [
  { value: "imm", label: "Available Immediately" },
  { value: "2wk", label: "2 Weeks Notice" },
  { value: "1mo", label: "1 Month Notice" },
  { value: "open", label: "Open to Opportunities" },
];

const jobTypeOptions = [
  { value: "FT", label: "Full-time" },
  { value: "PT", label: "Part-time" },
  { value: "Cont", label: "Contract/Freelance" },
  { value: "Remote", label: "Remote" },
];

const educationLevels = [
  { value: "", label: "Any" },
  { value: "HS", label: "High School" },
  { value: "BA", label: "Bachelor's" },
  { value: "MA", label: "Master's" },
  { value: "PhD", label: "PhD" },
];

const popularLocations = ["Remote", "Kathmandu", "Lalitpur", "Pokhara", "Bhaktapur", "Biratnagar"];
const popularSkills = ["JavaScript", "React", "Python", "Node.js", "Design", "Marketing", "Data Analysis", "DevOps", "Mobile Dev", "Writing"];

export default function TalentPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<TalentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedTalents, setSavedTalents] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedTalents");
      if (saved) {
        try { return JSON.parse(saved); } catch { return []; }
      }
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<"browse" | "saved">("browse");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [userIdSearch, setUserIdSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "experience" | "availability">("recent");
  
  // Filter states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const postsPerPage = 12;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/talent");
        const data = await res.json();
        setPosts(data.posts || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch talent posts", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const parseMetadata = (metadataStr?: string): TalentMetadata => {
    if (!metadataStr) return {};
    try {
      return JSON.parse(metadataStr);
    } catch {
      return {};
    }
  };

  const getExperienceLevel = (years?: string): string => {
    if (!years) return "";
    const num = parseInt(years);
    if (num <= 2) return "0-2";
    if (num <= 5) return "2-5";
    if (num <= 10) return "5-10";
    return "10+";
  };

  const getAvailabilityStatus = (availability?: string[]): { color: string; text: string } => {
    if (!availability || availability.length === 0) return { color: "bg-muted", text: "Unknown" };
    if (availability.includes("imm")) return { color: "bg-green-500", text: "Available Now" };
    if (availability.includes("open")) return { color: "bg-yellow-500", text: "Open to Opportunities" };
    return { color: "bg-blue-500", text: "Notice Period" };
  };

  // Filter logic
  const filteredPosts = useMemo(() => {
    let result = posts;

    // User ID search
    if (userIdSearch.trim()) {
      result = result.filter(post => post.userId.toLowerCase().includes(userIdSearch.toLowerCase()));
    }

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.bio.toLowerCase().includes(query) ||
        post.skills.toLowerCase().includes(query) ||
        post.user.name?.toLowerCase().includes(query)
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      result = result.filter(post => {
        const postSkills = post.skills.toLowerCase();
        return selectedSkills.some(skill => postSkills.includes(skill.toLowerCase()));
      });
    }

    // Experience filter
    if (selectedExperience.length > 0) {
      result = result.filter(post => {
        const metadata = parseMetadata(post.metadata);
        const level = getExperienceLevel(metadata.yearsExperience);
        return selectedExperience.includes(level);
      });
    }

    // Location filter
    if (selectedLocation) {
      result = result.filter(post =>
        post.user.jobSeekerProfile?.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Remote only
    if (remoteOnly) {
      result = result.filter(post => {
        const metadata = parseMetadata(post.metadata);
        return metadata.preferredLocations?.includes("Remote") ||
               post.user.jobSeekerProfile?.location?.toLowerCase().includes("remote");
      });
    }

    // Availability filter
    if (selectedAvailability.length > 0) {
      result = result.filter(post => {
        const metadata = parseMetadata(post.metadata);
        return metadata.availability?.some(a => selectedAvailability.includes(a));
      });
    }

    // Job type filter
    if (selectedJobTypes.length > 0) {
      result = result.filter(post => {
        const metadata = parseMetadata(post.metadata);
        return metadata.preferredJobTypes?.some(t => selectedJobTypes.includes(t));
      });
    }

    // Education filter
    if (selectedEducation) {
      result = result.filter(post => {
        const metadata = parseMetadata(post.metadata);
        return metadata.education === selectedEducation;
      });
    }

    // Saved talents tab
    if (activeTab === "saved") {
      result = result.filter(post => savedTalents.includes(post.id));
    }

    // Sorting
    if (sortBy === "experience") {
      result = [...result].sort((a, b) => {
        const aExp = parseInt(parseMetadata(a.metadata).yearsExperience || "0");
        const bExp = parseInt(parseMetadata(b.metadata).yearsExperience || "0");
        return bExp - aExp;
      });
    } else if (sortBy === "availability") {
      result = [...result].sort((a, b) => {
        const aAvail = parseMetadata(a.metadata).availability || [];
        const bAvail = parseMetadata(b.metadata).availability || [];
        const aScore = aAvail.includes("imm") ? 3 : aAvail.includes("open") ? 2 : 1;
        const bScore = bAvail.includes("imm") ? 3 : bAvail.includes("open") ? 2 : 1;
        return bScore - aScore;
      });
    }

    return result;
  }, [posts, searchQuery, userIdSearch, selectedSkills, selectedExperience, selectedLocation, remoteOnly, selectedAvailability, selectedJobTypes, selectedEducation, activeTab, savedTalents, sortBy]);

  // Paginated posts
  const paginatedPosts = useMemo(() => {
    const start = 0;
    const end = page * postsPerPage;
    return filteredPosts.slice(start, end);
  }, [filteredPosts, page]);

  const hasMorePosts = paginatedPosts.length < filteredPosts.length;

  const clearFilters = () => {
    setSearchQuery("");
    setUserIdSearch("");
    setSelectedSkills([]);
    setSkillInput("");
    setSelectedExperience([]);
    setSelectedLocation("");
    setRemoteOnly(false);
    setWillingToRelocate(false);
    setSelectedAvailability([]);
    setSelectedJobTypes([]);
    setSelectedEducation("");
    setVerifiedOnly(false);
    setPage(1);
  };

  const hasActiveFilters = searchQuery || userIdSearch || selectedSkills.length > 0 || selectedExperience.length > 0 || selectedLocation || remoteOnly || selectedAvailability.length > 0 || selectedJobTypes.length > 0 || selectedEducation || verifiedOnly;

  const toggleSaveTalent = (talentId: string) => {
    let updated: string[];
    if (savedTalents.includes(talentId)) {
      updated = savedTalents.filter(id => id !== talentId);
    } else {
      updated = [...savedTalents, talentId];
    }
    setSavedTalents(updated);
    localStorage.setItem("savedTalents", JSON.stringify(updated));
  };

  const addSkillFilter = (skill: string) => {
    if (skill.trim() && !selectedSkills.includes(skill.trim())) {
      setSelectedSkills([...selectedSkills, skill.trim()]);
    }
    setSkillInput("");
  };

  const removeSkillFilter = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const toggleExperience = (level: string) => {
    if (selectedExperience.includes(level)) {
      setSelectedExperience(selectedExperience.filter(e => e !== level));
    } else {
      setSelectedExperience([...selectedExperience, level]);
    }
  };

  const toggleAvailability = (avail: string) => {
    if (selectedAvailability.includes(avail)) {
      setSelectedAvailability(selectedAvailability.filter(a => a !== avail));
    } else {
      setSelectedAvailability([...selectedAvailability, avail]);
    }
  };

  const toggleJobType = (type: string) => {
    if (selectedJobTypes.includes(type)) {
      setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
    } else {
      setSelectedJobTypes([...selectedJobTypes, type]);
    }
  };

  const filteredSkillSuggestions = popularSkills.filter(s =>
    s.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(s)
  ).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            Find <span className="text-primary">Talent</span>
          </h1>
          <p className="text-muted-foreground mt-1">Discover skilled professionals for your projects</p>
        </div>
        <div className="flex gap-3">
          {session?.user?.role === "JOBSEEKER" && (
            <Link href="/talent/new" className="px-5 py-2.5 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
              <i className="bx bx-plus-circle text-lg"></i> Post Your Profile
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("browse")} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === "browse" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}>
          <i className="bx bx-search-alt mr-2"></i> Browse Talent
        </button>
        <button onClick={() => setActiveTab("saved")} className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === "saved" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}>
          <i className="bx bx-bookmark mr-1"></i> Saved
          {savedTalents.length > 0 && <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full text-xs">{savedTalents.length}</span>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:w-80 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <i className="bx bx-filter-alt text-primary"></i> Filters
              </h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                  <i className="bx bx-x"></i> Clear All
                </button>
              )}
            </div>

            {/* User ID Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <i className="bx bx-id-card text-primary"></i> Search by User ID
              </label>
              <div className="flex gap-2">
                <input type="text" value={userIdSearch} onChange={(e) => setUserIdSearch(e.target.value)} placeholder="e.g. clxyz123..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <i className="bx bx-code-alt text-primary"></i> Skills
              </label>
              <div className="relative">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillFilter(skillInput); } }} placeholder="Type skill..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50" />
                {skillInput && filteredSkillSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                    {filteredSkillSuggestions.map(skill => (
                      <button key={skill} type="button" onClick={() => addSkillFilter(skill)} className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-foreground">{skill}</button>
                    ))}
                  </div>
                )}
              </div>
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedSkills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {skill}
                      <button onClick={() => removeSkillFilter(skill)}><i className="bx bx-x"></i></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {popularSkills.slice(0, 6).filter(s => !selectedSkills.includes(s)).map(skill => (
                  <button key={skill} type="button" onClick={() => addSkillFilter(skill)} className="px-2 py-1 text-xs bg-accent text-muted-foreground rounded-full hover:bg-accent/80 hover:text-foreground transition-colors">
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <i className="bx bx-trending-up text-primary"></i> Experience Level
              </label>
              <div className="space-y-1.5">
                {experienceLevels.map(level => (
                  <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedExperience.includes(level.value)} onChange={() => toggleExperience(level.value)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <i className="bx bx-map text-primary"></i> Location
              </label>
              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50">
                <option value="">All Locations</option>
                {popularLocations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}
              </select>
              <div className="space-y-1.5 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-foreground">Remote only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={willingToRelocate} onChange={(e) => setWillingToRelocate(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-foreground">Willing to relocate</span>
                </label>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <i className="bx bx-time text-primary"></i> Availability
              </label>
              <div className="space-y-1.5">
                {availabilityOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedAvailability.includes(opt.value)} onChange={() => toggleAvailability(opt.value)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Type Preference */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <i className="bx bx-briefcase text-primary"></i> Job Type Preference
              </label>
              <div className="space-y-1.5">
                {jobTypeOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedJobTypes.includes(opt.value)} onChange={() => toggleJobType(opt.value)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <i className="bx bxs-graduation text-primary"></i> Education
              </label>
              <select value={selectedEducation} onChange={(e) => setSelectedEducation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50">
                {educationLevels.map(level => (<option key={level.value} value={level.value}>{level.label}</option>))}
              </select>
            </div>

            {/* Verified Profiles */}
            <div className="pt-4 border-t border-border">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <i className="bx bx-check-shield text-primary"></i> Verified Profiles Only
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${verifiedOnly ? "bg-primary" : "bg-muted"}`} onClick={() => setVerifiedOnly(!verifiedOnly)}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${verifiedOnly ? "left-5" : "left-0.5"}`}></div>
                </div>
              </label>
            </div>

            {/* Apply Filters Button - Mobile */}
            <div className="lg:hidden pt-4 border-t border-border">
              <button onClick={() => setShowFilters(false)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold">
                Apply Filters ({filteredPosts.length} results)
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Bar & Controls */}
          <div className="bg-card rounded-2xl border border-border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl"></i>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by skills, job title, location..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
              </div>
              
              {/* Controls */}
              <div className="flex gap-2">
                {/* Mobile Filter Toggle */}
                <button onClick={() => setShowFilters(!showFilters)} className={`lg:hidden p-3 rounded-xl border transition-all ${showFilters ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  <i className="bx bx-filter-alt text-xl"></i>
                </button>
                
                {/* Sort */}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50">
                  <option value="recent">Most Recent</option>
                  <option value="experience">Experience (High-Low)</option>
                  <option value="availability">Availability</option>
                </select>
                
                {/* View Mode */}
                <div className="hidden md:flex border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode("grid")} className={`p-3 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    <i className="bx bx-grid-alt text-xl"></i>
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-3 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    <i className="bx bx-list-ul text-xl"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground font-medium">Active:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery("")}><i className="bx bx-x"></i></button>
                  </span>
                )}
                {userIdSearch && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">
                    ID: {userIdSearch}
                    <button onClick={() => setUserIdSearch("")}><i className="bx bx-x"></i></button>
                  </span>
                )}
                {selectedSkills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                    {skill}
                    <button onClick={() => removeSkillFilter(skill)}><i className="bx bx-x"></i></button>
                  </span>
                ))}
                {selectedLocation && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">
                    <i className="bx bx-map text-xs"></i> {selectedLocation}
                    <button onClick={() => setSelectedLocation("")}><i className="bx bx-x"></i></button>
                  </span>
                )}
                {remoteOnly && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">
                    Remote Only
                    <button onClick={() => setRemoteOnly(false)}><i className="bx bx-x"></i></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing <span className="text-foreground font-bold">{paginatedPosts.length}</span> of <span className="text-foreground font-bold">{filteredPosts.length}</span> talent{filteredPosts.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Finding talent...</p>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-user-x text-4xl text-muted-foreground"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No talent found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                {activeTab === "saved" ? "You haven't saved any talent profiles yet." : hasActiveFilters ? "Try adjusting your filters to see more results." : "No talent posts available yet."}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedPosts.map(post => {
                    const metadata = parseMetadata(post.metadata);
                    const availStatus = getAvailabilityStatus(metadata.availability);
                    const isSaved = savedTalents.includes(post.id);
                    
                    return (
                      <div key={post.id} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <Link href={`/profile/${post.userId}`} className="shrink-0">
                            {post.user.image ? (
                              <Image src={post.user.image} alt={post.user.name || "User"} width={56} height={56} className="rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors" unoptimized />
                            ) : (
                              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <i className="bx bx-user text-2xl text-primary"></i>
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/profile/${post.userId}`} className="font-bold text-foreground hover:text-primary transition-colors truncate">{post.user.name}</Link>
                              {(session?.user?.id === post.userId || session?.user?.role === "ADMIN") && <DeleteTalentButton postId={post.id} />}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{post.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`w-2 h-2 rounded-full ${availStatus.color}`}></span>
                              <span className="text-xs text-muted-foreground">{availStatus.text}</span>
                            </div>
                          </div>
                        </div>

                        {/* Location & Experience */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <i className="bx bx-map"></i> {post.user.jobSeekerProfile?.location || "Nepal"}
                          </span>
                          {metadata.yearsExperience && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <i className="bx bx-briefcase"></i> {metadata.yearsExperience} yrs
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.skills.split(",").slice(0, 4).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">{skill.trim()}</span>
                          ))}
                          {post.skills.split(",").length > 4 && (
                            <span className="px-2 py-0.5 bg-accent text-muted-foreground text-xs rounded-full">+{post.skills.split(",").length - 4}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-border">
                          <Link href={`/profile/${post.userId}`} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold text-center hover:bg-primary/90 transition-colors">
                            View Profile
                          </Link>
                          <button onClick={() => toggleSaveTalent(post.id)} className={`p-2 rounded-xl border transition-colors ${isSaved ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"}`}>
                            <i className={`bx ${isSaved ? "bxs-bookmark" : "bx-bookmark"} text-xl`}></i>
                          </button>
                          {session && (
                            <Link href={`/messages/${post.userId}`} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                              <i className="bx bx-message-rounded-dots text-xl"></i>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {paginatedPosts.map(post => {
                    const metadata = parseMetadata(post.metadata);
                    const availStatus = getAvailabilityStatus(metadata.availability);
                    const isSaved = savedTalents.includes(post.id);
                    
                    return (
                      <div key={post.id} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Left: Avatar */}
                          <Link href={`/profile/${post.userId}`} className="shrink-0">
                            {post.user.image ? (
                              <Image src={post.user.image} alt={post.user.name || "User"} width={80} height={80} className="rounded-2xl object-cover border-2 border-border" unoptimized />
                            ) : (
                              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <i className="bx bx-user text-3xl text-primary"></i>
                              </div>
                            )}
                          </Link>
                          
                          {/* Middle: Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link href={`/profile/${post.userId}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors">{post.user.name}</Link>
                              <span className={`w-2.5 h-2.5 rounded-full ${availStatus.color}`}></span>
                              <span className="text-xs text-muted-foreground">{availStatus.text}</span>
                            </div>
                            <p className="text-muted-foreground font-medium mb-2">{post.title}</p>
                            
                            <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1"><i className="bx bx-map text-primary"></i> {post.user.jobSeekerProfile?.location || "Nepal"}</span>
                              {metadata.yearsExperience && <span className="inline-flex items-center gap-1"><i className="bx bx-briefcase text-primary"></i> {metadata.yearsExperience} years exp</span>}
                              {metadata.education && <span className="inline-flex items-center gap-1"><i className="bx bxs-graduation text-primary"></i> {metadata.education === "BA" ? "Bachelor's" : metadata.education === "MA" ? "Master's" : metadata.education}</span>}
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.bio}</p>
                            
                            <div className="flex flex-wrap gap-1.5">
                              {post.skills.split(",").slice(0, 6).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">{skill.trim()}</span>
                              ))}
                              {post.skills.split(",").length > 6 && (
                                <span className="px-2 py-0.5 bg-accent text-muted-foreground text-xs rounded-full">+{post.skills.split(",").length - 6} more</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div className="flex md:flex-col gap-2 shrink-0">
                            <Link href={`/profile/${post.userId}`} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold text-center hover:bg-primary/90 transition-colors flex items-center gap-2">
                              <i className="bx bx-user"></i> View Profile
                            </Link>
                            <div className="flex gap-2">
                              <button onClick={() => toggleSaveTalent(post.id)} className={`flex-1 md:flex-none p-2.5 rounded-xl border transition-colors ${isSaved ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"}`}>
                                <i className={`bx ${isSaved ? "bxs-bookmark" : "bx-bookmark"} text-xl`}></i>
                              </button>
                              {session && (
                                <Link href={`/messages/${post.userId}`} className="flex-1 md:flex-none p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center">
                                  <i className="bx bx-message-rounded-dots text-xl"></i>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More */}
              {hasMorePosts && (
                <div className="text-center mt-8">
                  <button onClick={() => setPage(page + 1)} className="px-8 py-3 rounded-xl bg-card border border-border text-foreground font-bold hover:bg-accent hover:border-primary/50 transition-all">
                    <i className="bx bx-loader-circle mr-2"></i> Load More ({filteredPosts.length - paginatedPosts.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
